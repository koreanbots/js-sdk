import { Collection } from "discord.js"
import { Bot } from "../structures/Bot"
import { Nullable } from "../structures/core"

import type { Koreanbots } from "./Koreanbots"

export class BotManager {
    public cache: Collection<string, Nullable<Bot>>

    constructor(public readonly koreanbots: Koreanbots) {
        this.cache = new Collection()
    }
}
