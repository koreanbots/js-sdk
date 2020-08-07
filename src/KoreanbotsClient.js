const { Client,version } = require("discord.js")
const DjsVersion = version ? parseInt(version.split(".")[0]) : null
class KoreanbotsClient extends Client {
    constructor(options = {}) {
        super(options)

        this.options.koreanbotsToken = options.koreanbotsToken || null
        this.options.koreanbotsOptions = options.koreanbotsOptions || new Object()
        this.options.koreanbotsOptions.interval = options.koreanbotsOptions.interval || 60000 * 30
        
        this.koreanbotsInterval = null

        this.once("ready", this._ok)
    }

    _update() {
        const GuildCount = DjsVersion && DjsVersion >= 12 ? this.guilds.cache.size : this.guilds.size
        return this.koreanbots.update(GuildCount)
    }

    _ok() {
        const GuildCount = DjsVersion && DjsVersion >= 12 ? this.guilds.cache.size : this.guilds.size
        if (!GuildCount) return setTimeout(this._ok, 1000)

        const { MyBot } = require("./")
        this.koreanbots = new MyBot(this.options.koreanbotsToken, this.options.koreanbotsOptions)

        this._update()
        this.koreanbotsInterval = setInterval(()=> this._update(), this.options.koreanbotsOptions.interval)
    }
} 

module.exports = KoreanbotsClient
