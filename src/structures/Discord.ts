import { Base } from "./Base"

import type { Koreanbots } from "../client/Koreanbots"

export class Discord extends Base {
    public readonly inviteUrl: string
    public readonly invite: string

    constructor(public readonly koreanbots: Koreanbots, data: string) {
        super()

        this.invite = data
        this.inviteUrl = `https://discord.gg/${data}`
    }
}
