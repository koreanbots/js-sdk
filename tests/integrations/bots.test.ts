/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Koreanbots } from "../../src"
import { inspect } from "util"
import { Bot } from "../../src/structures/Bot"

describe("Bots Test", () => {
    let koreanbots: Koreanbots
    let botInfo: Bot

    beforeAll(async () => {
        koreanbots = new Koreanbots({
            clientID: process.env.CLIENT_ID!,
            apiOptions: {
                token: process.env.TOKEN!,
                unstable: false 
            }
        })

        koreanbots.api.client.on("timeout", a => console.log(`Timeout: ${inspect(a)}`))
        koreanbots.api.client.on("rateLimit", a => console.log(`Rate limit: ${inspect(a)}`))

        botInfo = await koreanbots.bots.fetch(process.env.CLIENT_ID!)
    })

    afterAll(() => {
        koreanbots.api.client.destroy()

        koreanbots.users.cache.clear()
        koreanbots.widgets.cache.clear()
        koreanbots.bots.cache.clear()
    })

    it("should be able to fetch other bot information", async done => {
        expect(typeof botInfo).toBe("object")
        expect(botInfo.id).toBe(process.env.CLIENT_ID)

        const owners = await botInfo.owners.fetch()

        expect(owners.every(f => typeof f?.username === "string")).toBe(true)
        expect(owners.every(f => typeof f?.id === "string")).toBe(true)

        const votes = await botInfo.fetchVotes()

        expect(typeof votes).toBe("number")

        if (botInfo.discord) expect(botInfo.discord.inviteUrl).toMatch(/https?:\/\/discord\.gg\/(.{6,10})/i)

        done()
    })
})