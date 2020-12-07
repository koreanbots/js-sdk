/* eslint-disable @typescript-eslint/no-explicit-any */

import { Collection } from "discord.js"

export class Cache extends Collection<string, any> {
    public ttl: number
    public timeouts: Record<string, NodeJS.Timeout>

    constructor(ttl: number) {
        super()

        this.ttl = ttl
        this.timeouts = {}
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    set(key: string, value: any): this {
        super.set(key, value)

        this.timeouts[key] = setTimeout(() => {
            super.delete(key)
        }, this.ttl)

        return this
    }

    delete(key: string): boolean {
        const timeout = this.timeouts[key]
        if(timeout) {
            clearTimeout(timeout)
            delete this.timeouts[key]
        }

        return super.delete(key)
    }

    clear(): void {
        const timeouts = Object.values(this.timeouts)

        for(const timeout of timeouts) clearTimeout(timeout)
        this.timeouts = {}

        super.clear()
    }
}
