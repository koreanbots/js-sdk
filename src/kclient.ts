import { Client } from "discord.js"
import MyBot from "./mybot"
import { FetchResponse, KoreanbotsClientOptions, KoreanbotsOptionsForKoreanbosClient } from "./structures"
import Utils from "./utils"


class KoreanbotsClient extends Client {
    public koreanbotsInterval: NodeJS.Timeout | number | null
    public koreanbots: MyBot | null
    public koreanbotsOptions: KoreanbotsOptionsForKoreanbosClient

    constructor(options: KoreanbotsClientOptions) {
        super(options)

        this.koreanbotsOptions = options.koreanbotsOptions
        this.koreanbotsOptions.hideToken = options.koreanbotsOptions.hideToken ?? false
        this.koreanbotsOptions.token = options.koreanbotsOptions.hideToken ? Utils.hide(options.koreanbotsOptions.token) : options.koreanbotsOptions.token
        this.koreanbotsOptions.apiVersion = options.koreanbotsOptions.apiVersion 
        this.koreanbotsOptions.noWarning = options.koreanbotsOptions.noWarning as boolean
        this.koreanbotsOptions.avoidRateLimit = options.koreanbotsOptions.avoidRateLimit as boolean
        this.koreanbotsOptions.cacheTTL = options.koreanbotsOptions.cacheTTL as number
        this.koreanbotsOptions.updateInterval = options.koreanbotsOptions.updateInterval ?? 60000 * 60 * 3

        this.koreanbotsInterval = null
        this.koreanbots = null

        this.once("ready", this._ok.bind(this))
    }

    private get getGuildCount() {
        return this.guilds.cache.size as number
    }

    private serverUpdate(): Promise<FetchResponse> | void {
        return this.koreanbots?.update(this.getGuildCount)
    }

    private _ok(): NodeJS.Timeout | void {
        if (!this.getGuildCount || !this.user) return process.nextTick(this._ok.bind(this))

        this.koreanbots = new MyBot({

            ...this.koreanbotsOptions,
            clientID: this.user?.id,

            cacheTTL: this.koreanbotsOptions.cacheTTL ?? 60000 * 60 * 3
        })

        this.serverUpdate()
        this.koreanbotsInterval = setInterval(this.serverUpdate.bind(this), this.koreanbotsOptions.updateInterval)
    }
}

export default KoreanbotsClient
