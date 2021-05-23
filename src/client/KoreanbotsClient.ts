import { Client } from "discord.js"
import { Koreanbots } from "./Koreanbots"

import type { KoreanbotsClientOptions } from "../utils/types"

export class KoreanbotsClient extends Client {
    #retryCount: number
    public koreanbotsInterval: NodeJS.Timeout | number | null
    public koreanbots: Koreanbots | null
    public options: KoreanbotsClientOptions

    /**
     * 새로운 KoreanbotsClient 인스턴스를 생성합니다.
     * @param options 
     * @example
     * const { KoreanbotsClient } = require("koreanbots")
     * 
     * const client = new KoreanbotsClient({
     *     koreanbotsOptions: {
     *         // src/client/Koreanbots.ts
     *         apiOptions: {
     *             token: process.env.KOREANBOTS_TOKEN
     *         }
     *     },
     *     koreanbotsClientOptions: {
     *         updateInterval: 60000 * 15 // 15분마다 서버 수를 업데이트
     *     }
     * })
     */
    constructor(options: KoreanbotsClientOptions) {
        super(options)

        this.options = options

        this.koreanbots = null

        /**
         * 서버 수 업데이트 루프
         * @type {NodeJS.Timeout|null}
         */
        this.koreanbotsInterval = null
        this.#retryCount = 0

        this.once("ready", this.ok.bind(this))
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
            ...this.options.koreanbotsOptions,
            clientID: this.user?.id ?? this.options.koreanbotsOptions?.clientID
        })

        const getGuildCount = () => {
            if (this.shard?.count && this.shard?.count > 1) return this.shard.fetchClientValues("guilds.cache.size")
                .then(numbers => numbers.reduce((a, c) => a + c))

            return this.guilds?.cache.size
        }

        const count = await getGuildCount()

        this.koreanbots.mybot.update(count)
        this.koreanbotsInterval = setInterval(
            async () => {
                const count = await getGuildCount()
                return await this.koreanbots?.mybot.update(count)
            },
            this.options.koreanbotsClientOptions?.updateInterval ?? 60000 * 10
        )
    }
}
