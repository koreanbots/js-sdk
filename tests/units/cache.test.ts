import LifetimeCollection from "../../src/utils/Collection"

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

    it("should cancel timeouts when using LifetimeCollection#sweep", done => {
        const cache = new LifetimeCollection<string, string>({
            max: 100,
            maxAge: 250
        })

        const arr = "aadagdf".repeat(100).split("")
        for (const v of arr) cache.set(v, v)

        const cacheSizeBeforeSweep = cache.size
        const willBeSweeped = cache.filter(f => f === "a").size

        expect(cache.sweep(f => f === "a")).toBe(willBeSweeped)
        expect(cache.timeouts.size).toBe(cacheSizeBeforeSweep - willBeSweeped)

        done()
    })

    it("should cancel timeouts when using LifetimeCollection#sweep with custom thisArg", done => {
        const cache = new LifetimeCollection<string, string>({
            max: 100,
            maxAge: 250
        })

        const arr = "aadagdf".repeat(100).split("")
        for (const v of arr) cache.set(v, v)

        const cacheSizeBeforeSweep = cache.size
        const willBeSweeped = cache.filter(f => this && f === "a" || false, true).size

        expect(cache.sweep(f => this && f === "a" || false, true)).toBe(willBeSweeped)
        expect(cache.timeouts.size).toBe(cacheSizeBeforeSweep - willBeSweeped)

        done()
    })

    it("should delete one randomly when the cache is full", done => {
        const cache = new LifetimeCollection<number, number>({
            max: 10
        })

        for (const v of new Array(10).fill(1).map((_, i) => i))
            cache.set(v, v)

        cache.set(-1, -1)

        expect(cache.size).toBe(10)

        done()
    })
})