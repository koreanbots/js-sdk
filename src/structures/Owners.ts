import { Collection } from "discord.js"
import { User } from "./User"

import type { Koreanbots } from "../client/Koreanbots"
import type { RawUserInstance } from "../utils/types"


export class Owners extends Collection<string, User> {
    constructor(public readonly koreanbots: Koreanbots, private data?: User[]) {
        super()

        if (!data) return

        for (const owner of data) this.set(owner.id, owner)
    }

    public async fetch(): Promise<(RawUserInstance | null)[]> {
        const result = await Promise.all(this.map(user => (
            this.koreanbots.api().users(user.id).get()
        )))

        result.filter(f => f.code === 200).forEach(owner => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.set(owner.data!.id, new User(this.koreanbots, owner.data!))
        })

        return result.map(f => f.data)
    }
}