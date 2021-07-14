import { URLSearchParams } from "url"
import { Bot } from "../structures/Bot"
import { KoreanbotsInternal } from "../utils/Constants"

import type { Koreanbots } from "../client/Koreanbots"
import type { FetchResponse, RawBotInstance, RequestInitWithInternals, Vote } from "../utils/types"
import LifetimeCollection from "../utils/Collection"

interface UpdateResponse {
    code: number
    version: number
    message: string
}

interface BotQuery {
    bots(clientID: string): {
        get(options?: RequestInitWithInternals): Promise<FetchResponse<RawBotInstance>>
        vote: {
            get(options?: RequestInitWithInternals): Promise<FetchResponse<Vote>>
        }
        stats: {
            post(options?: RequestInitWithInternals): Promise<FetchResponse<UpdateResponse>>
        }
    }
}

export class Mybot {
    public bot: Bot | null

    public lastGuildCount?: number
    public updatedAt?: Date
    public updatedTimestamp?: number
    public votes: LifetimeCollection<string, Vote>

    /**
     * 새로운 Mybot 인스턴스를 생성합니다.
     * @param koreanbots 
     * @param clientID 
     */
    constructor(public readonly koreanbots: Koreanbots, public readonly clientID: string) {
        this.bot = null

        this.votes = new LifetimeCollection({
            maxAge: 10000
        })

        this.mybotInit()
    }

    protected async mybotInit(): Promise<Bot> {
        const res = await this.koreanbots.api<BotQuery>().bots(this.clientID).get()

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.bot = new Bot(this.koreanbots, res.data!)
    }

    /**
     * 해당 유저가 내 봇에 하트를 눌렀는지 체크합니다. (cache TTL: 10초)
     * @param id 
     * @returns 
     * @example
     * koreanbots.mybot.checkVote("12345678901234567")
     *     .then(voted => {
     *         if (voted) return message.channel.send(`${message.author} 님, 하트를 눌러주셔서 감사합니다!`)
     * 
     *         return message.channel.send(`${message.author} 님, 하트를 아직 누르지 않으셨습니다.`)
     *     })
     */
    async checkVote(id: string): Promise<Vote> {
        const cache = this.votes.get(id)
        if (cache) return cache

        const query = new URLSearchParams()
        query.append("userID", id)

        const res = await this.koreanbots.api<BotQuery>().bots(this.clientID).vote.get({
            [KoreanbotsInternal]: {
                query
            }
        })

        if (!res.data) throw new Error(res.message)

        return res.data
    }

    /**
     * 봇의 서버 수를 업데이트합니다.
     * @param count 
     * @returns 
     * @example
     * koreanbots.mybot.update({ count: client.guilds.cache.size })
     */
    async update({ count, shards }: { count: number, shards?: number }): Promise<UpdateResponse> {
        if (!count || typeof count !== "number") throw new TypeError(`"count" 옵션은 숫자여야 합니다. (받은 타입: ${typeof count})`)

        if (this.lastGuildCount === count) return {
            code: 304,
            version: this.koreanbots.options.api.version ?? 2,
            message: "서버 수가 같아서 업데이트 되지 않았습니다."
        }

        const body = JSON.stringify({ 
            servers: count,
            shards
        })
        const response = await this.koreanbots.api<BotQuery>().bots(this.clientID).stats.post({
            body
        })

        if (response.code !== 200 || !response.data)
            throw new Error(
                response.message ||
                `API에서 알 수 없는 응답이 돌아왔습니다. ${JSON.stringify(response.data)}`
            )

        this.lastGuildCount = count

        this.updatedTimestamp = Date.now()
        this.updatedAt = new Date(this.updatedTimestamp)

        if (this.koreanbots?.api.client.listeners("serverCountUpdated"))
            this.koreanbots?.api.client.emit("serversUpdated", { ...response.data, servers: count })

        return response.data
    }
}
