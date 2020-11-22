import { FetchClient } from "./utils/FetchClient"
import { BotsOptions, FetchResponse, UsersOptions } from "./structures/"
import * as Utils from "./utils"
import { ValidationError } from "./utils/errors"

export class Users {
    #token: string
    public options: BotsOptions
    public fetchClient: FetchClient

    /**
     * 
     * @param {UsersOptions} [options] Users의 옵션
     */
    constructor(options: UsersOptions) {
        if (
            !options
            || !options.token
            || typeof options !== "object"
        ) throw new Error("[koreanbots/Users] 'token' 값이 정해지지 않았습니다.")

        /**
         * Koreanbots API에 접속할 토큰
         * @type {string}
         * @private
        */
        this.#token = options.token

        /**
         * Users의 옵션
         * @type {UsersOptions}
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
     * 유저를 Koreanbots에서 검색합니다.
     * @param {string} id - 유저 ID
     * @param {string[]} [query] - 반환되는 값 필터
     * @example
     * users.get("462355431071809537")
     *     .then(console.log)
     *     .catch(console.error)
     */
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

        throw new ValidationError("[koreanbots/Users#get] 유저 정보는 v1 API에서 제공되지 않습니다.")
    }

    /**
     * 로그인한 유저 정보를 확인합니다. 유저 토큰으로 Users 인스턴스를 생성한 경우에만 사용할수 있습니다.
     * @param {string[]} [query] - 반환되는 값 필터
     * @example
     * users.me()
     *     .then(console.log)
     *     .catch(console.error)
     */
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

        throw new ValidationError("[koreanbots/Users#get] 유저 정보는 v1 API에서 제공되지 않습니다.")
    }

    /**
     * 자신이 하트를 누른 봇들의 리스트를 얻습니다. 유저 토큰으로 Users 인스턴스를 생성한 경우에만 사용할수 있습니다.
     * @param {string[]} [query] - 반환되는 값 필터
     * @example
     * users.stars()
     *    .then(console.log)
     *    .catch(console.error)
     */
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

        throw new ValidationError("[koreanbots/Users#stars] 스타 정보는 v1 API에서 제공되지 않습니다.")
    }
}
