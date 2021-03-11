import { Bot } from "../structures/Bot"

import type { Koreanbots } from "./Koreanbots"
import type { RequestInit } from "node-fetch"
import type { FetchResponse, RawBotInstance } from "../structures/core"

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
        const body = JSON.stringify({ servers: count })
        const response = await this.koreanbots.api<BotQuery>().bots(this.clientID).stats.post({
            body
        })

        return response
    }
}
