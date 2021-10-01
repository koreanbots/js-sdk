import * as Utils from "../../src/utils"
import { performance } from "perf_hooks"
import { KoreanbotsAPIError } from "../../src/utils/Errors"

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

    it("should be able to freeze asynchronously.", async () => {
        const time = performance.now()

        await Utils.waitFor(100)

        expect(performance.now() - time).toBeLessThanOrEqual(150)

        return
    })

    it("KoreanbotsAPIError", () => {
        const ERROR_MESSAGE = "test error"
        const ERROR_CODE = 400
        const ERROR_METHOD = "POST"
        const ERROR_PATH = "/"

        const error = new KoreanbotsAPIError(ERROR_MESSAGE, ERROR_CODE, ERROR_METHOD, ERROR_PATH)

        try {
            throw error
        } catch (e) {
            expect(e.message).toBe(ERROR_MESSAGE)
            expect(e.code).toBe(ERROR_CODE)
            expect(e.method).toBe(ERROR_METHOD)
            expect(e.path).toBe(ERROR_PATH)
        } finally {
            // eslint-disable-next-line no-unsafe-finally
            return 
        }
    })
})