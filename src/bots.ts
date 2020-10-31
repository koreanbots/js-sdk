import FetchClient from "./utils/FetchClient"
import { BotsOptions, Category, FetchResponse, ListType, ListTypes } from "./structures/"
import Utils from "./utils"
import { ValidationError } from "./utils/errors"

class KoreanBots {
    #token: string
    public options: BotsOptions
    private fetchClient: FetchClient

    constructor(options: BotsOptions) {
        if (
            !options
            || !options.token
            || typeof options !== "object"
        ) throw new Error("[koreanbots/KoreanBots] 'token' 값이 정해지지 않았습니다.")

        this.#token = options.token

        this.options = options
        this.options.hideToken = options.hideToken ?? false
        this.options.token = this.options.hideToken ? Utils.hide(options.token) : options.token
        this.options.apiVersion = options.apiVersion ?? 2
        this.options.avoidRateLimit = options.avoidRateLimit ?? true
        this.options.cacheTTL = options.cacheTTL ?? 60000 * 60

        this.fetchClient = new FetchClient({
            token: this.#token,
            hideToken: this.options.hideToken,
            apiVersion: this.options.apiVersion,
            avoidRateLimit: this.options.avoidRateLimit,
            noWarning: this.options.noWarning
        })
    }

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

    async list(type: ListType, name: string, page = 1, query?: string[]): Promise<FetchResponse> {
        if (query?.includes("id")) query = query.filter(f => f !== "id")
        if (!ListTypes[type]) throw new ValidationError(`[koreanbots/KoreanBots#list] 올바르지 않은 'ListType'입니다. ListType: ${Object.keys(ListTypes).join(", ")}`)

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
                }
            }
            `)

            return res
        }

        let url: string | void
        if (type === "SEARCH") url = `/bots/search?q=${name}&page=${page}`
        if (type === "CATEGORY") url = `/bots/category/${name}?page=${page}`

        if (!url) throw new ValidationError(`[koreanbots/KoreanBots#list] '${type}' 리스팅은 v1 API에서 지원되지 않습니다.`)

        const res = await this.fetchClient.fetch(url)

        return res
    }


    async search(name: string, page = 1, query?: string[]): Promise<FetchResponse> {
        return this.list("SEARCH", name, page, query)
    }

    async category(name: unknown, page = 1, query?: string[]): Promise<FetchResponse> {
        if (!Category[name as Category]) throw new ValidationError(`[koreanbots/KoreanBots#category] '${name as Category}'는(은) 유효한 카테고리가 아닙니다.`)

        return this.list("CATEGORY", name as string, page, query)
    }

    async vote(name: string, page = 1, query?: string[]): Promise<FetchResponse> {
        return this.list("VOTE", name, page, query)
    }

    // new는 예약어
    async newList(name: string, page = 1, query?: string[]): Promise<FetchResponse> {
        return this.list("NEW", name, page, query)
    }

    async trusted(name: string, page = 1, query?: string[]): Promise<FetchResponse> {
        return this.list("TRUSTED", name, page, query)
    }

    async partnered(name: string, page = 1, query?: string[]): Promise<FetchResponse> {
        return this.list("PARTNERED", name, page, query)
    }
}

export default KoreanBots
