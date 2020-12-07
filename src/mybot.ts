import { FetchResponse, KoreanbotsOptions } from "../typings"
import * as Utils from "./utils"
import { InvalidResponseError, ValidationError } from "./utils/errors"
import { FetchClient } from "./utils/FetchClient"

export class MyBot {
    #token: Required<string>
    public options: KoreanbotsOptions
    public lastGuildCount: number
    public updatedTimestamp: number | null
    public updatedAt: Date | null
    public fetchClient: FetchClient

    /**
     * @param {KoreanbotsOptions} [options] MyBot의 옵션
     */
    constructor(options: KoreanbotsOptions) {
        if (!options.token || typeof options.token !== "string") throw new ValidationError("[koreanbots/MyBot#constructor] 올바르지 않은 'token' 값입니다.")
        if (!options.clientID || typeof options.clientID !== "string") throw new ValidationError("[koreanbots/MyBot#constructor] 올바르지 않은 'clientID' 값입니다.")

        /**
         * Koreanbots API에 접속할 토큰
         * @type {string}
         * @private
         */
        this.#token = options.token

        /**
         * MyBot의 옵션
         * @type {KoreanbotsOptions}
         */
        this.options = options
        this.options.clientID = options.clientID
        this.options.hideToken = options.hideToken ?? false
        this.options.token = this.options.hideToken ? Utils.hide(this.#token) : this.#token
        this.options.avoidRateLimit = options.avoidRateLimit ?? true
        this.options.noWarning = options.noWarning ?? false
        this.options.apiVersion = options.apiVersion
        this.options.cacheTTL = options.cacheTTL

        /**
         * Koreanbots API에 요청할 GraphQL/HTTP 클라이언트
         * @type {FetchClient}
         */
        this.fetchClient = new FetchClient({
            hideToken: this.options.hideToken as boolean,
            token: this.#token as string,
            apiVersion: this.options.apiVersion,
            avoidRateLimit: this.options.avoidRateLimit as boolean,
            noWarning: this.options.noWarning as boolean,
            cacheTTL: this.options.cacheTTL as number
        })

        /**
         * 마지막으로 업데이트한 서버 수
         * @type {number}
         */
        this.lastGuildCount = 0

        /**
         * 마지막으로 업데이트한 시간
         * @type {Date|null}
         */
        this.updatedAt = null

        /**
         * 마지막으로 업데이트한 시간 (타임스탬프)
         * @type {number|null}
         */
        this.updatedTimestamp = null

        this.validate()
    }

    /**
     * 올바른 옵션이 기입됬는지 검증합니다
     * @protected
     * @returns {Promise<FetchResponse | void>}
     */
    protected async validate(): Promise<FetchResponse | void> {
        let user
        if((this.options.apiVersion ?? 2) >= 2) user = await this.fetchClient.gqlFetch(`
            {
                bot(id: "${this.options.clientID}") {
                    id
                    name
                }
            }
        `)
        else return

        if (user.code !== 200 || !user.data?.bot.id || !user.data.bot.name) throw new InvalidResponseError("[koreanbots/MyBot#validate] 'clientID'를 가진 봇을 찾을 수 없습니다.")

        return user
    }

    /**
     * 봇의 서버 수를 업데이트합니다
     * @param {number} count - 업데이트할 서버 수
     * @example
     * mybot.update(100)
     *     .then(console.log)
     *     .catch(console.error)
     */
    async update(count: number): Promise<FetchResponse> {
        if ((this.options.apiVersion ?? 2) >= 2) {
            const res = await this.fetchClient.gqlFetch(`
            mutation { 
                bot(id: "${this.options.clientID}", servers: ${count}) {
                    id
                    servers
                }
            }
            `)

            if (res.code !== 200 && res.code !== 429) throw new InvalidResponseError(`[koreanbots/MyBot#update] ${typeof res.message === "string" ? res.message : "올바르지 않은 응답이 반환되었습니다."}\n응답(${res.code}): ${JSON.stringify(res)}`)

            this.updatedTimestamp = res.updatedTimestamp ?? Date.now()
            this.updatedAt = new Date(this.updatedTimestamp)
            this.lastGuildCount = count

            return res
        }

        const res = await this.fetchClient.fetch("/bots/servers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: `
            {
                "servers": ${count}
            }
            `
        })

        if (res.code !== 200 && res.code !== 429) throw new InvalidResponseError(`[koreanbots/MyBot#update] ${typeof res.message === "string" ? res.message : "올바르지 않은 응답이 반환되었습니다."}\n응답(${res.code}): ${JSON.stringify(res)}`)

        this.updatedTimestamp = res.updatedTimestamp ?? Date.now()
        this.updatedAt = new Date(this.updatedTimestamp)
        this.lastGuildCount = count

        return res
    }

    /**
     * 유저가 하트를 눌렀는지 체크합니다
     * @param {string} id - 유저 ID
     * @example
     * mybot.checkVote("462355431071809537")
     *     .then(console.log)
     *     .catch(console.error)
     */
    async checkVote(id: string): Promise<FetchResponse> {
        if (!id || typeof id !== "string") throw new ValidationError("[koreanbots/MyBot#checkVote] 올바르지 않은 'id' 값입니다.")

        return {
            code: 404,
            statusText: "Not Found",
            message: "아직 준비 중입니다.",
            isCache: false,
            ratelimitRemaining: Number.MAX_SAFE_INTEGER,
            endpoint: "/graphql"
        }
    }
}
