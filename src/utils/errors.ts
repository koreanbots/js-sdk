
export class ArgumentError extends Error {
    constructor(err: string) {
        super(err)

        this.name = "ArgumentError"
    }
}

export class ValidationError extends Error {
    constructor(err: string) {
        super(err)

        this.name = "ValidationError"
    }
}

export class InvalidResponseError extends Error {
    constructor(err: string) {
        super(err)

        this.name = "InvalidResponseError"
    }
}

export class GraphQLError extends Error {
    constructor(err: string) {
        super(err)

        this.name = "GraphQLError"
    }
}
