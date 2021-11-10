import { Emoji, Collection } from "discord.js"
import { Base } from "./Base"
import { User } from "./User"
import { Discord } from "./Discord"
import { RawUserInstance, ServerFlags } from "../utils/types"
import * as Utils from "../utils"

import type {
    RawServerInstance,
    Nullable,
    ServerCategory,
    ServerState
} from "../utils/types"
import type { Koreanbots } from "../client/Koreanbots"
import { Bot } from ".."
import { KoreanbotsError } from "../utils/Errors"


export class Server extends Base {
    public id: string
    public name: string
    public icon: Nullable<string>
    public readonly owner: Nullable<User>
    public flags: ServerFlags
    public votes: number
    members: Nullable<number>
    boostTier: Nullable<number>
    emojis: Emoji[]
    desc: string
    public category: ServerCategory[]
    invite: Discord
    bots: Bot[]
    vanity: Nullable<string>
    bg: Nullable<string>
    banner: Nullable<string>
    state: ServerState
    public readonly admins: Collection<string, Nullable<User> | undefined>

    constructor(public readonly koreanbots: Koreanbots, data: RawServerInstance) {
        super()

        this.id = data.id
        this.name = data.name
        this.icon = data.icon
        this.owner = data.owner ? new User(this.koreanbots, data.owner) : null
        this.flags = data.flags
        this.votes = data.votes
        this.members = data.members
        this.boostTier = data.boostTier
        this.emojis = data.emojis.map(emoji => (
            // @ts-expect-error unable to access client
            new Emoji(null, emoji)
        ))
        this.desc = data.desc
        this.category = data.category
        this.invite = new Discord(this.koreanbots, data.vanity ?? data.invite)
        this.bots = data.bots.map(bot => (
            new Bot(this.koreanbots, bot)
        ))
        this.vanity = data.vanity
        this.bg = data.bg
        this.banner = data.banner
        this.state = data.state
        this.admins = new Collection()

        this.fetchAdmins()
    }

    async fetchAdmins() {
        process.nextTick(async () => {
            await Utils.waitFor(1000)

            const admins = await this.koreanbots.api().servers(this.id).owners.get()

            const cache = (rawUser: RawUserInstance) => {
                if (!rawUser) return

                const user = new User(this.koreanbots, rawUser)

                this.koreanbots.users.cache.set(user.id, user)
                this.admins.set(user.id, user)
            }

            admins.data?.map(cache)
        })
    }

    async fetchVotes({ cache }: { cache: boolean } = { cache: true }): Promise<number> {
        const { data, message } = await this.koreanbots.api().servers(this.id).get()

        if (!data) throw new KoreanbotsError(message)

        if (cache) this.votes = data.votes

        return this.votes
    }

    is(type: keyof typeof ServerFlags | ServerFlags): boolean {
        if (typeof type === "number") {
            if (type === 0) return true
            return !!(this.flags & type)
        }

        if (ServerFlags[type] === 0) return true
        return !!(this.flags & ServerFlags[type])
    }
}
