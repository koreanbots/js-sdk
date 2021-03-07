import fetch from "node-fetch"
import { getVersionRoute } from "./getRoute"
import Utils from "../util"
import LRU from "lru-cache"
import { version } from "../util/Constants"
import AbortController, { AbortSignal } from "abort-controller"
import https from "https"
import { FetchError } from "./FetchError"
import buildRoute from "./APIRouter"

import type { Version, FetchResponse, APIClientOptions, InternalFetchCache } from "../structures/core"
import type { RequestInit, Response } from "node-fetch"


type ValueOf<T> = T[keyof T]

const snowflakeRegex = /\d{16,19}/g
const defaultCacheMaxSize = 250
const defaultCacheMaxAge = 60000 * 5
const defaultRetryLimit = 5
const defaultRequestTimeout = 15_000
const defaultApiVersion = 2
const defaultNoWarning = false

const handler = <T>() => ({
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
            if (value <= 0) throw new RangeError(`"requestTimeout" 옵션은 0보다 커야 합니다. (받은 값: ${value}, 최소 '${1 - value}' 작음)`)
            break
        }

        obj[prop] = value
        return true
    }
})

class APIClient {
    protected readonly headers!: Record<string, string>
    public readonly version!: Version
    public readonly baseUri!: string
    public readonly token!: string
    public options: APIClientOptions
    public cache: LRU<string, FetchResponse>
    private _internals: Set<InternalFetchCache>
    private _timeouts: Set<NodeJS.Timeout | number>
    private _agent?: https.Agent
    private _retries: { id: AbortSignal, retry: number }[]
    protected api: ReturnType<typeof buildRoute>

    constructor(options: APIClientOptions) {
        this.options = options ?? {}
        const optionsProxy = new Proxy(this.options, handler<APIClientOptions>())

        optionsProxy.token = options.token
        optionsProxy.version = options.version ?? defaultApiVersion
        optionsProxy.noWarning = options.noWarning ?? defaultNoWarning
        optionsProxy.cacheOptions = options.cacheOptions ?? { max: defaultCacheMaxSize, maxAge: defaultCacheMaxAge }
        optionsProxy.requestTimeout = options.requestTimeout ?? defaultRequestTimeout
        optionsProxy.retryLimit = options.retryLimit ?? defaultRetryLimit

        Object.defineProperties(this, {
            version: {
                writable: false,
                value: this.options.version
            },
            baseUri: {
                writable: false,
                value: getVersionRoute(this.options.version)
            },
            token: {
                writable: false,
                value: this.options.token
            },
            headers: {
                writable: false,
                value: {
                    authorization: this.token,
                    "Content-Type": "application/json",
                    "User-Agent": `js-sdk/${version}`
                }
            }
        })

        /**
         * API를 향한 요청들의 캐시
         */
        this.cache = new LRU<string, FetchResponse>(this.options.cacheOptions)

        /**
         * API 라우트 빌더
         */
        this.api = buildRoute(this)

        this._internals = new Set<InternalFetchCache>()
        this._timeouts = new Set<NodeJS.Timeout | number>()
        this._agent = https.Agent ? new https.Agent({ keepAlive: true }) : void 0
        this._retries = []
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

    async request<T = unknown>(method: string, url: string, options?: RequestInit): Promise<FetchResponse<T>> {
        const controller = new AbortController()
        const timeout = this.setTimeout(() => controller.abort(), this.options.requestTimeout)
        const mergedOptions: RequestInit = {
            ...options,
            method,
            agent: this._agent,
            signal: controller.signal
        }

        const [res, r]: [FetchResponse<T>, Response] = await fetch(`${this.baseUri}${encodeURI(url)}`, mergedOptions)
            .then(r => Promise.all([r.json() as Promise<FetchResponse<T>>, r]))
            .finally(() => this.clearTimeout(timeout))

        if ((r.status >= 400 || r.status < 600) && r.status !== 429 && r.status !== 404) {
            const { retry } = this._retries.find(e => e.id === controller.signal) ?? { retry: 0 }

            if (retry >= this.options.retryLimit) throw new FetchError(
                // @ts-expect-error check
                `올바르지 않은 응답이 반환 되었습니다. ${res.data.message || JSON.stringify(res.data)}`,
                r.status,
                method,
                url
            )
            this._retries.push({ id: controller.signal, retry: retry + 1 })
        }

        // TODO(zero734kr): bypass this and add to 'this._internals' if is global rate limit
        if (r.status === 429) {
            const delay = parseInt(r.headers.get("x-ratelimit-reset") ?? "0")
            if (delay === 0) throw new RangeError

            this.setTimeout(() => {
                this.request(method, url, options)
            }, delay + 1000)
        }

        return {
            status: r.status,
            data: res.data
        }
    }
}

export default APIClient
