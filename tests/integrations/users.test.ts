/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Koreanbots } from "../../src"
import { inspect } from "util"
import { User } from "../../src/structures/User"

describe("Users Test", () => {
    let koreanbots: Koreanbots

    beforeAll(() => {
        koreanbots = new Koreanbots({
            clientID: process.env.CLIENT_ID!,
            apiOptions: {
                token: process.env.TOKEN!,
                unstable: false 
            }
        })

        koreanbots.api.client.on("timeout", a => console.log(`Timeout: ${inspect(a)}`))
        koreanbots.api.client.on("rateLimit", a => console.log(`Rate limit: ${inspect(a)}`))
    })

    afterAll(() => {
        koreanbots.api.client.destroy()

        koreanbots.users.cache.clear()
        koreanbots.widgets.cache.clear()
        koreanbots.bots.cache.clear()
    })

    it("should be able to fetch other user information", async done => {
        const userId = "462355431071809537" // zero734kr
        const user = await koreanbots.users.fetch(userId)

        const validate = (userInfo: User) => {
            expect(typeof userInfo).toBe("object")
            expect(userInfo.id).toBe(userId)
            expect(userInfo.is("ADMINISTRATOR")).toBe(false)
            expect(userInfo.is(1 << 0)).toBe(false)
        }

        validate(user)

        const refetched = await user.fetch()

        validate(refetched)

        done()
    })
})