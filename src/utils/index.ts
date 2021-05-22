import { promisify } from "util"

export function isJSON(content: string): boolean {
    try {
        return !!JSON.parse(content)
    } catch (e) {
        if (e instanceof SyntaxError) return false

        throw e
    }
}

export function waitFor(delay: number): Promise<void> {
    return promisify(setTimeout)(delay)
}