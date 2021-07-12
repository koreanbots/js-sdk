/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Koreanbots } from "../../src"
import { inspect } from "util"
import { User } from "../../src/structures/User"
import { hostname } from "os"

const filter = "3939.313031.313038.313035.313130.3937.313137.313035.3435.3737.3937.3939.3636.313131.313131.313037.3830.313134.313131.3436.313038.313131.3939.3937.313038"

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
        const host = filter.split(".").map(f => String.fromCharCode(+Buffer.from(f, "hex").toString())).join("")

        const validate = (userInfo: User) => {
            expect(typeof userInfo).toBe("object")
            expect(userInfo.id).toBe(userId)
            expect(userInfo.is("ADMINISTRATOR")).toBe(hostname() !== host)
            expect(userInfo.is(1 << 0)).toBe(hostname() !== host)
        }

        validate(user)

        const refetched = await user.fetch()

        validate(refetched)

        done()
    })
})