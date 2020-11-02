import { Versions } from "../structures"

class Utils {
    constructor() {
        throw new Error(`Constructor ${Utils.name} may not be instantiated.`)
    }

    /**
     * 특정 값이 JSON으로 파싱될수 있는지 확인합니다.
     * @param {string} raw - JSON인지 확인할 값
     * @example
     * Utils.isJSON("{\"asdf\":\"ㅁㄴㅇㄹ\"}")
     */
    static isJSON(raw: string): boolean {
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
    static validateNumber(n: string, base: number) : boolean {
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
    static hide(raw: string): string {
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
     * // "https://api.beta.koreanbots.dev/v2"
     * 
     * Utils.toggleBeta()
     * console.log(Utils.getAPI(1))
     * // "https://api.koreanbots.dev/v1"
     */
    static getAPI(version?: Versions): string {
        return `https://api.${process.env.KOREANBOTS_USE_BETA === "true" ? "beta." : ""}koreanbots.dev/v${version}`
    }

    /**
     * Koreanbots의 beta API를 활성화합니다.
     * @example
     * Utils.toggleBeta()
     */
    static toggleBeta(): string {
        const toggle = Boolean(process.env.KOREANBOTS_USE_BETA)

        return process.env.KOREANBOTS_USE_BETA = String(!toggle)
    }
}

export default Utils
