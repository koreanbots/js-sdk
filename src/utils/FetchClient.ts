import fetch, { HeadersInit, RequestInit, Headers } from "node-fetch"
import { FetchClientOptions, FetchResponse, GraphQLErrorResponse } from "../../typings"
import * as Utils from "./"
import { GraphQLError, InvalidResponseError, ValidationError } from "./errors"
import { Cache } from "./cache"

export class FetchClient {
    #token: Required<string>
    #headers: HeadersInit
    public options: FetchClientOptions
    public cache: Cache
    public endpointCache: Cache
    public baseURL: string

    /**
     * 
     * @param {FetchClientOptions} [options] - FetchClient의 옵션
     */
    constructor(options: FetchClientOptions) {
        /**
         * Koreanbots API에 접속할 토큰
         * @type {string}
         * @private
        */
        this.#token = options.token

        /**
         * FetchClient의 옵션
         * @type {FetchClientOptions}
         */
        this.options = options
        this.options.hideToken = options.hideToken
        this.options.token = this.options.hideToken ? Utils.hide(options.token) : options.token
        this.options.apiVersion = options.apiVersion ?? 2
        this.options.avoidRateLimit = options.avoidRateLimit ?? true
        this.options.noWarning = options.noWarning ?? false
        this.options.cacheTTL = options.cacheTTL ?? 60000

        /**
         * Koreanbots API의 기본 URL
         * @type {string}
         */
        this.baseURL = Utils.getAPI(this.options.apiVersion)

        /**
         * 기본 헤더
         * @type {Record<string, string>}
         * @private
         */
        this.#headers = {
            authorization: this.#token,
            "Content-Type": "application/json"
        }

        /**
         * 캐시
         * @type {Cache}
         */
        this.cache = new Cache(this.options.cacheTTL)

        /**
         * 엔드포인트 레이트리밋 캐시
         * @type {Cache}
         */
        this.endpointCache = new Cache(this.options.cacheTTL)

        this.validate()
    }

    /**
     * 올바른 옵션이 기입됬는지 검증합니다
     * @private
     * @returns {Promise<void>}
    */
    private async validate(): Promise<void> {
        const res = await this.fetch("/", { headers: this.#headers })

        if (res.code !== 200 && res.code !== 304) throw new InvalidResponseError("[koreanbots/FetchClient#constructor] 해당 API 버젼은 유효한 버젼이 아닙니다.")
    }

    /**
     * GraphQL 쿼리를 합니다.
     * @param {string} data - GraphQL fetch 데이터
     * @example
     * fclient.gqlFetch(`
     * {
     *     bot(id: "${client.user.id}")
     * }
     * `)
     *     .then(console.log)
     *     .catch(console.error)
     */
    async gqlFetch(data: string): Promise<FetchResponse> {
        if((this.options.apiVersion ?? 2) < 2) throw new ValidationError("[koreanbots/FetchClient#gqlFetch] 'gqlFetch' 함수는 Koreanbots API v1에서 사용할수 없습니다.")

        const obj = {
            query: `
            ${data}
            `
        }

        const res = await this.fetch("/graphql", {
            method: "POST",
            headers: {
                ...this.#headers,
                "Content-Type": "application/json",
                "Real-HTTP-Method": (obj.query.includes("mutation {") || obj.query.includes("mutation {")) ? "POST" : "GET"
            },
            body: JSON.stringify(obj)
        })

        return res
    }

    /**
     * Koreanbots API에 요청을 합니다.
     * @param {string} endpoint - Koreanbots 엔드포인트
     * @param {RequestInit} [opt] - Fetch 옵션
     * @example
     * fclient.fetch("/")
     *     .then(async r => console.log(await r.json()))
     *     .catch(console.error)
     */
    async fetch(endpoint: string, opt?: RequestInit): Promise<FetchResponse> {
        const options = { ...opt, headers: { ...opt?.headers, ...this.#headers } }
        const realMethod = (endpoint === "/graphql"
            ? options?.headers instanceof Headers
                ? options.headers.get("Real-HTTP-Method")
                : typeof options?.headers === "object"
                    // @ts-ignore
                    ? options.headers["Real-HTTP-Method"]
                    : options?.headers
            : (options?.method ?? "GET"))

        if (
            this.options.avoidRateLimit
            && this.endpointCache.get(endpoint)
            && parseInt(this.endpointCache.get(endpoint), 10) <= 10
            && this.cache.get(endpoint)
        ) return this.cache.get(endpoint)

        if (
            this.cache.get(endpoint)
            && (Date.now() - this.cache.get(endpoint).updatedTimestamp) <= 5000
            && options?.body === this.cache.get(endpoint).requestedBody
        ) return this.cache.get(endpoint)

        const r = await fetch(`${this.baseURL}${encodeURI(endpoint)}`, options)
        const text = await r.text()
        const json = Utils.isJSON(text) ? JSON.parse(text) : text

        const data: FetchResponse = {
            code: r.status,
            statusText: r.statusText,
            data: json.data,
            message: json.message,
            isCache: false,
            ratelimitRemaining: parseInt(r.headers.get("x-ratelimit-remaining") ?? ""),
            endpoint, updatedTimestamp: void 0, errors: json.errors ?? []
        }

        if (Array.isArray(json.errors) && json.errors.length > 0) data.errors = json.errors

        if (r.status === 429) {
            if (!this.options.noWarning) process.emitWarning(`Rate limited from ${r.url}`, "RateLimitWarning")

            if (this.cache.has(endpoint) && realMethod === "GET") return this.cache.get(endpoint)

            return {
                ...data,
                isCache: false,
                code: 429,
                statusText: "Too Many Requests",
                message: `Rate limited from ${r.url}`,
                data: {},
                ratelimitRemaining: 0
            }
        }

        // TODO: Do not replace older datas when GraphQL Query Fields are different.
        if (data.code === 200 && realMethod === "GET") { // @ts-ignore
            this.cache.set(endpoint, { ...data, isCache: true, updatedTimestamp: Date.now(), requestedBody: endpoint === "/graphql" ? options?.body : void 0 })
            this.endpointCache.set(endpoint, parseInt(r.headers.get("x-ratelimit-remaining") ?? ""))
        }

        if (Array.isArray(data.errors) && data.errors.length > 0 && endpoint === "graphql") {
            const uniqueErrors = [] as GraphQLErrorResponse[]
            for(const error of data.errors) if(!uniqueErrors.some(f => f.message === error.message)) uniqueErrors.push(error)

            throw new GraphQLError(`[koreanbots/FetchClient#fetch] ${uniqueErrors.map(e => JSON.stringify(e)).join("\n\n")}`)
        }
        if(data.code.toString().startsWith("4") || data.code.toString().startsWith("5")) throw new InvalidResponseError(`[koreanbots/FetchClient#fetch] ${data.message || JSON.stringify(data)}`)

        return data
    }
}
