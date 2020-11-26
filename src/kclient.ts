import { Client } from "discord.js"
import { MyBot } from "./mybot"
import { FetchResponse, KoreanbotsClientOptions, KoreanbotsOptionsForKoreanbosClient } from "./structures"
import * as Utils from "./utils"


export class KoreanbotsClient extends Client {
    #retryCount: number
    public koreanbotsInterval: NodeJS.Timeout | number | null
    public koreanbots: MyBot | null
    public koreanbotsOptions: KoreanbotsOptionsForKoreanbosClient

    /**
     * 
     * @param {KoreanbotsClientOptions} [options] - KoreanbotsClient의 옵션
     */
    constructor(options: KoreanbotsClientOptions) {
        super(options)

        /**
         * Koreanbots의 옵션
         * @type {KoreanbotsOptionsForKoreanbosClient}
         */
        this.koreanbotsOptions = options.koreanbotsOptions
        this.koreanbotsOptions.hideToken = options.koreanbotsOptions.hideToken ?? false
        this.koreanbotsOptions.token = options.koreanbotsOptions.hideToken ? Utils.hide(options.koreanbotsOptions.token) : options.koreanbotsOptions.token
        this.koreanbotsOptions.apiVersion = options.koreanbotsOptions.apiVersion 
        this.koreanbotsOptions.noWarning = options.koreanbotsOptions.noWarning as boolean
        this.koreanbotsOptions.avoidRateLimit = options.koreanbotsOptions.avoidRateLimit as boolean
        this.koreanbotsOptions.cacheTTL = options.koreanbotsOptions.cacheTTL as number
        this.koreanbotsOptions.updateInterval = options.koreanbotsOptions.updateInterval ?? 60000 * 30

        /**
         * 서버 수 업데이트 루프
         * @type {NodeJS.Timeout|null}
         */
        this.koreanbotsInterval = null
        this.#retryCount = 0

        /**
         * MyBot
         * @type {MyBot|null}
         */
        this.koreanbots = null

        this.once("ready", this.ok.bind(this))
    }

    /**
     * 서버 수 불러오기
     * @type {number}
     * @pritected
     */
    protected get getGuildCount(): number {
        return this.guilds.cache.size
    }

    /**
     * 서버 수 불러오기 재시도 횟수
     * @type {number}
     */
    private get retryCount() {
        return this.#retryCount
    }

    private set retryCount(value) {
        this.#retryCount = value
    }

    /**
     * 불러오기 재시도
     * @private
     */
    private retry() {
        this.retryCount += 1
        if(this.retryCount >= 10) throw new Error("[koreanbots/KoreanbotsClient#retry] KoreanbotsClient failed to start.")

        return setTimeout(this.ok.bind(this), 5000)
    }

    /**
     * 서버 수 업데이트
     * @private
     */
    private update(): Promise<FetchResponse> | void {
        return this.koreanbots?.update(this.getGuildCount)
    }

    /**
     * Koreanbots lib/interval init
     * @private
     */
    private ok(): NodeJS.Timeout | void {
        if (!this.getGuildCount || !this.user) return this.retry()

        this.koreanbots = new MyBot({

            ...this.koreanbotsOptions,
            clientID: this.user?.id,

            cacheTTL: this.koreanbotsOptions.cacheTTL
        })

        this.update()
        this.koreanbotsInterval = setInterval(this.update.bind(this), this.koreanbotsOptions.updateInterval)
    }
}
