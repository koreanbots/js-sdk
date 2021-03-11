import LRU from "lru-cache"
import { User } from "../structures/User"

import type {
    UserManagerOptions, FetchResponse, Nullable, RawUserInstance,
    ProxyValidator
} from "../structures/core"
import type { Koreanbots } from "../client/Koreanbots"
import type { RequestInit } from "node-fetch"

interface UserQuery {
    users(userID: string): {
        get(options?: RequestInit): Promise<FetchResponse<RawUserInstance>>
    }
}

const defaultCacheMaxSize = 100
const defaultCacheMaxAge = 60000 * 60

export class UserManager {
    public cache: LRU<string, Nullable<User>>

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

    constructor(public readonly koreanbots: Koreanbots, public readonly options: UserManagerOptions) {
        this.options = options ?? {}
        const optionsProxy = new Proxy(this.options, UserManager.validator<UserManagerOptions>())

        optionsProxy.max = options?.max ?? defaultCacheMaxSize
        optionsProxy.maxAge = options?.maxAge ?? defaultCacheMaxAge

        this.cache = new LRU({
            max: this.options.max,
            maxAge: this.options.maxAge
        })
    }

    async fetch(userID: string): Promise<FetchResponse<User>> {
        if (!userID || typeof userID !== "string") throw new Error(`"userID" 값은 주어지지 않았거나 문자열이어야 합니다. (받은 타입: ${typeof userID})`)

        const res = await this.koreanbots.api<UserQuery>().users(userID).get()

        if (!res.data) throw new Error(res.message || `API에서 알 수 없는 응답이 돌아왔습니다. ${JSON.stringify(res.data)}`)

        const user = new User(this.koreanbots, res.data)

        this.cache.set(userID, user)

        return { ...res, data: user }
    }
}
