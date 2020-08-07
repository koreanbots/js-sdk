const { Client,version } = require("discord.js")
const DjsVersion = version ? parseInt(version.split(".")[0]) : null

class KoreanbotsClient extends Client {
    constructor(options = {}) {
        super(options)

        if(!DjsVersion) throw new Error("discord.js 버전을 찾을수 없습니다. Discord.js가 설치 되었는지 확인해 주세요.")

        this.options.koreanbotsToken = options.koreanbotsToken || null
        this.options.koreanbotsOptions = options.koreanbotsOptions || new Object()
        this.options.koreanbotsOptions.interval = options.koreanbotsOptions.interval || 60000 * 30
        
        this.koreanbotsInterval = null

        this.once("ready", this._ok)
    }

    get _getGuildCount() {
        return DjsVersion >= 12 ? this.guilds.cache.size : this.guilds.size
    }

    set _getGuildCount(v) {
       throw new Error("Can't modify value as " + v)
    }

    _update() {
        return this.koreanbots.update(this._getGuildCount)
    }

    _ok() {
        if (!this._getGuildCount) return setTimeout(() => this._ok(), 1000)

        const { MyBot } = require("./")
        this.koreanbots = new MyBot(this.options.koreanbotsToken, this.options.koreanbotsOptions)

        this._update()
        this.koreanbotsInterval = setInterval(()=> this._update(), this.options.koreanbotsOptions.interval)
    }
} 

module.exports = KoreanbotsClient
