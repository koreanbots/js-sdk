import FetchClient from "./utils/FetchClient"
import { BotsOptions, FetchResponse, UsersOptions } from "./structures/"
import Utils from "./utils"
import { ValidationError } from "./utils/errors"

class KoreanbotsUsers {
    #token: string
    public options: BotsOptions
    private fetchClient: FetchClient

    constructor(options: UsersOptions) {
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
                user(id: "${id}") {
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
                user(id: "${id}") {
                    id
                    avatar
                    tag
                    username
                    perm
                    github
                    bots {
                        ... on Bot {
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
            }
            `)

            return res
        }

        throw new ValidationError("[koreanbots/KoreanbotsUsers#get] 유저 정보는 v1 API에서 제공되지 않습니다.")
    }

    async me(query?: string[]): Promise<FetchResponse> {
        if (query?.includes("id")) query = query.filter(f => f !== "id")

        if (query) {
            const res = await this.fetchClient.gqlFetch(`
            {
                me {
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
                me {
                    id
                    avatar
                    tag
                    username
                    perm
                    github
                    bots {
                        ... on Bot {
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
            }
            `)

            return res
        }

        throw new ValidationError("[koreanbots/KoreanbotsUsers#get] 유저 정보는 v1 API에서 제공되지 않습니다.")
    }

    async stars(query?: string[]): Promise<FetchResponse> {
        if (query?.includes("id")) query = query.filter(f => f !== "id")

        if (query) {
            const res = await this.fetchClient.gqlFetch(`
            {
                stars {
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
                stars {
                    ... on Bot {
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

        throw new ValidationError("[koreanbots/KoreanbotsUsers#stars] 스타 정보는 v1 API에서 제공되지 않습니다.")
    }
}

export default KoreanbotsUsers
