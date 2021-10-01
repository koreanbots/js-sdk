import LifetimeCollection from "../utils/Collection"
import { User } from "../structures/User"
import { CacheOptionsValidator } from "../utils"

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
const defaultCacheMaxAge = 60000 * 60

export class UserManager {
    public cache: LifetimeCollection<string, Nullable<User>>

    constructor(public readonly koreanbots: Koreanbots, public readonly options?: UserManagerOptions) {
        this.options = options ?? { cache: {} }
        const optionsProxy = new Proxy(this.options, CacheOptionsValidator<UserManagerOptions>())

        optionsProxy.cache.max = options?.cache?.max ?? defaultCacheMaxSize
        optionsProxy.cache.maxAge = options?.cache?.maxAge ?? defaultCacheMaxAge

        this.cache = new LifetimeCollection({
            max: this.options.cache.max,
            maxAge: this.options.cache.maxAge
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
