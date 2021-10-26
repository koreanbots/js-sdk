import { Base } from "./Base"

import type { Koreanbots } from "../client/Koreanbots"

export class Discord extends Base {
    public readonly url: string
    public readonly invite: string

    constructor(public readonly koreanbots: Koreanbots, data: string) {
        super()

        this.invite = data
        this.url = `https://discord.com/invite/${data}`
    }
}
