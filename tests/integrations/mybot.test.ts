/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Koreanbots } from "../../src"
import { inspect } from "util"

describe("Mybot Test", () => {
    let koreanbots: Koreanbots

    beforeAll(() => {
        koreanbots = new Koreanbots({
            clientID: process.env.CLIENT_ID!,
            api: {
                token: process.env.KOREANBOTS_TOKEN!,
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

    it("should be able to update server count and shard count", async done => {
        const serverCount = Math.round(Math.random() * 750)
        const shardCount = Math.round(Math.random() * 10)

        await koreanbots.mybot.update({ servers: serverCount, shards: shardCount })

        const botInfo = await koreanbots.bots.fetch(process.env.CLIENT_ID!)

        expect(botInfo.id).toBe(process.env.CLIENT_ID!)
        expect(botInfo.servers).toBe(serverCount)
        expect(botInfo.shards).toBe(shardCount)

        done()
    })

    it("should be able to check vote", async done => {
        const res = await koreanbots.mybot.checkVote("462355431071809537")

        expect(typeof res.voted).toBe("boolean")

        done()
    })
})