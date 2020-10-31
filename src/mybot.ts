import { FetchResponse, KoreanbotsOptions } from "./structures"
import Utils from "./utils"
import { InvalidResponseError, ValidationError } from "./utils/errors"
import FetchClient from "./utils/FetchClient"

class MyBot {
    #token: Required<string>
    public options: KoreanbotsOptions
    public lastGuildCount: number
    public updatedTimestamp: number | null
    public updatedAt: Date | null
    private fetchClient: FetchClient


    constructor(options: KoreanbotsOptions) {
        if (!options.token || typeof options.token !== "string") throw new ValidationError("[koreanbots/MyBot#constructor] 올바르지 않은 'token' 값입니다.")
        if (!options.clientID || typeof options.clientID !== "string") throw new ValidationError("[koreanbots/MyBot#constructor] 올바르지 않은 'clientID' 값입니다.")

        this.#token = options.token

        this.options = options
        this.options.clientID = options.clientID
        this.options.hideToken = options.hideToken ?? false
        this.options.token = this.options.hideToken ? Utils.hide(this.#token) : this.#token
        this.options.avoidRateLimit = options.avoidRateLimit ?? true
        this.options.noWarning = options.noWarning ?? false
        this.options.apiVersion = options.apiVersion
        this.options.cacheTTL = options.cacheTTL

        this.fetchClient = new FetchClient({
            hideToken: this.options.hideToken as boolean,
            token: this.#token as string,
            apiVersion: this.options.apiVersion,
            avoidRateLimit: this.options.avoidRateLimit as boolean,
            noWarning: this.options.noWarning as boolean,
            cacheTTL: this.options.cacheTTL as number
        })

        this.lastGuildCount = 0
        this.updatedAt = null
        this.updatedTimestamp = null

        this.validate()
    }

    private async validate(): Promise<FetchResponse | void> {
        const res = await this.fetchClient.fetch("/")

        if (res.code !== 200 && res.code !== 304) throw new InvalidResponseError("[koreanbots/MyBot#validate] 선택한 API 버젼 엔드포인트에서 올바르지 않은 응답이 전송 되었습니다.")

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

    async checkVote(id: string) {
        if (!id || typeof id !== "string") throw new ValidationError("[koreanbots/MyBot#checkVote] 올바르지 않은 'id' 값입니다.")

        
    }
}

export default MyBot