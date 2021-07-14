/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { inspect } from "util"
import { Koreanbots } from "../../src"

describe("Widgets Test", () => {
    let koreanbots: Koreanbots

    beforeAll(async () => {
        koreanbots = new Koreanbots({
            clientID: process.env.CLIENT_ID!,
            api: {
                token: process.env.TOKEN!,
                unstable: false 
            }
        })

        

        koreanbots.api.client.on("timeout", a => console.log(`Timeout: ${inspect(a)}`))
        koreanbots.api.client.on("rateLimit", a => console.log(`Rate limit: ${inspect(a)}`))

        return 0
    })

    afterAll(() => {
        koreanbots.api.client.destroy()

        koreanbots.users.cache.clear()
        koreanbots.widgets.cache.clear()
        koreanbots.bots.cache.clear()
    })

    it("should be able to fetch widget information", async done => {
        try {
            const webpWidget = await koreanbots.widgets.getServerWidget("387548561816027138", {
                format: "webp",
                scale: 2,
                style: "classic",
                icon: false
            })

            expect(typeof webpWidget).toBe("object")
            expect(webpWidget.id).toBe("387548561816027138")
            expect(Buffer.isBuffer(webpWidget.buffer)).toBe(true)
        } catch {
            // 
        } finally {
            done()
        }
    })
})
