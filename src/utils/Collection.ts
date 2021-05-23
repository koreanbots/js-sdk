import { Collection } from "discord.js"

export interface LifetimeCollectionOptions {
    maxAge?: number,
    max?: number
}

class LifetimeCollection<K, V> extends Collection<K, V> {
    public max?: number
    public maxAge?: number

    public readonly timeouts: Map<K, NodeJS.Timeout>

    constructor(public readonly options?: LifetimeCollectionOptions) {
        super()

        this.max = options?.max
        this.maxAge = options?.maxAge

        this.timeouts = new Map()
    }

    set(key: K, value: V): this {
        if (this.max && super.size >= this.max) this.delete(super.randomKey())

        super.set(key, value)

        this.timeouts.set(key, setTimeout(() => {
            super.delete(key)
        }, this.maxAge))

        return this
    }

    sweep(fn: (value: V, key: K, collection: this) => boolean, thisArg?: unknown): number {
        // Copied original method to this.delete points to this.delete instead of super.delete
        if (typeof thisArg !== "undefined") fn = fn.bind(thisArg)
        const previousSize = this.size
        for (const [key, val] of this) {
            if (fn(val, key, this)) this.delete(key)
        }
        return previousSize - this.size
    }

    delete(key: K): boolean {
        const timeout = this.timeouts.get(key)

        if (timeout) {
            clearTimeout(timeout)
            this.timeouts.delete(key)
        }

        return super.delete(key)
    }

    clear(): void {
        const timeouts = Object.values(this.timeouts)

        for (const timeout of timeouts) clearTimeout(timeout)
        this.timeouts.clear()

        super.clear()
    }
}

export default LifetimeCollection
