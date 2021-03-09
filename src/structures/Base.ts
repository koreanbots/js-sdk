export abstract class Base {
    public readonly id!: string

    protected _serialize<T>(value: T): T {
        return JSON.parse(JSON.stringify(value))
    }

    toJSON(): this {
        return this._serialize(this)
    }

    valueOf(): string {
        return this.id ?? ""
    }
}