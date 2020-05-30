const req = require("node-fetch")

class Bots {
    constructor(options = {}) {
        this.options = options
        this.options.noWarning = options.noWarning !== true
        this.options.avoidRateLimit = options.avoidRateLimit === true

        this.cache = {}
        this.remainingPerEndpointCache = {}
        this._privateCache = {
            search: [], category: []
        }
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

                if (r.status.toString().startsWith("4") || r.status.toString().startsWith("5")) throw new Error(data.message || data)

                return data
            })
            .catch(e => {
                if (String(e).includes("body used already")) return this.cache[endpoint]

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
        if (this._privateCache[pageOrID]) return this._privateCache[pageOrID]

        if (typeof pageOrID === "string") {
            if (pageOrID.length <= 0) throw new Error("아이디를 입력 해주세요!")

            var res = await this._fetch(`/bots/get/${pageOrID}`)
        } else if (typeof pageOrID === "number" && pageOrID > 0) {
            if (pageOrID <= 0) throw new Error(this._mkError("pageOrID"))
            var res = await this._fetch(`/bots/get?page=${pageOrID}`) //eslint-disable-line no-redeclare
        } else throw new Error(this._mkError("pageOrID"))

        setTimeout(() => {
            if (this._privateCache[pageOrID]) delete this._privateCache[pageOrID]
        }, 60000 * 5)
        this._privateCache[pageOrID] = res
        return res
    }

    /**
     * 아이디로 봇 정보를 불러옵니다.
     * @async
     * @deprecated
     * @param {string|number} id 봇 ID
     * @returns Promise<getByID | getBots>
     */
    async getByID(id) {
        if (!id) throw new Error("아이디를 입력해주세요!")
        if (typeof id !== "string") throw new Error("올바르지 않은 아이디입니다.")

        process.emitWarning("해당 메소드 getByID는 deprecated 메소드이며, 추후 버젼에서 제거됩니다. Bots#get(id: string)를 대신 사용 해주세요.", "DeprecationWarning")

        const res = await this.get(id)

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
        if (this._privateCache.search[page][query]) return this._privateCache.search[page][query]

        if (!query) throw new Error(this._mkError("query"))
        if (typeof page !== "number" || page <= 0) throw new Error(this._mkError("페이지"))

        const res = await this._fetch(`/bots/search?q=${query}&page=${page}`)

        setTimeout(() => {
            if(this._privateCache.search[page][query]) delete this._privateCache.search[page][query]
        }, 60000 * 30)
        this._privateCache.search[page][query] = res
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
        if (this._privateCache.category[page][category]) return this._privateCache.category[page][category]

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
            "NSFW",
            "검색"
        ]
        if (!category) throw new Error(this._mkError("카테고리"))
        if (!Category.includes(category)) throw new Error(this._mkError("카테고리"))
        if (typeof page !== "number" || page <= 0) throw new Error(this._mkError("페이지"))

        const res = await this._fetch(`/bots/category/${category}?page=${page}`)

        setTimeout(() => {
            if (this._privateCache.category[page][category]) delete this._privateCache.category[page][category]
        }, 60000 * 30)
        this._privateCache.category[page][category] = res
        return res
    }

}

module.exports = Bots