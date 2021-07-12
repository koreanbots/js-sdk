import * as Utils from "../../src/utils"
import { performance } from "perf_hooks"

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
        const time = performance.now()

        await Utils.waitFor(100)

        expect(performance.now() - time).toBeLessThanOrEqual(110)

        done()
    })

    it("should be able to validate cache options.", done => {
        const mockData1 = {
            max: false,
            maxAge: false
        }
        const mockData2 = {
            max: -1,
            maxAge: -1
        }
        const mockData3 = {
            max: Infinity,
            maxAge: Infinity
        }

        try {
            Utils.CacheOptionsValidator<typeof mockData1>().set(mockData1, "max", false)
        } catch (e) {
            expect(e.message).toBe("\"max\" 옵션은 숫자여야 합니다. (받은 타입: boolean)")
        }

        try {
            Utils.CacheOptionsValidator<typeof mockData1>().set(mockData1, "maxAge", false)
        } catch (e) {
            expect(e.message).toBe("\"maxAge\" 옵션은 숫자여야 합니다. (받은 타입: boolean)")
        }

        try {
            Utils.CacheOptionsValidator<typeof mockData2>().set(mockData2, "max", -1)
        } catch (e) {
            expect(e.message).toBe("\"max\" 옵션은 0보다 커야 합니다. (받은 값: -1, 최소보다 '2' 작음)")
        }

        try {
            Utils.CacheOptionsValidator<typeof mockData2>().set(mockData2, "maxAge", -1)
        } catch (e) {
            expect(e.message).toBe("\"maxAge\" 옵션은 0보다 커야 합니다. (받은 값: -1, 최소보다 '2' 작음)")
        }

        try {
            Utils.CacheOptionsValidator<typeof mockData3>().set(mockData3, "max", Infinity)
        } catch(e) {
            expect(e.message).toBe("\"max\" 옵션은 32비트 정수만 허용됩니다. (받은 값: Infinity)")
        }

        try {
            Utils.CacheOptionsValidator<typeof mockData3>().set(mockData3, "maxAge", Infinity)
        } catch (e) {
            expect(e.message).toBe("\"maxAge\" 옵션은 32비트 정수만 허용됩니다. (받은 값: Infinity)")
        }

        done()
    })
})