import { Intents } from "discord.js"
import { KoreanbotsClient } from "../../src"

import type { UpdateResponse } from "../../src/utils/types"

describe("KoreanbotsClient Test", () => {
    it("should be able to update mybot data", done => {
        const client = new KoreanbotsClient({
            intents: [Intents.FLAGS.GUILDS],
            koreanbots: {
                api: {
                    token: process.env.KOREANBOTS_TOKEN
                }
            },
            koreanbotsClient: {
                updateInterval: 5000,
                updateOnInit: false
            }
        })

        expect(client).toBeInstanceOf(KoreanbotsClient)

        client.once("ready", () => {
            client.koreanbots.api.client.on("serverCountUpdated", async (raw) => {
                const data = raw as UpdateResponse
                expect(typeof data.servers).toBe("number")

                const size = await client.shard?.fetchClientValues("guilds.cache.size")
                    .then((r) => (r as number[]).reduce((a, b) => a + b, 0)) ??
                    client.guilds.cache.size

                expect(data.servers).toBe(size)

                client.removeAllListeners()
                client.koreanbots.api.client.removeAllListeners()

                client.destroy()
                client.koreanbots.destroy()

                done()
            })
        })

        client.login(process.env.TOKEN)
    })
})