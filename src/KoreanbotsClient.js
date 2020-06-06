const { Client } = require("discord.js")

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
        return this.koreanbots.update(this.guilds.cache.size)
    }

    _ok() {
        if (!this.guilds.cache.size) return setTimeout(this._ok, 1000)

        const { MyBot } = require("./")
        this.koreanbots = new MyBot(this.options.koreanbotsToken, this.options.koreanbotsOptions)

        this._update()
        this.koreanbotsInterval = setInterval(this._update, this.options.koreanbotsOptions.interval)
    }
} 

module.exports = KoreanbotsClient