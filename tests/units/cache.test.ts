import LifetimeCollection from "../../src/utils/collection"

describe("Cache Test", () => {
    it("should be able to set and delete as Collection", done => {
        const cache = new LifetimeCollection<string, string>({
            max: 100,
            maxAge: 250
        })

        setTimeout(() => {
            expect(cache.size).toBe(0)
            done()
        }, 500)

        expect(cache).toBeInstanceOf(LifetimeCollection)

        cache.set("asdf", "ㅎㅇ")

        expect(cache.size).toBe(1)

        cache.delete("asdf")

        expect(cache.size).toBe(0)

        const arr = "aadagdf".repeat(100).split("")

        for (const v of arr) cache.set(v, v)
    })
})