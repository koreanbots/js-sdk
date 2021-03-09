import { Collection } from "discord.js"
import Koreanbots from "src/managers/Koreanbots"
import { FetchResponse } from "./core"

import type { Owner } from "./Owner"

interface UserQuery {
    users(id: string): {
        get: () => Promise<FetchResponse<Owner>>
    }
}

export class Owners extends Collection<string, Owner> {
    constructor(public readonly koreanbots: Koreanbots, private readonly data: Owner[]) {
        super()
    }

    public async fetch(): Promise<(FetchResponse<Owner>)[]> {
        const result = await Promise.all(this.map(user => (
            this.koreanbots.api<UserQuery>().users(user.id).get()
        )))

        result.filter(f => f.code === 200).forEach(owner => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.set(owner.data!.id, owner.data!)
        })

        return result
    }
}