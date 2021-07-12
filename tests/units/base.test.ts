import { Base } from "../../src/structures/Base"

describe("Base Test", () => {
    it("should be able to be serialized and deserialized", () => {
        // Base is abstract class, so it cannot be instantiated
        class Test extends Base {
            public readonly id: string = "ㅎㅇ?"
        }

        const instance = new Test()
        expect(typeof instance.toJSON()).toBe("object")
        expect(instance.valueOf()).toBe("ㅎㅇ?")
        expect(new (class extends Base {})().valueOf()).toBe("[object Object]")
    })
})