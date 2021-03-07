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

    static wait(delay: number): Promise<void> {
        return promisify(setTimeout)(delay)
    }
}

export default Utils
