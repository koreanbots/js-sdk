const req = require("node-fetch")
const Bots = require("./bots")
const KoreanbotsClient = require("./KoreanbotsClient")
const { KoreanbotsCache, RemainingEndpointCache } = require("./cache")["index.js"]

let privateToken = null

function hide(token) {
    return token.split(".").map((v, i) => i !== 0
        ? v.replace(/\w|([/,!\\^${}[\]().+?|<>\-&])/gi, "*")
        : v)
        .join(".")
}

function flush(cache) {
    if (cache.size >= this.options.autoFlush) cache.clear()

    return cache
}

function callback() {
    return [this.cache, this.remainingPerEndpointCache].map(c => flush.call(this, c))
}

class MyBot {
    constructor(token, options = {}) {
        if (!token || typeof token !== "string") throw new Error("올바른 토큰을 입력해주세요!")

        this.options = options || {}
        this.options.hideToken = options.hideToken === true
        this.options.noWarning = options.noWarning === true
        this.options.avoidRateLimit = options.avoidRateLimit === undefined ? true : options.avoidRateLimit === true
        this.options.autoFlush = options.autoFlush || 100
        this.options.autoFlushInterval = options.autoFlushInterval || 60000 * 60

        this.updatedAt = null
        this.updatedTimestamp = null

        this.lastGuildCount = 0

        this.cache = KoreanbotsCache
        this.remainingPerEndpointCache = RemainingEndpointCache

        privateToken = token

        if (this.options.autoFlushInterval && this.options.autoFlushInterval > 10000)
            setInterval(callback.bind(this), this.options.autoFlushInterval)
    }

    set token(value) {
        throw new Error(`'this.token' 값은 ${value.toString ? value.toString() : JSON.stringify(value)}으로 수정될수 없습니다.`)
    }

    get token() {
        if (this.options.hideToken) return hide(privateToken)

        return privateToken
    }

    /**
     * 넘겨진 값이 JSON인지 확인합니다.
     * @private
     * @param {any} something - JSON인지 확인할 값
     * @returns boolean
     */
    isJSON(something) {
        try {
            JSON.parse(something)
            return true
        } catch {
            return false
        }
    }

    /**
     * API의 endpoint로 fetch합니다.
     * @private
     * @async
     * @param {string} endpoint - fetch할 endpoint
     * @param {Options} opt - fetch 옵션
     * @returns Promise<APIResponse>
     */
    async _fetch(endpoint, opt) {
        endpoint = encodeURI(endpoint)

        if (
            this.options.avoidRateLimit
            && this.remainingPerEndpointCache.get(endpoint)
            && parseInt(this.remainingPerEndpointCache.get(endpoint), 10) <= 1
            && this.cache.get(endpoint)
            && opt.method !== "POST"
        ) {
            let value = this.cache.get(endpoint)
            if (!value.code) value.code = 200
            if (!value.isCache) value.isCache = true
            return value
        }

        return req(`https://api.koreanbots.dev/v1${endpoint}`, opt)
            .then(async r => {
                let data = r.json()
                if (!data.code) data.code = r.status

                if (r.status === 429 || data === { size: 0, timeout: 0 }) {
                    if (!this.options.noWarning) process.emitWarning(`Rate limited from ${r.url}`, "RateLimitWarning")

                    if (this.cache.has(endpoint) && opt.method !== "POST") {
                        let cache = this.cache.get(endpoint)
                        if (!cache.isCache) cache.isCache = true
                        return cache
                    }

                    return {
                        isCache: false,
                        code: 429,
                        message: `Rate limited from ${r.url}`
                    }
                }

                if (r.status === 200) {
                    if (this.cache.has(endpoint)) this.cache.delete(endpoint)

                    data["updatedTimestamp"] = Date.now()

                    this.cache.set(endpoint, data)

                    if (this.remainingPerEndpointCache.has(endpoint)) this.remainingPerEndpointCache.delete(endpoint)

                    this.remainingPerEndpointCache.set(endpoint, r.headers.get("x-ratelimit-remaining"))
                }
                if (r.status.toString().startsWith("4") || r.status.toString().startsWith("5")) {
                    if (r.status === 400 && process.uptime() < 60000) return { isCache: false, code: 400, canBeIgnored: true }// Error: {"code":400}
                    throw new Error(data.message || JSON.stringify(data))
                }

                data.isCache = false

                return data
            })
            .catch(e => {
                if (String(e).includes("body used already") && opt.method !== "POST") return this.cache[endpoint]

                throw e
            })
    }

    /**
     * 봇의 서버 수를 업데이트합니다.
     * @async
     * @param {number} count - 새로운 서버 수
     * @returns Promise<APIResponse>
     */
    async update(count) {
        if ((!count && count !== 0) || typeof count !== "number") throw new Error("서버 수가 주어지지 않았거나, 올바르지 않은 타입입니다.")
        if (this.lastGuildCount === count) return

        const res = await this._fetch("/bots/servers", {
            method: "POST",
            headers: {
                token: privateToken,
                "Content-Type": "application/json"
            },
            body: `{"servers": ${count}}`
        })

        if (res.code !== 200 && res.code !== 429 && !res.canBeIgnored) throw new Error(typeof res.message === "string" ? res.message : `올바르지 않은 응답이 반환되었습니다.\n응답: ${JSON.stringify(res)}`, res.code)

        this.updatedTimestamp = Date.now()
        this.updatedAt = new Date(this.updatedTimestamp)
        this.lastGuildCount = count

        return res
    }

    /**
     * 해당 유저가 이 봇에 하트를 눌렀는지 확인합니다.
     * @async
     * @param {string} id - 확인할 유저 ID
     * @returns Promise<APIResponse>
     */
    async checkVote(id) {
        if (!id || typeof id !== "string") throw new Error("아이디가 주어지지 않았거나, 올바르지 않은 아이디입니다!")

        if (this.cache.get(id)) return this.cache.get(id)

        const res = await this._fetch(`/bots/voted/${id}`, {
            method: "GET",
            headers: {
                token: privateToken,
                "Content-Type": "application/json"
            }
        })
        if (res.code !== 200) throw new Error(typeof res.message === "string" ? res.message : `올바르지 않은 응답이 반환되었습니다.\n응답: ${JSON.stringify(res)}`)

        setTimeout(() => {
            if (this.cache.has(id)) this.cache.delete[id]
        }, 60000 * 60 * 6)
        this.cache.set(id, res)
        return res
    }
}

let cache = require("./cache")

module.exports = {
    MyBot, Bots, KoreanbotsClient, _cache: {
        MyBot: cache["index.js"],
        Bots: cache["bots.js"],
        Widgets: cache["widget.js"]
    }, 
    get Widgets() {
        return require("./widget")
    }
}
