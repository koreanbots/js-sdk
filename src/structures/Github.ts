import { Base } from "./Base"

import type { Koreanbots } from "../client/Koreanbots"

export class Github extends Base {
    public readonly username: string
    public readonly url: string
    
    constructor(public readonly koreanbots: Koreanbots, data: string) {
        super()

        this.username = data
        this.url = `https://github.com/${data}`
    }
}
