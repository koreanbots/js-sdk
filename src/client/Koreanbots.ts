import { snowflakeRegex } from "../utils/Constants"
import APIRouter from "../rest/APIRouter"

import { Mybot } from "../managers/Mybot"
import { BotManager } from "../managers/BotManager"
import { UserManager } from "../managers/UserManager"
import { WidgetManager } from "../managers/WidgetManager"
import { ServerManager } from "../managers/ServerManager"

import type { BotManagerOptions, KoreanbotsOptions, ProxyValidator, UserManagerOptions, WidgetManagerOptions } from "../utils/types"

const defaultCacheMaxSize = 100
const defaultCacheSweepInterval = 10000

export class Koreanbots {
    public readonly options!: KoreanbotsOptions
    public readonly api!: ReturnType<typeof APIRouter>
    public mybot!: Mybot
    public bots: BotManager
    public users: UserManager
    public widgets: WidgetManager
    public servers: ServerManager

    static validator = <T>(): ProxyValidator<T> => ({
        set(obj, prop, value) {
            switch (prop) {
            case "clientID":
                if (typeof value !== "string") throw new TypeError(`"clientID" 옵션은 문자열이여야 합니다. (받은 타입: ${typeof value})`)
                if (!snowflakeRegex.test(obj[prop] as unknown as string)) throw new TypeError("\"clientID\" 옵션은 Snowflake여야 합니다.")
                break
            }

            obj[prop] = value
            return true
        }
    })

    /**
     * 새로운 Koreanbots 인스턴스를 생성합니다.
     * @param options 옵션
     * @example
     * ```js
     * new Koreanbots({
     *     clientID: process.env.CLIENT_ID,
     *     api: {
     *         token: process.env.KOREANBOTS_TOKEN
     *     },
     *     // 글로벌 캐시 옵션이며, 누락할 경우 모든 캐시 옵션이 각각의 기본 값으로 설정됩니다 (로컬 캐시 옵션이 우선권을 가집니다)
     *     maxSize: 250, // (기본값: 100) 캐시에 최대 250개의 내용을 저장
     *     sweepInterval: 60000 * 15, // (기본값: 10000 = 10초) 캐시에 저장한 내용을 15분 뒤에 삭제합니다.
     *     users: {
     *         cache: { // 이 캐시 설정은 로컬이므로 앞서 적은 글로벌 캐시 옵션보다 우선권을 갖습니다.
     *             maxSize: 500, // (기본값: 100)
     *             sweepInterval: 60000 * 30 // (기본값: 60000 * 60)
     *         }
     *     }
     * })
     * ```
     */
    constructor(options: KoreanbotsOptions) {
        this.options = options

        Object.defineProperty(this, "api", {
            writable: false,
            value: APIRouter(this.options.api ?? {})
        })

        const optionsProxy = new Proxy(this.options, Koreanbots.validator<KoreanbotsOptions>())

        optionsProxy.clientID = options.clientID

        if (!this.options?.maxSize) this.options.maxSize = defaultCacheMaxSize
        if (!this.options?.sweepInterval) this.options.sweepInterval = defaultCacheSweepInterval

        this.bots = new BotManager(this, this.getOptions(options.bots))
        this.users = new UserManager(this, this.getOptions(options.users))
        this.widgets = new WidgetManager(this, this.getOptions(options.widgets))
        this.servers = new ServerManager(this, this.getOptions(options.servers))

        this.mybot = new Mybot(this, options.clientID)
    }

    /**
     * 로컬 캐시 옵션이 글로벌 캐시 옵션보다 우선권을 가지는 캐시 정책을 가진 옵션을 돌려줍니다.
     * @param options 
     * @private
     */
    private getOptions(options?: BotManagerOptions | UserManagerOptions | WidgetManagerOptions) {
        return {
            ...options,
            cache: {
                ...(options?.cache ?? {}),
                ...this.options
            }
        }
    }
}
