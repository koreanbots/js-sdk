/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Dispatcher, request } from "undici"
import { EventEmitter } from "events"
import { URLSearchParams } from "url"
import { getVersionRoute, getGlobalRoute } from "./getRoute"
import * as Utils from "../utils"
import { version, snowflakeRegex, KoreanbotsInternal } from "../utils/Constants"
import { KoreanbotsAPIError } from "../utils/Errors"

import type {
    Version, FetchResponse, RequestClientOptions,
    ValueOf, RequestOptions, ProxyValidator
} from "../utils/types"
import type { HttpMethod } from "undici/types/dispatcher"

interface UndiciRequestOptions extends RequestOptions {
    method: HttpMethod
}

const defaultRetryLimit = 5
const defaultRequestTimeout = 30_000
const defaultApiVersion = 2
const defaultUnstableOption = false

class RequestClient extends EventEmitter {
    protected readonly headers!: Record<string, string>
    public readonly version!: Version
    public readonly baseUri!: string
    public readonly globalUri!: string
    public readonly token!: string
    public globalReset: null | number
    public options: RequestClientOptions
    private _timeouts: Set<NodeJS.Timeout | number>
    private _destroyed: boolean
    private _retries: Set<{ id: AbortSignal, retry: number }>

    protected static validator = <T>(): ProxyValidator<T> => ({
        set: (obj: T, prop: keyof T, value: ValueOf<T>) => {
            switch (prop) {
            case "token":
                if (typeof value !== "string") throw new TypeError(`"token" 옵션은 문자열이여야 합니다. (받은 타입: ${typeof value})`)

                // eslint-disable-next-line no-case-declarations
                const [algorithm, info] = value.split(".").map(e => {
                    const serialized = `${Buffer.from(e, "base64")}`
                    const deserializable = Utils.isJSON(serialized)

                    return deserializable ? JSON.parse(serialized) : serialized
                })

                if (algorithm.typ !== "JWT" || !snowflakeRegex.test(info.id)) throw new TypeError("주어진 \"token\" 옵션은 정상적인 KOREANBOTS JWT 토큰이 아닙니다.")
                break
            case "noWarning":
                if (typeof value !== "boolean") throw new TypeError(`"noWarning" 옵션의 타입은 boolean이여야 합니다. (받은 타입: ${typeof value})`)
                break
            case "requestTimeout":
                if (typeof value !== "number") throw new TypeError(`"requestTimeout" 옵션은 숫자여야 합니다. (받은 타입: ${typeof value})`)
                if (value <= 0) throw new RangeError(`"requestTimeout" 옵션은 0보다 커야 합니다. (받은 값: ${value}, 최소보다 '${1 - value}' 작음)`)
                break
            case "retryLimit":
                if (typeof value !== "number") throw new TypeError(`"retryLimit" 옵션은 숫자여야 합니다.  (받은 타입: ${typeof value})`)
                if (value <= 0) throw new RangeError(`"retryLimit" 옵션은 0보다 커야 합니다. (받은 값: ${value}, 최소보다 '${1 - value}' 작음)`)
                if (!Number.isSafeInteger(value)) throw new RangeError(`"retryLimit" 옵션은 32비트 정수만 허용됩니다. (받은 값: ${value})`)
                break
            case "unstable":
                if (typeof value !== "boolean") throw new TypeError(`"unstable" 옵션의 타입은 boolean이여야 합니다. (받은 타입: ${typeof value})`)
                break
            }

            obj[prop] = value
            return true
        }
    })

    constructor(options: RequestClientOptions) {
        super()

        this.options = options

        const optionsProxy = new Proxy(this.options, RequestClient.validator<RequestClientOptions>())

        optionsProxy.token = options.token
        optionsProxy.version = options.version ?? defaultApiVersion
        optionsProxy.requestTimeout = options.requestTimeout ?? defaultRequestTimeout
        optionsProxy.retryLimit = options.retryLimit ?? defaultRetryLimit
        optionsProxy.unstable = options.unstable ?? defaultUnstableOption

        this.globalReset = null

        this._destroyed = false
        this._timeouts = new Set<NodeJS.Timeout | number>()
        this._retries = new Set<{ id: AbortSignal, retry: number }>()

        this.setupReadonly(options)
    }

    public on(event: "rateLimit" | "timeout" | "request" | "serverCountUpdated", listener: (...args: unknown[]) => void): this {
        return super.on(event, listener)
    }

    private setupReadonly(options: RequestClientOptions) {
        Object.defineProperties(this, {
            version: {
                writable: false,
                value: this.options.version
            },
            baseUri: {
                writable: false,
                value: getVersionRoute(this.options.version, this.options.unstable)
            },
            globalUri: {
                writable: false,
                value: getGlobalRoute(this.options.unstable)
            },
            token: {
                writable: false,
                value: this.options.token
            },
            headers: {
                writable: false,
                value: {
                    // idk why, but here was resulting 'undefined' when is 'this.token'
                    authorization: options.token,
                    "Content-Type": "application/json",
                    "User-Agent": `js-sdk/${version}`
                }
            }
        })
    }

    /**
     * @license https://github.com/discordjs/discord.js/blob/master/LICENSE
     * @see https://github.com/discordjs/discord.js/blob/d744e51c1bdb4c7a26c0faeea1f2f45baaf5fd3c/src/client/BaseClient.js#L80
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    private setTimeout(func: Function, time: number, ...args: unknown[]) {
        const tid = setTimeout(() => {
            func(...args)
            this._timeouts.delete(tid)
        }, time)
        this._timeouts.add(tid)
        return tid
    }
    /**
     * @license https://github.com/discordjs/discord.js/blob/master/LICENSE
     * @see https://github.com/discordjs/discord.js/blob/d744e51c1bdb4c7a26c0faeea1f2f45baaf5fd3c/src/client/BaseClient.js#L93
     */
    private clearTimeout(tid: NodeJS.Timeout) {
        this._timeouts.delete(tid)
        return clearTimeout(tid)
    }

    destroy(): void {
        this._destroyed = true

        for (const timeout of [...this._timeouts]) this.clearTimeout(timeout as NodeJS.Timeout)

        this._retries.clear()

        this.removeAllListeners()
    }

    async request<T = unknown>(url: string, options?: RequestOptions): Promise<FetchResponse<T>> {
        if (this.globalReset) {
            const delayFor = this.globalReset - Date.now()

            await Utils.waitFor(delayFor)
        }

        const controller = new AbortController()
        const mergedOptions = {
            ...options,
            headers: this.headers,
            method: options?.method ?? "GET",
            signal: controller.signal
        } as UndiciRequestOptions
        const baseRoute = mergedOptions[KoreanbotsInternal]?.global
            ? this.globalUri
            : this.baseUri
        const query = typeof mergedOptions[KoreanbotsInternal]?.query === "string"
            ? `?${mergedOptions[KoreanbotsInternal]?.query}`
            : mergedOptions[KoreanbotsInternal]?.query instanceof URLSearchParams
                ? `?${mergedOptions[KoreanbotsInternal]?.query?.toString()}`
                : ""

        const fetchUrl = `${baseRoute}${encodeURI(url)}${query}`
        const timeout = this.setTimeout(() => {
            this.emit("timeout", {
                url,
                method: mergedOptions.method,
                [Symbol("requestOptions")]: options
            })
            controller.abort()
        }, this.options.requestTimeout!)

        let res: T
        let r: Dispatcher.ResponseData
        try {
            const response = await request(fetchUrl, mergedOptions)

            res = await (mergedOptions[KoreanbotsInternal]?.bodyResolver?.(response) ?? response.body.text()
                // code for debug
                .then(a => Utils.isJSON(a) ? JSON.parse(a) : (() => { throw a })())
                .catch(console.error)
            )
            r = response
        } finally {
            this.clearTimeout(timeout)
        }

        if (
            (r.statusCode >= 400 || r.statusCode < 600)
            && r.statusCode !== 429 && r.statusCode !== 404
        ) {
            const { retry } = [...this._retries].find(e => e.id === controller.signal) ?? { retry: 0 }

            if (retry >= this.options.retryLimit!) throw new KoreanbotsAPIError(
                // @ts-expect-error check
                `올바르지 않은 응답이 반환 되었습니다. ${res.data?.message || JSON.stringify(res.data)}`,
                r.statusCode,
                mergedOptions.method,
                url
            )
            this._retries.add({ id: controller.signal, retry: retry + 1 })
        }

        if (r.statusCode === 429) {
            const delay = (parseInt(r.headers["x-ratelimit-reset"] as string ?? "0") * 1000) - Date.now()
            const isGlobal = Boolean(r.headers["x-ratelimit-global"])

            this.clearTimeout(timeout)

            // request again if `this.globalReset` was already defined to handle global rate limit
            if (this.globalReset) return this.request(url, options)

            this.emit("rateLimit", {
                isGlobal,
                path: url,
                method: mergedOptions.method,
                limit: parseInt(r.headers["x-ratelimit-limit"] as string ?? "0"),
                retryAfter: parseInt(r.headers["x-ratelimit-reset"] as string ?? "0") * 1000,
                [Symbol("requestOptions")]: options
            })

            // handle endpoint specific rate limit
            if (!isGlobal) {
                if (delay === 0) return this.request(url, options)

                await Utils.waitFor(delay)
                return this.request(url, options)
            }

            this.globalReset = parseInt(r.headers["x-ratelimit-reset"] as string ?? "0") * 1000

            await Utils.waitFor(this.globalReset - Date.now())

            return this.request(url, options)
        }

        const response = {
            code: r.statusCode,
            // @ts-expect-error generic
            data: res?.data ? res?.data : res,
            // @ts-expect-error generic
            message: res?.message,
            isCache: false,
            ratelimitRemaining: parseInt(r.headers["x-ratelimit-remaining"] as string ?? "0"),
            url,
            updatedTimestamp: Date.now()
        }

        const req = {
            path: fetchUrl,
            mergedOptions
        }

        this.emit("request", req, r)

        return response
    }
}

export default RequestClient
