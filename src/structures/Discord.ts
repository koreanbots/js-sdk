import { Base } from "./Base"

import type { Koreanbots } from "../managers/Koreanbots"

export class Discord extends Base {
    public readonly inviteUrl: string
    public readonly invite: string

    protected readonly data!: string

    constructor(public readonly koreanbots: Koreanbots, data: string) {
        super()

        Object.defineProperty(this, "data", {
            writable: false,
            value: data
        })

        this.invite = data
        this.inviteUrl = `https://discord.gg/${data}`
    }
}