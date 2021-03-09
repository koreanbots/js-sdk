import { snowflakeRegex } from "../util/Constants"
import APIRouter from "../rest/APIRouter"
import { Bot } from "src/structures/Bot"

import type { FetchResponse, KoreanbotsOptions, ProxyValidator } from "../structures/core"
import type { RequestInit } from "node-fetch"

interface BotQuery {
    bots(id: string): {
        stats: {
            post: (options: RequestInit) => Promise<FetchResponse<Bot>>
        }
    }
}

class Koreanbots {
    public readonly options!: KoreanbotsOptions
    public readonly api!: ReturnType<typeof APIRouter>

    static validator = <T>(): ProxyValidator<T> => ({
        set(obj, prop, value) {
            switch (prop) {
            case "clientID":
                if (typeof value !== "string") throw new TypeError(`"clientID" 옵션은 문자열이여야 합니다. (받은 타입: ${typeof value})`)
                if (!snowflakeRegex.test(value)) throw new TypeError("\"clientID\" 옵션은 디스코드의 ID 체계인 Snowflake여야 합니다.")
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
    }

    async update(count: number): Promise<void> {
        const body = JSON.stringify({ count })
        const response = await this.api<BotQuery>().bots(this.options.clientID).stats.post({
            body
        })

        console.log(response)
    }
}

export default Koreanbots 
