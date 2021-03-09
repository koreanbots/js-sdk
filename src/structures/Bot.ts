import { Base } from "./Base"

import type { RawBotInstance } from "./core"

export class Bot extends Base {
    constructor(protected readonly data: RawBotInstance) {
        super()

    }

    getVotes(): number {
        return 0
    }
}
