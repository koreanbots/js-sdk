const req = require("node-fetch")
const { BotsCache, BotsdotjsRemainingPerEndpoint, SearchCache, CategoryCache } = require("./cache")["bots.js"]

class Bots {
    constructor(options = {}) {
        this.options = options
        this.options.noWarning = options.noWarning === true
        this.options.avoidRateLimit = options.avoidRateLimit === undefined ? true : options.avoidRateLimit === true
        this.options.GCFlushOnMB = options.GCFlushOnMB || 5
        this.options.GCInterval = options.GCInterval || 60000 * 60 * 60

        this.cache = BotsCache
        this.remainingPerEndpointCache = BotsdotjsRemainingPerEndpoint
        this._privateCache = {
            search: SearchCache, category: CategoryCache
        }

        setInterval(() => {
            let cacheValueMB = this.cache.stats.vsize / 1024 / 1024
            let remainingPerEndpointCacheValueMB = this.remainingPerEndpointCache.stats.vsize / 1024 / 1024
            let searchValueMB = this.privateCache.search.stats.vsize / 1024 / 1024
            let categoryValueMB = this.privateCache.category.stats.vsize / 1024 / 1024

            function flush(cache) {
                cache.flushAll()
                if (!this.options.noWarning) process.emitWarning("Koreanbots cache flushed by Koreanbots GC, because this cache exceeded 10MB of size.", "KoreanbotsGCWarning")
            }

            if (cacheValueMB > this.options.GCFlushOnMB) flush(this.cache)
            if (remainingPerEndpointCacheValueMB > this.options.GCFlushOnMB) flush(this.remainingPerEndpointCache)
            if (searchValueMB > this.options.GCFlushOnMB) flush(this.privateCache.search)
            if (categoryValueMB > this.options.GCFlushOnMB) flush(this.privateCache.category)
        }, this.options.GCInterval)
    }

    /**
     * 오류 메세지를 생성합니다.
     * @private
     * @param {string|any} text - 값
     * @returns string
     */
    _mkError(text) {
        return `올바르지 않은 ${text}입니다.`
    }

    /**
     * API의 endpoint로 fetch합니다.
     * @private
     * @async
     * @param {string} endpoint - fetch할 endpoint
     * @param {Options} opt - fetch 옵션
     * @returns Promise<APIResponse | Error>
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
            return value
        }

        return req(`https://api.koreanbots.dev${endpoint}`, opt)
            .then(async r => {
                let data = r.json()
                if (!data.code) data.code = r.status

                if (r.status === 429 || data === { size: 0, timeout: 0 }) {
                    if (!this.options.noWarning) process.emitWarning(`Rate limited from ${r.url}`, "RateLimitWarning")

                    if (this.cache[endpoint] && opt.method !== "POST") return this.cache.get(endpoint)

                    return {
                        code: 429,
                        message: `Rate limited from ${r.url}`
                    }
                }

                if (r.status === 200 && opt.disableGlobalCache !== true) {
                    if (this.cache.has(endpoint)) this.cache.del(endpoint)

                    data["updatedTimestamp"] = Date.now()

                    try {
                        this.cache.set(endpoint, data)
                    } catch (err) {
                        if (String(err).includes("ECACHEFULL")) {
                            this.cache.flushAll()
                            this.cache.set(endpoint, data)
                        }
                    }
                }
                if (r.status === 200) {
                    if (this.remainingPerEndpointCache.has(endpoint)) this.remainingPerEndpointCache.del(endpoint)

                    try {
                        this.remainingPerEndpointCache.set(endpoint, r.headers.get("x-ratelimit-remaining"))
                    } catch (err) {
                        if (String(err).includes("ECACHEFULL")) {
                            this.remainingPerEndpointCache.flushAll()
                            this.cache.set(endpoint, r.headers.get("x-ratelimit-remaining"))
                        }
                    }
                }
                if (r.status.toString().startsWith("4") || r.status.toString().startsWith("5")) throw new Error(data.message || JSON.stringify(data))

                return data
            })
            .catch(e => {
                if (String(e).includes("body used already") && opt.method !== "POST") return this.cache[endpoint]

                throw e
            })
    }

    /**
     * pageOrID가 숫자가 될 경우 해당 페이지의 모든 봇을 불러오며, 문자열이 될 경우 해당 ID 문자열을 가진 봇을 불러옵니다.
     * @async
     * @param {string|number} pageOrID 페이지 또는 봇 ID
     * @returns Promise<getByID | getBots>
     */
    async get(pageOrID = 1) {
        if (this.cache.has(pageOrID)) return this.cache.get(pageOrID)

        if (typeof pageOrID === "string") {
            if (pageOrID.length <= 0) throw new Error("아이디를 입력 해주세요!")

            var res = await this._fetch(`/bots/get/${pageOrID}`)
        } else if (typeof pageOrID === "number" && pageOrID > 0) {
            if (pageOrID <= 0) throw new Error(this._mkError("pageOrID"))
            var res = await this._fetch(`/bots/get?page=${pageOrID}`) //eslint-disable-line no-redeclare
        } else throw new Error(this._mkError("pageOrID"))

        return res
    }

    /**
     * 해당 문자열이 들어간 봇의 이름을 가진 봇 리스트를 페이지로 불러옵니다.
     * @async 
     * @param {string} query 쿼리할 텍스트
     * @param {number} page 페이지
     * @returns Promise<getBots>
     */
    async search(query, page = 1) {
        if (this._privateCache.search.has(`${query}/${page}`)) return this._privateCache.search.get(`${query}/${page}`)

        if (!query) throw new Error(this._mkError("query"))
        if (typeof page !== "number" || page <= 0) throw new Error(this._mkError("페이지"))

        const res = await this._fetch(`/bots/search?q=${query}&page=${page}`, {
            method: "GET",
            headers: {
                token: this.token,
                "Content-Type": "application/json"
            },
            disableGlobalCache: true
        })

        setTimeout(() => {
            if (this._privateCache.search.has(`${query}/${page}`)) this._privateCache.search.del(`${query}/${page}`)
        }, 60000 * 30)
        this._privateCache.search.set(`${query}/${page}`, res)
        return res
    }

    /**
     * 해당 카테고리의 봇 리스트를 페이지로 불러옵니다.
     * @async
     * @param {string} query 쿼리할 텍스트
     * @param {number} page 페이지
     * @returns Promise<getBots>
     */
    async category(category, page = 1) {
        if (this._privateCache.category.has(`${category}/${page}`)) return this._privateCache.category.get(`${category}/${page}`)

        let Category = [
            "관리",
            "뮤직",
            "전적",
            "웹 대시보드",
            "로깅",
            "도박",
            "게임",
            "밈",
            "레벨링",
            "유틸리티",
            "번역",
            "대화",
            "검색"
        ]
        if (!category) throw new Error(this._mkError("카테고리"))
        if (!Category.includes(category)) throw new Error(this._mkError("카테고리"))
        if (typeof page !== "number" || page <= 0) throw new Error(this._mkError("페이지"))

        const res = await this._fetch(`/bots/category/${category}?page=${page}`, {
            method: "GET",
            headers: {
                token: this.token,
                "Content-Type": "application/json"
            },
            disableGlobalCache: true
        })

        setTimeout(() => {
            if (this._privateCache.category.has(`${category}/${page}`)) this._privateCache.category.del(`${category}/${page}`)
        }, 60000 * 30)
        this._privateCache.category.set(`${category}/${page}`, res)
        return res
    }

}

module.exports = Bots
