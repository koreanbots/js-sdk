const req = require("node-fetch")
const Bots = require("./bots")
const KoreanbotsClient = require("./KoreanbotsClient")

class MyBot {
    constructor(token, options = {}) {
        if (!token || typeof token !== "string") throw new Error("올바른 토큰을 입력해주세요!")

        this.token = token
        this.options = options
        this.options.noWarning = options.noWarning !== true
        this.options.avoidRateLimit = options.avoidRateLimit === true

        this.updatedAt = null
        this.updatedTimestamp = null

        this.cache = {}
        this.remainingPerEndpointCache = {}
    }

    /**
     * 넘겨진 값이 JSON인지 확인합니다.
     * @private
     * @param {object|any} something - JSON인지 확인할 값
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
            && this.remainingPerEndpointCache[endpoint]
            && parseInt(this.remainingPerEndpointCache[endpoint], 10) <= 1
            && this.cache[endpoint]
        ) {
            let value = this.cache[endpoint]
            if (!value.code) value.code = 200
            return value
        }

        return req(`https://api.koreanbots.dev${endpoint}`, opt)
            .then(async r => {
                let data = r.json()
                if (!data.code) data.code = r.status

                if (r.status === 429 || data === { "size": 0, "timeout": 0 }) {
                    if (this.options.noWarning) process.emitWarning(`Rate limited from ${r.url}`, "RateLimitWarning")

                    if (this.cache[endpoint]) return this.cache[endpoint]

                    return {
                        code: 429,
                        message: `Rate limited from ${r.url}`
                    }
                }

                if (r.status === 200) this.cache[endpoint] = data
                if (r.status === 200) this.remainingPerEndpointCache[endpoint] = r.headers.get("x-ratelimit-remaining")

                if (r.status.toString().startsWith("4") || r.status.toString().startsWith("5")) throw new Error(data.message || JSON.stringify(data))

                return data
            })
            .catch(e => {
                if (String(e).includes("body used already")) return this.cache[endpoint]

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

        const res = await this._fetch("/bots/servers", {
            method: "POST",
            headers: {
                token: this.token,
                "Content-Type": "application/json"
            },
            body: `{"servers": ${count}}`
        })

        if (res.code !== 200 && res.code !== 429) throw new Error(typeof res.message === "string" ? res.message : `올바르지 않은 응답이 반환되었습니다.\n응답: ${JSON.stringify(res)}`, res.code)

        this.updatedTimestamp = Date.now()
        this.updatedAt = new Date(this.updatedTimestamp)

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

        if (this.cache[id]) return this.cache[id]

        const res = await this._fetch(`/bots/voted/${id}`, {
            method: "GET",
            headers: {
                token: this.token,
                "Content-Type": "application/json"
            }
        })
        if (res.code !== 200) throw new Error(typeof res.message === "string" ? res.message : `올바르지 않은 응답이 반환되었습니다.\n응답: ${JSON.stringify(res)}`)

        setTimeout(() => {
            if (this.cache[id]) delete this.cache[id]
        }, 60000 * 60 * 6)
        this.cache[id] = res
        return res
    }
}

module.exports = { MyBot, Bots, KoreanbotsClient }