/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Koreanbots } from "../../src"
import { inspect } from "util"
import { Server } from "../../src/structures/Server"

const KOREANBOTS_SERVER_ID = "653083797763522580"

describe("Bots Test", () => {
    let koreanbots: Koreanbots
    let serverInfo: Server

    beforeAll(async () => {
        koreanbots = new Koreanbots({
            clientID: process.env.CLIENT_ID!,
            api: {
                token: process.env.KOREANBOTS_TOKEN!,
                unstable: true
            }
        })

        koreanbots.api.client.on("timeout", a => console.log(`Timeout: ${inspect(a)}`))
        koreanbots.api.client.on("rateLimit", a => console.log(`Rate limit: ${inspect(a)}`))

        serverInfo = await koreanbots.servers.fetch(KOREANBOTS_SERVER_ID)
    })

    afterAll(() => {
        koreanbots.api.client.destroy()

        koreanbots.users.cache.clear()
        koreanbots.widgets.cache.clear()
        koreanbots.bots.cache.clear()
    })

    it("should be able to fetch other bot information", async () => {
        expect(typeof serverInfo).toBe("object")
        expect(serverInfo.id).toBe(KOREANBOTS_SERVER_ID)

        const admins = serverInfo.admins

        expect(admins.every(f => typeof f?.username === "string")).toBe(true)
        expect(admins.every(f => typeof f?.id === "string")).toBe(true)

        const votes = await serverInfo.fetchVotes()

        expect(typeof votes).toBe("number")

        if (serverInfo.invite && !serverInfo.vanity) expect(serverInfo.invite.url).toMatch(/https?:\/\/discord\.gg\/(.{6,10})/i)
        if (serverInfo.invite && serverInfo.vanity) expect(serverInfo.invite.url).toBe(`https://discord.com/invite/${serverInfo.vanity}`)

        return
    })
})