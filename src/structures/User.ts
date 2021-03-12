import { Base } from "./Base"
import { RawBotInstance, UserFlags } from "../util/types"
import { Github } from "./Github"
import { Collection } from "discord.js"
import Utils from "../util"

import type { Koreanbots } from "../client/Koreanbots"
import type { RawUserInstance, Nullable, FetchResponse } from "../util/types"
import type { Bot } from "./Bot"

interface UserQuery {
    users(id: string): {
        get: () => Promise<FetchResponse<RawUserInstance>>
    }
}

export class User extends Base {
    public readonly id: string
    public readonly flags: UserFlags
    public readonly github: Nullable<Github>
    public readonly fullTag: string
    public readonly username: string
    public readonly bots: Collection<string, Nullable<Bot> | undefined>

    constructor(public koreanbots: Koreanbots, data: RawUserInstance) {
        super()

        this.id = data.id
        this.flags = data.flags
        this.github = data.github ? new Github(this.koreanbots, data.github) : null
        this.username = data.username

        this.fullTag = `${data.username}#${data.tag}`

        this.bots = new Collection((data.bots as RawBotInstance[]).map(bot => [
            bot.id, this.koreanbots.bots.cache.get(bot.id)
        ]))

        this.cacheAfterCacheMiss(data)
    }

    private async cacheAfterCacheMiss(data: RawUserInstance) {
        const botsFromApi = await Promise.all(
            data.bots
                .filter(f => !this.koreanbots.bots.cache.get(typeof f === "string" ? f : f.id))
                .map(b => this.koreanbots.bots.fetch(typeof b === "string" ? b : b.id))
        )

        process.nextTick(async () => {
            await Utils.waitFor(1000)

            const cache = (bot: FetchResponse<Bot>) => {
                if (!bot.data?.id) return

                this.bots.set(bot.data?.id, this.koreanbots.bots.cache.get(bot.data?.id))
            }

            botsFromApi.map(cache)
        })
    }

    is(type: keyof typeof UserFlags | UserFlags): boolean {
        if (typeof type === "number") return !!(this.flags & type)

        return !!(this.flags & UserFlags[type])
    }

    async fetch(): Promise<User> {
        const user = await this.koreanbots.api<UserQuery>().users(this.id).get()

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return new User(this.koreanbots, user.data!)
    }
}