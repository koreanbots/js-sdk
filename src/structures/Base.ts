export abstract class Base {
    public readonly id!: string

    protected _serialize<T>(value: T): string {
        return JSON.stringify(value)
    }

    protected _deserialize<T>(value: string): T {
        return JSON.parse(value)
    }

    toJSON(): this {
        return this._deserialize(this._serialize({ ...this }))
    }

    valueOf(): string {
        return this.id ?? `${this}`
    }
}