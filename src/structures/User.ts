import { Base } from "./Base"
import { UserFlags } from "./core"
import { Github } from "./Github"
import { Collection } from "discord.js"

import type Koreanbots from "../managers/Koreanbots"
import type { RawUserInstance, Nullable, FetchResponse } from "./core"
import type { Bot } from "./Bot"

interface UserQuery {
    users(id: string): {
        get: () => Promise<FetchResponse<RawUserInstance>>
    }
}

export class User extends Base {
    protected readonly data!: RawUserInstance
    public readonly id: string
    public readonly flags: UserFlags
    public readonly github: Nullable<Github>
    public readonly fullTag: string
    public readonly username: string
    public readonly bots: Collection<string, Nullable<Bot> | undefined>

    constructor(public koreanbots: Koreanbots, data: RawUserInstance) {
        super()

        Object.defineProperty(this, "data", {
            writable: false,
            value: data
        })

        this.id = data.id
        this.flags = data.flags
        this.github = data.github ? new Github(this.koreanbots, data.github) : null
        this.username = data.username

        this.fullTag = `${data.username}#${data.tag}`

        this.bots = new Collection(data.bots.map(bot => [bot, this.koreanbots.bots.cache.get(bot)]))
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