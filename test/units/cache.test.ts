import LRU from "lru-cache"

describe("Cache Test", () => {
    it("should be able to set and delete as Collection", done => {
        const cache = new LRU<string, string>({
            max: 100,
            maxAge: 250
        })

        setTimeout(() => {
            expect(cache.length).toBe(0)
            done()
        }, 500)

        expect(cache).toBeInstanceOf(LRU)

        cache.set("asdf", "ㅎㅇ")

        expect(cache.length).toBe(1)

        cache.del("asdf")

        expect(cache.length).toBe(0)

        const arr = "aadagdf".repeat(100).split("")

        for (const v of arr) cache.set(v, v)
    })
})