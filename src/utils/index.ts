import { promisify } from "util"

export function isJSON(content: string): boolean {
    try {
        return !!JSON.parse(content)
    } catch {
        return false
    }
}

export function waitFor(delay: number): Promise<void> {
    return promisify(setTimeout)(delay)
}

export { getGlobalRoute, getVersionRoute } from "../rest/getRoute"
export { default as RequestClient } from "../rest/RequestClient"
