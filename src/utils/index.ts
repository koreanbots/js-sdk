import { promisify } from "util"

import type { ProxyValidator } from "./types"

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

export function CacheOptionsValidator<T>(): ProxyValidator<T> {
    return {
        set(obj, prop, value) {
            switch (prop) {
            case "max":
                if (typeof value !== "number") throw new TypeError(`"max" 옵션은 숫자여야 합니다. (받은 타입: ${typeof value})`)
                if (value <= 0) throw new RangeError(`"max" 옵션은 0보다 커야 합니다. (받은 값: ${value}, 최소보다 '${1 - value}' 작음)`)
                if (!Number.isSafeInteger(value)) throw new RangeError(`"max" 옵션은 32비트 정수만 허용됩니다. (받은 값: ${value})`)
                break
            case "maxAge":
                if (typeof value !== "number") throw new TypeError(`"maxAge" 옵션은 숫자여야 합니다. (받은 타입: ${typeof value})`)
                if (value <= 0) throw new RangeError(`"maxAge" 옵션은 0보다 커야 합니다. (받은 값: ${value}, 최소보다 '${1 - value}' 작음)`)
                if (!Number.isSafeInteger(value)) throw new RangeError(`"maxAge" 옵션은 32비트 정수만 허용됩니다. (받은 값: ${value})`)
            }

            obj[prop] = value
            return true
        }
    }
}

export LifetimeCollection from "./Collection"
export { getGlobalRoute, getVersionRoute } from "../rest/getRoute"
export { * as Errors } from "./KoreanbotsAPIError"
export RequestClient from "../rest/RequestClient"