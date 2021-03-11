import { promisify } from "util"

class Utils {
    constructor() {
        throw new Error(`Class '${Utils.name}' may not be instantiated`)
    }

    /**
     * 주어진 'content' 값이 JSON으로 역직렬화 될 수 있는지 확인합니다.
     */
    static isJSON(content: string): boolean {
        try {
            return !!JSON.parse(content)
        } catch (e) {
            if (e instanceof SyntaxError) return false

            throw e
        }
    }

    static waitFor(delay: number): Promise<void> {
        return promisify(setTimeout)(delay)
    }

    /**
     * 비동기적으로 역직렬화 합니다.
     */
    static deserializeAsync<T = Record<string, unknown>>(content: string): Promise<T> {
        const asynchronized = new Promise<T>((resolve, reject) => {
            try {
                return resolve(JSON.parse(content))
            } catch (e) {
                if (e instanceof SyntaxError)
                    return reject("Not deserializable.")
            }
        })
        return asynchronized
    }

    /**
     * 비동기적으로 직렬화 합니다.
     */
    static serializeAsync(content: Record<string, unknown>): Promise<string> {
        const asynchronized = new Promise<string>((resolve, reject) => {
            try {
                const serialized = JSON.stringify(content)

                return resolve(serialized)
            } catch (e) {
                reject(e)
            }
        })
        return asynchronized
    }
}

export default Utils
