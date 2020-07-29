const { WidgetsCache } = require("./cache")["widget.js"]
const req = require("node-fetch")
const sharp = require("sharp")

class KoreanbotsWidgets {
    constructor(options) {
        this.options = options
        this.options.autoFlush = options.autoFlush || 100
        this.options.autoFlushInterval = options.autoFlushInterval || 60000 * 60

        this.cache = WidgetsCache

        this.allowedFormats = ["jpeg", "png", "webp", "svg"]

        if (this.options.autoFlushInterval && this.options.autoFlushInterval > 10000) {
            setInterval(() => {
                function flush(cache) {
                    if (cache.size >= this.options.autoFlush) cache.clear()
                }

                [this.cache, this.remainingPerEndpointCache].map(c => flush(c))
            }, this.options.autoFlushInterval)
        }
    }

    async _mkWidget(type, id, format) {
        if (!this.allowedFormats(format)) throw new Error(`해당 포맷은 지원되지 않습니다. 지원되는 포맷: ${this.allowedFormats.join(", ")}`)
        if (this.cache.get(`${id}/${format}`)) return this.cache.get(`${id}/${format}`)

        const res = await req(this[`get${type}WidgetURL`](id)).then(r => r.buffer())

        if (format === "svg") var widget = res
        else var widget = sharp(res)[format]() //eslint-disable-line no-redeclare

        this.cache.set(`${id}/${format}`, widget)

        return widget
    }

    getVoteWidgetURL(id) {
        return `https://api.koreanbots.dev/widget/bots/votes/${id}.svg`
    }

    async getVoteWidget(id, format = "png") {
        return this._mkWidget("Vote", id, format)
    }

    getServerWidgetURL(id) {
        return `https://api.koreanbots.dev/widget/bots/servers/${id}.svg`
    }

    async getServerWidget(id, format = "png") {
        return this._mkWidget("Server", id, format)
    }
}

module.exports = KoreanbotsWidgets