import type { Version } from "../structures/core"


const defaultVersion = 2
const minVersion = 1
const maxVersion = 2

const baseUri = "https://koreanbots.dev/api"

const genRange = (min: number, max: number): string => `${min} ~ ${max}`
const diff = (min: number, max: number, curr: number): string => curr < min ? `최소보다 '${min - curr}' 작음` : `최대보다 '${curr - max}' 더 큼`

/**
 * API 버전에 따라 기본 라우트를 만듭니다
 */
export function getVersionRoute(version: Version = defaultVersion): string {
    if (typeof version !== "number") throw new TypeError(`"version" 인자는 숫자여야 합니다. (받은 값: ${typeof version})`)
    if (version < minVersion || version > maxVersion)
        throw new RangeError(`"version" 인자는 ${genRange(minVersion, maxVersion)} 사이여야 합니다. (받은 값: ${version}, ${diff(minVersion, maxVersion, version)})`)

    return `${baseUri}/v${version}`
}