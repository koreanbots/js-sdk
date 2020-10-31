

class Utils {
    constructor() {
        throw new Error(`Constructor ${Utils.name} may not be instantiated.`)
    }

    static isJSON(raw: string): boolean {
        try {
            JSON.parse(raw)
            return true
        } catch {
            return false
        }
    }

    static hide(raw: string): string {
        return raw.split(".").map((v, i) => i !== 0
            ? v.replace(/\w|([/,!\\^${}[\]().+?|<>\-&])/gi, "*")
            : v)
            .join(".")
    }
}

export default Utils