export class FetchError extends Error {
    constructor(
        public readonly message: string,
        public readonly code: number,
        public readonly method: string,
        public readonly path: string
    ) {
        super(message)

        this.name = "FetchError[Koreanbots]"
    }
}
