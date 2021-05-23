import { Base } from "./Base"
import { UserFlags } from "../utils/types"
import { Github } from "./Github"
import { Collection } from "discord.js"
import * as Utils from "../utils"

import type { Koreanbots } from "../client/Koreanbots"
import type { RawUserInstance, Nullable, FetchResponse } from "../utils/types"
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

        this.bots = new Collection(data.bots.map(bot => {
            const id = typeof bot === "string" ? bot : bot.id
            return [id, this.koreanbots.bots.cache.get(id)]
        }))

        this.cacheAfterCacheMiss()
    }

    private async cacheAfterCacheMiss() {
        if (!this.bots.filter(f => !f).size) return

        process.nextTick(async () => {
            await Utils.waitFor(1000)

            const botsFromApi = await Promise.all(
                this.bots.filter(e => !e).map((v, k) => this.koreanbots.bots.fetch(k))
            )

            const cache = (bot: Bot) => {
                if (!bot) return

                this.bots.set(bot?.id, this.koreanbots.bots.cache.get(bot?.id))
            }

            botsFromApi.map(cache)
        })
    }

    is(type: keyof typeof UserFlags | UserFlags): boolean {
        if (typeof type === "number") {
            if (type === 0) return true
            return !!(this.flags & type)
        }

        if (UserFlags[type] === 0) return true
        return !!(this.flags & UserFlags[type])
    }

    async fetch(): Promise<User> {
        const user = await this.koreanbots.api<UserQuery>().users(this.id).get()

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return new User(this.koreanbots, user.data!)
    }
}