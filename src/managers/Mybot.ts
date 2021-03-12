import { Bot } from "../structures/Bot"

import type { Koreanbots } from "../client/Koreanbots"
import type { RequestInit } from "node-fetch"
import type { FetchResponse, RawBotInstance } from "../util/types"

interface UpdateResponse {
    code: number
    version: number
    message: string
}

interface BotQuery {
    bots(clientID: string): {
        get(options?: RequestInit): Promise<FetchResponse<RawBotInstance>>
        stats: {
            post(options?: RequestInit): Promise<FetchResponse<UpdateResponse>>
        }
    }
}

export class Mybot {
    public bot: Bot | null

    public lastGuildCount?: number
    public updatedAt?: Date
    public updatedTimestamp?: number

    constructor(public readonly koreanbots: Koreanbots, public readonly clientID: string) {
        this.bot = null

        this.mybotInit()
    }

    protected async mybotInit(): Promise<Bot> {
        const res = await this.koreanbots.api<BotQuery>().bots(this.clientID).get()

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.bot = new Bot(this.koreanbots, res.data!)
    }

    async update(count: number): Promise<FetchResponse<UpdateResponse>> {
        if (this.lastGuildCount === count) return {
            code: 304,
            data: {
                code: 304,
                version: this.koreanbots.options.apiOptions.version,
                message: "서버 수가 같아서 업데이트 되지 않았습니다."
            },
            isCache: false,
            url: `/bots/${this.clientID}/stats`,
            ratelimitRemaining: 3
        }

        const body = JSON.stringify({ servers: count })
        const response = await this.koreanbots.api<BotQuery>().bots(this.clientID).stats.post({
            body
        })

        if (response.code !== 200) 
            throw new Error(
                response.message || 
                `API에서 알 수 없는 응답이 돌아왔습니다. ${JSON.stringify(response.data)}`
            )

        this.lastGuildCount = count

        this.updatedTimestamp = Date.now()
        this.updatedAt = new Date(this.updatedTimestamp || Date.now())

        return response
    }
}
