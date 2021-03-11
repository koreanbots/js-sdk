import fetch from "node-fetch"
import { getVersionRoute } from "./getRoute"
import Utils from "../util"
import LRU from "lru-cache"
import { version, snowflakeRegex } from "../util/Constants"
import AbortController, { AbortSignal } from "abort-controller"
import https from "https"
import { KoreanbotsAPIError } from "./KoreanbotsAPIError"
import { EventEmitter } from "events"

import type {
    Version, FetchResponse, APIClientOptions, InternalFetchCache,
    ProxyValidator, ValueOf
} from "../structures/core"
import type { RequestInit, Response } from "node-fetch"


const defaultCacheMaxSize = 250
const defaultCacheMaxAge = 60000 * 5
const defaultRetryLimit = 5
const defaultRequestTimeout = 15_000
const defaultApiVersion = 2
const defaultNoWarning = false
const defaultUnstableOption = false


class APIClient extends EventEmitter {
    protected readonly headers!: Record<string, string>
    public readonly version!: Version
    public readonly baseUri!: string
    public readonly token!: string
    public options: APIClientOptions
    public cache: LRU<string, FetchResponse>
    private _internals: Set<InternalFetchCache>
    private _timeouts: Set<NodeJS.Timeout | number>
    private _agent?: https.Agent
    private _destroyed: boolean
    private _retries: Set<{ id: AbortSignal, retry: number }>

    protected static validator = <T>(): ProxyValidator<T> => ({
        set: (obj: T, prop: keyof T, value: ValueOf<T>) => {
            switch (prop) {
            case "token":
                if (typeof value !== "string") throw new TypeError(`"token" 옵션은 숫자여야 합니다. (받은 타입: ${typeof value})`)

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

    constructor(options: APIClientOptions) {
        super()

        this.options = options ?? {}
        const optionsProxy = new Proxy(this.options, APIClient.validator<APIClientOptions>())

        optionsProxy.token = options.token
        optionsProxy.version = options.version ?? defaultApiVersion
        // TODO(zero734kr): stop using warning and use event emitter
        optionsProxy.noWarning = options.noWarning ?? defaultNoWarning
        optionsProxy.cacheOptions = options.cacheOptions ?? { max: defaultCacheMaxSize, maxAge: defaultCacheMaxAge }
        optionsProxy.requestTimeout = options.requestTimeout ?? defaultRequestTimeout
        optionsProxy.retryLimit = options.retryLimit ?? defaultRetryLimit
        optionsProxy.unstable = options.unstable ?? defaultUnstableOption

        /**
         * API를 향한 요청들의 캐시
         */
        this.cache = new LRU<string, FetchResponse>(this.options.cacheOptions)

        this._destroyed = false

        this._internals = new Set<InternalFetchCache>()
        this._timeouts = new Set<NodeJS.Timeout | number>()
        this._agent = https.Agent ? new https.Agent({ keepAlive: !this._destroyed }) : void 0
        this._retries = new Set<{ id: AbortSignal, retry: number }>()

        this.setupReadonly(options)
    }

    private setupReadonly(options: APIClientOptions) {
        Object.defineProperties(this, {
            version: {
                writable: false,
                value: this.options.version
            },
            baseUri: {
                writable: false,
                value: getVersionRoute(this.options.version, this.options.unstable)
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
        this._internals.clear()
        this._retries.clear()

        this.removeAllListeners()
    }

    async request<T = unknown>(method: string, url: string, options?: RequestInit): Promise<FetchResponse<T>> {
        const controller = new AbortController()
        const timeout = this.setTimeout(() => {
            this.emit("timeout", {
                url,
                method,
                [Symbol("requestOptions")]: options
            })
            controller.abort()
        }, this.options.requestTimeout)
        const mergedOptions: RequestInit = {
            ...options,
            headers: this.headers,
            method,
            agent: this._agent,
            signal: controller.signal
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (this.cache.get(url) && (Date.now() - this.cache.get(url)!.updatedTimestamp!) <= 5000)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.cache.get(url)! as FetchResponse<T>

        let res: T
        let r: Response
        try {
            const response = await fetch(`${this.baseUri}${encodeURI(url)}`, mergedOptions)

            res = await response.json()
            r = response
        } finally {
            this.clearTimeout(timeout)
        }

        if ((r.status >= 400 || r.status < 600) && r.status !== 429 && r.status !== 404) {
            const { retry } = [...this._retries].find(e => e.id === controller.signal) ?? { retry: 0 }

            if (retry >= this.options.retryLimit) throw new KoreanbotsAPIError(
                // @ts-expect-error check
                `올바르지 않은 응답이 반환 되었습니다. ${res.data?.message || JSON.stringify(res.data)}`,
                r.status,
                method,
                url
            )
            this._retries.add({ id: controller.signal, retry: retry + 1 })
        }

        // TODO(zero734kr): bypass this and add to 'this._internals' if is global rate limit
        if (r.status === 429) {
            const delay = parseInt(r.headers.get("x-ratelimit-reset") ?? "0")
            const isGlobal = Boolean(r.headers.get("x-ratelimit-global"))

            this.emit("rateLimit", {
                isGlobal,
                path: url,
                method,
                limit: parseInt(r.headers.get("x-ratelimit-limit") ?? "0"),
                retryAfter: parseInt(r.headers.get("x-ratelimit-reset") ?? "0"),
                [Symbol("requestOptions")]: options
            })

            // handle endpoint specific rate limit
            if (!isGlobal) {
                if (delay === 0) return this.request(method, url, options)

                await Utils.waitFor(delay + 1000)
                return this.request(method, url, options)
            }

            // handle global rate limit from here
            // if global rate limit handler is already started
            this.scheduleRequests(delay)

            this._internals.add({
                method,
                url,
                options
            })

            return {
                code: 429,
                data: null,
                message: `Rate limited ${isGlobal ? "globally" : `from ${url}`}`,
                isCache: false,
                ratelimitRemaining: 0,
                url
            }
        }

        const response = {
            code: r.status,
            // @ts-expect-error generic
            data: res?.data ? res?.data : res,
            // @ts-expect-error generic
            message: res?.message,
            isCache: false,
            ratelimitRemaining: parseInt(r.headers.get("x-ratelimit-remaining") ?? "0"),
            url
        }

        if (method === "GET" && r.status === 200) this.cache.set(url, {
            ...response,
            isCache: true,
            updatedTimestamp: Date.now()
        })

        return response
    }

    private scheduleRequests(delay: number) {
        if (this._internals.size === 0) {
            // change to other task (or the first global rate limited request will be freezed waiting for return)
            process.nextTick(async () => {
                await Utils.waitFor(delay + 1000)

                // store requests informations inside 'this._internals' cache and retry
                await Promise.allSettled(
                    [...this._internals].map(({ method, url, options }) => (
                        this.request(method, url, options)
                    ))
                )
            })
        }
    }
}

export default APIClient
