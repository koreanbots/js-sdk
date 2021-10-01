import { LimitedCollection } from "discord.js"
import { Server } from "../structures/Server"

import type {
    ServerManagerOptions,
    Nullable,
    FetchOptions,
} from "../utils/types"
import type { Koreanbots } from "../client/Koreanbots"

const defaultCacheMaxSize = 100
const defaultCacheSweepInterval = 60000 * 60
const defaultOptions = {
    cache: {
        maxSize: defaultCacheMaxSize,
        sweepInterval: defaultCacheSweepInterval
    }
}

export class ServerManager {
    public cache: LimitedCollection<string, Nullable<Server>>

    /**
     * 새로운 ServerManager 인스턴스를 만듭니다.
     * @param koreanbots 
     * @param options 
     * @example
     * ```js
     * new ServerManager(
     *     new Koreanbots({
     *         // ...
     *     })),
     *     {
     *         cache: {
     *             maxSize: 150,
     *             sweepInterval: 60000
     *         }
     *     }
     * )
     * ```
     */
    constructor(public readonly koreanbots: Koreanbots, public readonly options?: ServerManagerOptions) {
        this.options = options ?? defaultOptions

        if (!this.options?.cache.maxSize) this.options.cache.maxSize = defaultCacheMaxSize
        if (!this.options?.cache.sweepInterval) this.options.cache.sweepInterval = defaultCacheSweepInterval

        this.cache = new LimitedCollection({
            maxSize: this.options.cache.maxSize,
            sweepInterval: this.options.cache.sweepInterval
        })
    }

    /**
     * 서버를 불러옵니다.
     * @param serverID 
     * @param options 
     * @returns {Promise<Server>}
     * @example
     * ```js
     * koreanbots.servers.fetch("12345678901234567")
     *     .then(server => console.log(`${server.name} 서버를 불러왔습니다!`))
     *     .catch(err => console.error(`다음 오류로 인해 서버를 불러오는 것에 실패 했습니다. ${err.stack}`))
     * ```
     * @example
     * ```js
     * koreanbots.servers.fetch("12345678901234567", { force: true })
     *     .then(server => console.log(`캐시를 무시하고 ${server.name} 서버를 불러온 후, 캐시에 저장 했습니다.`))
     *     .catch(err => console.error(`다음 오류로 인해 서버를 불러오는 것에 실패 했습니다. ${err.stack}`))
     * ```
     * @example
     * ```js
     * koreanbots.servers.fetch("12345678901234567", { cache: false, force: true })
     *     .then(server => console.log(`캐시를 무시하고 ${server.name} 서버를 불러왔으며, 캐시에 저장하지 않았습니다.`))
     *     .catch(err => console.error(`다음 오류로 인해 서버를 불러오는 것에 실패 했습니다. ${err.stack}`))
     * ```
     */
    async fetch(serverID: string, options: FetchOptions = { cache: true, force: false }): Promise<Server> {
        if (!serverID || typeof serverID !== "string") throw new Error(`"serverID" 값이 주어지지 않았거나 문자열이어야 합니다. (받은 타입: ${typeof serverID})`)

        const cache = this.cache.get(serverID)
        if (!options?.force && cache) return cache

        const res = await this.koreanbots.api().servers(serverID).get()
        if (res.code !== 200 || !res.data) throw new Error(res.message || `API에서 알 수 없는 응답이 돌아왔습니다. ${JSON.stringify(res.data)}`)

        const server = new Server(this.koreanbots, res.data)
        if (options.cache) this.cache.set(serverID, server)

        return server
    }
}
