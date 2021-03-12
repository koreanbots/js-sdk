import { snowflakeRegex } from "../util/Constants"
import APIRouter from "../rest/APIRouter"
import { Mybot } from "../managers/Mybot"
import { BotManager } from "../managers/BotManager"
import { UserManager } from "../managers/UserManager"

import type { KoreanbotsOptions, ProxyValidator } from "../util/types"

export class Koreanbots {
    public readonly options!: KoreanbotsOptions
    public readonly api!: ReturnType<typeof APIRouter>
    public mybot!: Mybot
    public bots: BotManager
    public users: UserManager

    static validator = <T>(): ProxyValidator<T> => ({
        set(obj, prop, value) {
            switch (prop) {
            case "clientID":
                if (typeof value !== "string") throw new TypeError(`"clientID" 옵션은 문자열이여야 합니다. (받은 타입: ${typeof value})`)
                if (!snowflakeRegex.test(obj[prop] as unknown as string)) 
                    throw new TypeError("\"clientID\" 옵션은 디스코드의 ID 체계인 Snowflake여야 합니다.")
                break
            }

            obj[prop] = value
            return true
        }
    })

    constructor(options: KoreanbotsOptions) {
        this.options = options ?? {}

        Object.defineProperty(this, "api", {
            writable: false,
            value: APIRouter(this.options.apiOptions ?? {})
        })

        const optionsProxy = new Proxy(this.options, Koreanbots.validator<KoreanbotsOptions>())

        optionsProxy.clientID = options.clientID

        this.bots = new BotManager(this, options.botOptions)
        this.users = new UserManager(this, options.userOptions)
        this.mybot = new Mybot(this, options.clientID)
    }
}
