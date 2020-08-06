const { Client,version } = require("discord.js")
const djsver = version.split(".")[0]
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
        const guildcount = djsver == "11" ? this.guilds.size : this.guilds.cache.size
        return this.koreanbots.update(guildcount)
    }

    _ok() {
        const guildcount = djsver == "11" ? this.guilds.size : this.guilds.cache.size
        if (!guildcount) return setTimeout(this._ok, 1000)

        const { MyBot } = require("./")
        this.koreanbots = new MyBot(this.options.koreanbotsToken, this.options.koreanbotsOptions)

        this._update()
        this.koreanbotsInterval = setInterval(()=> this._update(), this.options.koreanbotsOptions.interval)
    }
} 

module.exports = KoreanbotsClient
