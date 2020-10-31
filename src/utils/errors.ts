
class ArgumentError extends Error {
    constructor(err: string) {
        super(err)

        this.name = "ArgumentError"
    }
}

class ValidationError extends Error {
    constructor(err: string) {
        super(err)

        this.name = "ValidationError"
    }
}

class InvalidResponseError extends Error {
    constructor(err: string) {
        super(err)

        this.name = "InvalidResponseError"
    }
}

class GraphQLError extends Error {
    constructor(err: string) {
        super(err)

        this.name = "GraphQLError"
    }
}

class Errors {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`)
    }

    static get ArgumentError(): new (err: string) => ArgumentError {
        return ArgumentError
    }

    static get ValidationError(): new (err: string) => ValidationError {
        return ValidationError
    }

    static get InvalidResponseError(): new (err: string) => InvalidResponseError {
        return InvalidResponseError
    }

    static get GraphQLError(): new (err: string) => GraphQLError {
        return GraphQLError
    }
}


export default Errors
export { ArgumentError, ValidationError, InvalidResponseError, GraphQLError }