import { Base } from "./Base"

import type { Koreanbots } from "../client/Koreanbots"

export class Github extends Base {
    public readonly username: string
    public readonly url: string

    protected readonly data!: string
    
    constructor(public readonly koreanbots: Koreanbots, data: string) {
        super()

        Object.defineProperty(this, "data", {
            writable: false,
            value: data
        })

        this.username = data
        this.url = `https://github.com/${data}`
    }
}