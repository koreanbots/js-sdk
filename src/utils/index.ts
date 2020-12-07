import { Versions } from "../../typings"


/**
     * 특정 값이 JSON으로 파싱될수 있는지 확인합니다.
     * @param {string} raw - JSON인지 확인할 값
     * @example
     * Utils.isJSON("{\"asdf\":\"ㅁㄴㅇㄹ\"}")
     */
export function isJSON(raw: string): boolean {
    try {
        JSON.parse(raw)
        return true
    } catch {
        return false
    }
}

/**
     * 특정 숫자가 원하는 진수에 일치하는지 확인합니다.
     * @param {string} n - 일치하는지 확인할 수 
     * @param {number} base - 진수
     * @example
     * Utils.validateNumber(0xFFF, 10)
     * // false
     */
export function validateNumber(n: string, base: number): boolean {
    // @ts-ignore
    return n == parseInt(n, base)
}

/**
     * 특정 문자열을 블라인드 처리합니다.
     * @param {string} raw - 문자열 
     * @example
     * Utils.hide("ADwaldhalwhdaw.dbagdkvawyj.clahclaihlchwalihcawlciawli")
     * // "ADwaldhalwhdaw.***********.***************************"
     */
export function hide(raw: string): string {
    return raw.split(".").map((v, i) => i !== 0
        ? v.replace(/\w|([/,!\\^${}[\]().+?|<>\-&])/gi, "*")
        : v)
        .join(".")
}

/**
     * Koreanbots API URL을 가져옵니다.
     * @param {Versions} version - Koreanbots API 버전
     * @example
     * Utils.toggleBeta()
     * console.log(Utils.getAPI(2))
     * // "https://beta.koreanbots.dev/api/v2"
     * 
     * Utils.toggleBeta()
     * console.log(Utils.getAPI(1))
     * // "https://api.koreanbots.dev/v1"
     */
export function getAPI(version?: Versions): string {
    if (!version) version = 2

    if (process.env.KOREANBOTS_USE_BETA === "true") return `https://beta.koreanbots.dev/api/v${version}`
    else return `https://${version < 2 ? "api." : ""}koreanbots.dev/${version < 2 ? "" : "api/"}v${version}`
}

/**
     * Koreanbots의 beta API를 활성화합니다.
     * @example
     * Utils.toggleBeta()
     */
export function toggleBeta(override?: string): string {
    const toggle = Boolean(process.env.KOREANBOTS_USE_BETA)

    return process.env.KOREANBOTS_USE_BETA = override || String(!toggle)
}
