import { Client } from "discord.js"
import { Koreanbots } from "./Koreanbots"

import type { KoreanbotsClientOptions, Nullable } from "../utils/types"

export class KoreanbotsClient extends Client {
    #retryCount: number
    public koreanbotsInterval: Nullable<NodeJS.Timeout | number>
    public koreanbots: Nullable<Koreanbots>
    public options!: KoreanbotsClientOptions

    /**
     * 새로운 KoreanbotsClient 인스턴스를 생성합니다.
     * @param options 
     * @example
     * ```js
     * const { KoreanbotsClient } = require("koreanbots")
     * 
     * const client = new KoreanbotsClient({
     *     koreanbots: {
     *         // src/client/Koreanbots.ts
     *         api: {
     *             token: process.env.KOREANBOTS_TOKEN
     *         }
     *     },
     *     koreanbotsClient: {
     *         updateInterval: 60000 * 15 // 15분마다 서버 수를 업데이트
     *     }
     * })
     * ```
     */
    constructor(options: KoreanbotsClientOptions) {
        super(options)

        if (this.options.koreanbotsClient)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.options.koreanbotsClient!.updateOnInit ??= true

        this.koreanbots = null

        /**
         * 서버 수 업데이트 루프
         * @type {NodeJS.Timeout|null}
         */
        this.koreanbotsInterval = null
        this.#retryCount = 0

        this.once("ready", () => void this.ok.bind(this)())
    }

    /**
     * 불러오기 재시도
     * @private
     */
    private retry() {
        this.#retryCount += 1
        if (this.#retryCount >= 10) throw new Error("KoreanbotsClient가 자동으로 서버 수를 업데이트 하는 것에 실패 했습니다.")

        return setTimeout(this.ok.bind(this), 5000)
    }

    /**
     * Koreanbots lib/interval init
     * @private
     */
    private async ok(): Promise<NodeJS.Timeout | void> {
        if (!this.guilds?.cache.size || !this.user) return this.retry()

        this.koreanbots = new Koreanbots({
            ...this.options.koreanbots,
            clientID: this.user?.id ?? this.options.koreanbots?.clientID
        })

        const getGuildCount = () => {
            if (this.shard?.count && this.shard?.count > 1) return this.shard.fetchClientValues("guilds.cache.size")
                .then(numbers => (<number[]>numbers).reduce((a, c) => a + c))

            return this.guilds?.cache.size
        }
        const getShardCount = () => this.shard?.count

        const servers = await getGuildCount()
        const shards = getShardCount()

        if (this.options.koreanbotsClient?.updateOnInit) this.koreanbots.mybot.update({ servers, shards })
        this.koreanbotsInterval = setInterval(
            async () => {
                const servers = await getGuildCount()
                return await this.koreanbots?.mybot.update({ servers, shards })
            },
            this.options.koreanbotsClient?.updateInterval ?? 60000 * 10
        )
    }

    destroy() {
        if (this.koreanbotsInterval)
            clearInterval(this.koreanbotsInterval as NodeJS.Timeout)

        
        return super.destroy()
    }
}
