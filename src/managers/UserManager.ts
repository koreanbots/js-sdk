import { LimitedCollection } from "discord.js"
import { User } from "../structures/User"

import type {
    UserManagerOptions, FetchResponse, Nullable, RawUserInstance,
    FetchOptions
} from "../utils/types"
import type { Koreanbots } from "../client/Koreanbots"
import type { Dispatcher } from "undici"

interface UserQuery {
    users(userID: string): {
        get(options?: Dispatcher.RequestOptions): Promise<FetchResponse<RawUserInstance>>
    }
}

const defaultCacheMaxSize = 100
const defaultCacheSweepInterval = 60000 * 60
const defaultOptions = {
    cache: {
        maxSize: defaultCacheMaxSize,
        sweepInterval: defaultCacheSweepInterval
    }
}

export class UserManager {
    public cache: LimitedCollection<string, Nullable<User>>

    constructor(public readonly koreanbots: Koreanbots, public readonly options?: UserManagerOptions) {
        this.options = options ?? defaultOptions

        if (!this.options?.cache.maxSize) this.options.cache.maxSize = defaultCacheMaxSize
        if (!this.options?.cache.sweepInterval) this.options.cache.sweepInterval = defaultCacheSweepInterval

        this.cache = new LimitedCollection({
            maxSize: this.options.cache.maxSize,
            sweepInterval: this.options.cache.sweepInterval
        })
    }

    async fetch(userID: string, options: FetchOptions = { cache: true, force: false }): Promise<User> {
        if (!userID || typeof userID !== "string") throw new Error(`"userID" 값은 주어지지 않았거나 문자열이어야 합니다. (받은 타입: ${typeof userID})`)

        const cache = this.cache.get(userID)
        if (!options?.force && cache) return cache

        const res = await this.koreanbots.api<UserQuery>().users(userID).get()
        if (!res.data) throw new Error(res.message || `API에서 알 수 없는 응답이 돌아왔습니다. ${JSON.stringify(res.data)}`)

        const user = new User(this.koreanbots, res.data)
        if (options.cache) this.cache.set(userID, user)

        return user
    }
}
