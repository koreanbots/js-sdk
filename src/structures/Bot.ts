import { Base } from "./Base"
import { Owners } from "./Owners"
import { User } from "./User"
import { Discord } from "./Discord"
import { BotFlags } from "../utils/types"

import type {
    RawBotInstance,
    Nullable,
    BotCategory,
    BotState,
    BotStatus
} from "../utils/types"
import type { Koreanbots } from "../client/Koreanbots"
import { KoreanbotsError } from "../utils/Errors"


export class Bot extends Base {
    public id: string
    public name: string
    public tag: string
    public discriminator: string
    public avatar: Nullable<string>
    public owners: Owners
    public flags: BotFlags
    public lib: string
    public prefix: string
    public votes: number
    public servers: number
    public intro: string
    public desc: string
    public web: Nullable<string>
    public git: Nullable<string>
    public url: Nullable<string>
    public discord: Nullable<Discord>
    public category: BotCategory[]
    public vanity: Nullable<string>
    public bg: Nullable<string>
    public banner: Nullable<string>
    public status: Nullable<BotStatus>
    public state: BotState
    public shards: Nullable<number>

    constructor(public readonly koreanbots: Koreanbots, data: RawBotInstance) {
        super()

        this.id = data.id
        this.name = data.name
        this.discriminator = data.tag
        this.tag = `${data.name}#${data.tag}`
        this.avatar = data.avatar
        this.flags = data.flags
        this.owners = new Owners(
            this.koreanbots,
            data.owners?.map(u =>
                new User(this.koreanbots, u)
            )
        )
        this.lib = data.lib ?? "discord.js"
        this.prefix = data.prefix
        this.votes = data.votes
        this.servers = data.servers
        this.intro = data.intro
        this.desc = data.desc
        this.web = data.web
        this.git = data.git
        this.url = data.url
        this.category = data.category
        this.status = data.status ?? null
        this.discord = data.discord ? new Discord(this.koreanbots, data.discord) : null
        this.vanity = data.vanity
        this.bg = data.bg
        this.banner = data.banner
        this.state = data.state
        this.shards = data.shards
    }

    async fetchVotes({ cache }: { cache: boolean } = { cache: true }): Promise<number> {
        const { data, message } = await this.koreanbots.api().bots(this.id).get()

        if (!data) throw new KoreanbotsError(message)

        if (cache) this.votes = data.votes

        return this.votes
    }

    is(type: keyof typeof BotFlags | BotFlags): boolean {
        if (typeof type === "number") {
            if (type === 0) return true
            return !!(this.flags & type)
        }

        if (BotFlags[type] === 0) return true
        return !!(this.flags & BotFlags[type])
    }
}
