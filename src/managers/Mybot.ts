import { Bot } from "../structures/Bot"
import { KoreanbotsInternal } from "../utils/Constants"
import { URLSearchParams } from "url"

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

    constructor(public readonly koreanbots: Koreanbots, public readonly clientID: string) {
        this.bot = null

        this.votes = new LifetimeCollection({
            maxAge: 60000 * 60 * 12 // 12 hours because it resets after 12 hours
        })

        this.mybotInit()
    }

    protected async mybotInit(): Promise<Bot> {
        const res = await this.koreanbots.api<BotQuery>().bots(this.clientID).get()

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.bot = new Bot(this.koreanbots, res.data!)
    }

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

    async update(count: number): Promise<UpdateResponse> {
        if (this.lastGuildCount === count) return {
            code: 304,
            version: this.koreanbots.options.apiOptions.version ?? 2,
            message: "서버 수가 같아서 업데이트 되지 않았습니다."
        }

        const body = JSON.stringify({ servers: count })
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
        this.updatedAt = new Date(this.updatedTimestamp || Date.now())

        return response.data
    }
}
