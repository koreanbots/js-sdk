import FetchClient from "./utils/FetchClient"
import { BotsOptions, Category, FetchResponse, ListType, ListTypes } from "./structures/"
import Utils from "./utils"
import { ValidationError } from "./utils/errors"

class Bots {
    #token: string
    public options: BotsOptions
    public fetchClient: FetchClient

    /**
     * 
     * @param {BotsOptions} [options] - Bots의 옵션
     */
    constructor(options: BotsOptions) {
        if (
            !options
            || !options.token
            || typeof options !== "object"
        ) throw new Error("[koreanbots/Bots] 'token' 값이 정해지지 않았습니다.")

        /**
         * Koreanbots API에 접속할 토큰
         * @type {string}
         * @private
        */
        this.#token = options.token

        /**
         * Bots의 옵션
         * @type {BotsOptions}
         */
        this.options = options
        this.options.hideToken = options.hideToken ?? false
        this.options.token = this.options.hideToken ? Utils.hide(options.token) : options.token
        this.options.apiVersion = options.apiVersion ?? 2
        this.options.avoidRateLimit = options.avoidRateLimit ?? true
        this.options.cacheTTL = options.cacheTTL ?? 60000 * 60
        this.options.noWarning = options.noWarning ?? false

        /**
         * Koreanbots API에 요청할 GraphQL/HTTP 클라이언트
         * @type {FetchClient}
        */
        this.fetchClient = new FetchClient({
            token: this.#token,
            hideToken: this.options.hideToken,
            apiVersion: this.options.apiVersion,
            avoidRateLimit: this.options.avoidRateLimit,
            noWarning: this.options.noWarning
        })
    }

    /**
     * 봇의 정보를 Koreanbots에서 불러옵니다.
     * @param {string} id - 봇 ID
     * @param {string[]} [query] - 반환된느 값 필터
     * @example
     * bots.get("653534001742741552")
     *     .then(console.log)
     *     .catch(console.error)
     */
    async get(id: string, query?: string[]): Promise<FetchResponse> {
        if (query?.includes("id")) query = query.filter(f => f !== "id")

        if (query) {
            const res = await this.fetchClient.gqlFetch(`
            {
                bot(id: "${id}") {
                    id
                    ${query.join(" ".repeat(8) + "\n")}
                }
            }
            `)

            return res
        }

        if ((this.options.apiVersion ?? 2) >= 2) {
            const res = await this.fetchClient.gqlFetch(`
            {
                bot(id: "${id}") { 
                    id
                    lib
                    prefix
                    name
                    servers
                    votes
                    intro
                    desc
                    avatar
                    url
                    web
                    git
                    category
                    tag
                    discord
                    state
                    verified
                    trusted
                    boosted
                    partnered
                    vanity
                    banner
                    status
                    bg
                    owners {
                        id
                        avatar
                        tag
                        username
                        perm
                        github
                        bots {
                            id
                        }
                    }
                }
            }
            `)

            return res
        }

        const res = await this.fetchClient.fetch(`/bots/get/${id}`)

        return res
    }

    /**
     * Koreanbots의 봇들을 리스팅합니다.
     * @param {ListType} type - ListType (@see https://beta.koreanbots.dev/graphql-docs/listtype.doc.html)
     * @param {string} [name] - 검색어 (필요시)
     * @param {number} [page=1] - 페이지
     * @param {string[]} [query] - 반환되는 값 필터
     * @example
     * bots.list("TRUSTED")
     *     .then(console.log)
     *     .catch(console.error)
     */
    async list(type: ListType, name?: string, page = 1, query?: string[]): Promise<FetchResponse> {
        if (query?.includes("id")) query = query.filter(f => f !== "id")
        if (!ListTypes[type] && ListTypes[type] !== 0) throw new ValidationError(`[koreanbots/Bots#list] 올바르지 않은 'ListType'입니다. ListType: ${Object.keys(ListTypes).filter(f => isNaN(parseInt(f))).join(", ")}`)

        if (query) {
            const res = await this.fetchClient.gqlFetch(`
            {
                list(type: ${type}, page: ${page}, query: "${name}") {
                    data {
                        id
                        ${query.join(" ".repeat(8) + "\n")}
                    }
                }
            }
            `)

            return res
        }

        if ((this.options.apiVersion ?? 2) >= 2) {
            const res = await this.fetchClient.gqlFetch(`
            {
                list(type: ${type}, page: ${page}, query: "${name}") {
                    data {
                        id
                        lib
                        prefix
                        name
                        servers
                        votes
                        intro
                        desc
                        avatar
                        url
                        web
                        git
                        category
                        tag
                        discord
                        state
                        verified
                        trusted
                        boosted
                        partnered
                        vanity
                        banner
                        status
                        bg
                        owners {
                            id
                            avatar
                            tag
                            username
                            perm
                            github
                            bots {
                                id
                            }
                        }
                    }
                    currentPage
                    totalPage
                }
            }
            `)

            return res
        }

        let url: string | void
        if (type === "SEARCH") url = `/bots/search?q=${name}&page=${page}`
        if (type === "CATEGORY") url = `/bots/category/${name}?page=${page}`

        if (!url) throw new ValidationError(`[koreanbots/Bots#list] '${type}' 리스팅은 v1 API에서 지원되지 않습니다.`)

        const res = await this.fetchClient.fetch(url)

        return res
    }


    /**
     * 검색어가 이름, 설명, 또는 intro에 포함되는 봇들을 찾습니다.
     * @param {string} name - 검색어 
     * @param {number} [page=1] - 페이지 
     * @param {string[]} [query] - 반환되는 값 필터
     * @example
     * bots.search("검색어")
     *    .then(console.log)
     *    .catch(console.error)
     */
    async search(name: string, page = 1, query?: string[]): Promise<FetchResponse> {
        return this.list("SEARCH", name, page, query)
    }

    /**
     * 특정 카테고리를 가진 봇들을 검색합니다.
     * @param {Category} name - 카테고리 
     * @param {number} [page=1] - 페이지 
     * @param {string[]} [query] - 반환되는 값 필터
     * @example
     * bots.category("관리")
     *     .then(console.log)
     *     .catch(console.error)
     */
    async category(name: unknown, page = 1, query?: string[]): Promise<FetchResponse> {
        if (!Category[name as Category]) throw new ValidationError(`[koreanbots/Bots#category] '${name as Category}'는(은) 유효한 카테고리가 아닙니다.`)

        return this.list("CATEGORY", name as string, page, query)
    }

    /**
     * 하트 수 순서대로 봇의 목록을 불러옵니다.
     * @param {number} [page=1] - 페이지
     * @param {string[]} [query] - 반환되는 값 필터
     * @example
     * bots.vote()
     *    .then(console.log)
     *    .catch(console.error)
     */
    async vote(page = 1, query?: string[]): Promise<FetchResponse> {
        return this.list("VOTE", "리스팅에반영되지않는값", page, query)
    }

    /**
     * 새로 추가된 봇의 목록을 불러옵니다.
     * @param {number} [page=1] - 페이지
     * @param {string[]} [query] - 반환되는 값 필터
     * @example
     * bots.newList()
     *    .then(console.log)
     *    .catch(console.error)
    */
    async newList(page = 1, query?: string[]): Promise<FetchResponse> {
        // new는 예약어
        return this.list("NEW", "리스팅에반영되지않는값", page, query)
    }

    /**
     * 신뢰된 봇들의 목록을 불러옵니다.
     * @param {number} [page=1] - 페이지
     * @param {string[]} [query] - 반환되는 값 필터
     * @example
     * bots.trusted()
     *    .then(console.log)
     *    .catch(console.error)
    */
    async trusted(page = 1, query?: string[]): Promise<FetchResponse> {
        return this.list("TRUSTED", "리스팅에반영되지않는값", page, query)
    }

    /**
     * 파트너 봇의 목록을 불러옵니다.
     * @param {number} [page=1] - 페이지
     * @param {string[]} [query] - 반환되는 값 필터
     * @example
     * bots.partnered()
     *    .then(console.log)
     *    .catch(console.error)
    */
    async partnered(page = 1, query?: string[]): Promise<FetchResponse> {
        return this.list("PARTNERED", "리스팅에반영되지않는값", page, query)
    }
}

export default Bots
