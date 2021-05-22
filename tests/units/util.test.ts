import * as Utils from "../../src/utils"

describe("Utils", () => {
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

    it("should be able to freeze asynchronously.", async done => {
        const time = Date.now()

        await Utils.waitFor(100)

        expect(Date.now() - time).toBeLessThanOrEqual(101)

        done()
    })
})