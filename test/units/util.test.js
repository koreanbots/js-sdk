const Utils = require("../../dist/src/utils")


describe("Utils", () => {
    it("should be able to hide messages with *", done => {
        const text = "asdf.asdf.asdf"

        const hided = Utils.hide(text)

        expect(hided.split("").filter(f => f === "*")).toHaveLength(8)

        done()
    })

    it("should be able to determine if this is JSON structure or not.", done => {
        const json = `
        {
            "hi": "message",
            "im": "json"
        }
        `

        const brokenJson = `
        {
            'hi': 'message',
            'im': 'broken json, single quotes is not allowed.'
        }
        `

        const parsedJson = Utils.isJSON(json)
        const parsedBrokenJson = Utils.isJSON(brokenJson)

        expect(parsedJson).toBe(true)
        expect(parsedBrokenJson).toBe(false)

        done()
    })

    it("should be able to validate numbers", done => {
        const binaryNumber = 0b1
        const octalNumber = 0o1
        const decimalNumber = 1
        const hexadecimalNumber = 0x1

        const validatedBinary = Utils.validateNumber(binaryNumber, 2)
        const validatedOctal = Utils.validateNumber(octalNumber, 8)
        const validatedDecimal = Utils.validateNumber(decimalNumber, 2)
        const validatedHexadecimal = Utils.validateNumber(hexadecimalNumber, 2)
        const test = Utils.validateNumber(0xFFF, 2)

        expect(validatedBinary).toBe(true)
        expect(validatedOctal).toBe(true)
        expect(validatedDecimal).toBe(true)
        expect(validatedHexadecimal).toBe(true)
        expect(test).toBe(false)

        done()
    })

    it("should be able to toggle beta and stable API version", done => {
        Utils.toggleBeta("false")

        const stableVersion = Utils.getAPI(2)
        
        Utils.toggleBeta("true")

        const betaVersion = Utils.getAPI(1)

        Utils.toggleBeta()

        expect(stableVersion).toBe("https://koreanbots.dev/api/v2")
        expect(betaVersion).toBe("https://beta.koreanbots.dev/api/v1")

        done()
    })
})