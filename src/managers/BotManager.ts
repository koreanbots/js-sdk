import LRU from "lru-cache"
import { Bot } from "../structures/Bot"

import type {
    BotManagerOptions, FetchResponse, Nullable, RawBotInstance,
    ProxyValidator
} from "../util/types"
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
    public cache: LRU<string, Nullable<Bot>>

    static validator = <T>(): ProxyValidator<T> => ({
        set(obj, prop, value) {
            switch (prop) {
            case "max":
                if (typeof value !== "number") throw new TypeError(`"max" 옵션은 숫자여야 합니다. (받은 타입: ${typeof value})`)
                if (value <= 0) throw new RangeError(`"max" 옵션은 0보다 커야 합니다. (받은 값: ${value}, 최소보다 '${1 - value}' 작음)`)
                if (!Number.isSafeInteger(value)) throw new RangeError(`"max" 옵션은 32비트 정수만 허용됩니다. (받은 값: ${value})`)
                break
            case "maxAge":
                if (typeof value !== "number") throw new TypeError(`"maxAge" 옵션은 숫자여야 합니다. (받은 타입: ${typeof value})`)
                if (value <= 0) throw new RangeError(`"maxAge" 옵션은 0보다 커야 합니다. (받은 값: ${value}, 최소보다 '${1 - value}' 작음)`)
                if (!Number.isSafeInteger(value)) throw new RangeError(`"maxAge" 옵션은 32비트 정수만 허용됩니다. (받은 값: ${value})`)
            }

            obj[prop] = value
            return true
        }
    })

    constructor(public readonly koreanbots: Koreanbots, public readonly options: BotManagerOptions) {
        this.options = options ?? { cache: {} }
        const optionsProxy = new Proxy(this.options, BotManager.validator<BotManagerOptions>())

        optionsProxy.cache.max = options?.cache?.max ?? defaultCacheMaxSize
        optionsProxy.cache.maxAge = options?.cache?.maxAge ?? defaultCacheMaxAge

        this.cache = new LRU({
            max: this.options.cache.max,
            maxAge: this.options.cache.maxAge
        })
    }

    async fetch(botID: string): Promise<FetchResponse<Bot>> {
        if (!botID || typeof botID !== "string") throw new Error(`"botID" 값은 주어지지 않았거나 문자열이어야 합니다. (받은 타입: ${typeof botID})`)

        const res = await this.koreanbots.api<BotQuery>().bots(botID).get()

        if (!res.data) throw new Error(res.message || `API에서 알 수 없는 응답이 돌아왔습니다. ${JSON.stringify(res.data)}`)

        const bot = new Bot(this.koreanbots, res.data)

        this.cache.set(botID, bot)

        return { ...res, data: bot }
    }
}
