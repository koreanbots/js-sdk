import LifetimeCollection from "../utils/Collection"
import { Bot } from "../structures/Bot"
import { CacheOptionsValidator } from "../utils"

import type {
    BotManagerOptions, FetchResponse, Nullable, RawBotInstance,
    FetchOptions
} from "../utils/types"
import type { Koreanbots } from "../client/Koreanbots"
import type { RequestInit } from "node-fetch"

interface BotQuery {
    bots(botID: string): {
        get(options?: RequestInit): Promise<FetchResponse<RawBotInstance>>
    }
}

const defaultCacheMaxSize = 100
const defaultCacheMaxAge = 60000 * 60

export class BotManager {
    public cache: LifetimeCollection<string, Nullable<Bot>>

    constructor(public readonly koreanbots: Koreanbots, public readonly options?: BotManagerOptions) {
        this.options = options ?? { cache: {} }
        const optionsProxy = new Proxy(this.options, CacheOptionsValidator<BotManagerOptions>())

        optionsProxy.cache.max = options?.cache?.max ?? defaultCacheMaxSize
        optionsProxy.cache.maxAge = options?.cache?.maxAge ?? defaultCacheMaxAge

        this.cache = new LifetimeCollection({
            max: this.options.cache.max,
            maxAge: this.options.cache.maxAge
        })
    }

    async fetch(botID: string, options: FetchOptions = { cache: true, force: false }): Promise<Bot> {
        if (!botID || typeof botID !== "string") throw new Error(`"botID" 값은 주어지지 않았거나 문자열이어야 합니다. (받은 타입: ${typeof botID})`)

        const cache = this.cache.get(botID)
        if (!options?.force && cache) return cache

        const res = await this.koreanbots.api<BotQuery>().bots(botID).get()
        if (res.code !== 200 || !res.data) throw new Error(res.message || `API에서 알 수 없는 응답이 돌아왔습니다. ${JSON.stringify(res.data)}`)

        const bot = new Bot(this.koreanbots, res.data)
        if (options.cache) this.cache.set(botID, bot)

        return bot
    }
}
