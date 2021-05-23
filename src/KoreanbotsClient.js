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

    async _getGuildCount() {
        if (this.shard?.count && this.shard?.count > 1) return this.shard.fetchClientValues("guilds.cache.size")
            .then(numbers => numbers.reduce((a, c) => a + c))

        return DjsVersion >= 12 ? this.guilds.cache.size : this.guilds.size
    }

    async _update() {
        const count = await this._getGuildCount()
        
        return this.koreanbots.update(count)
    }

    async _ok() {
        const count = await this._getGuildCount()
        if (!count) return setTimeout(this._ok.bind(this), 1000)

        const { MyBot } = require("./")
        this.koreanbots = new MyBot(this.options.koreanbotsToken, this.options.koreanbotsOptions)

        await this._update()
        this.koreanbotsInterval = setInterval(this._update.bind(this), this.options.koreanbotsOptions.interval)
    }
} 

module.exports = KoreanbotsClient
