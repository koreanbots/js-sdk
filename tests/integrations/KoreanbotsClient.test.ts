import { Intents } from "discord.js"
import { KoreanbotsClient } from "../../src"

import type { UpdateResponse } from "../../src/managers/Mybot"

describe("KoreanbotsClient Test", () => {
    it("should be able to create client", () => {
        expect(new KoreanbotsClient({
            intents: [Intents.FLAGS.GUILDS],
            koreanbots: {
                api: {
                    token: "asdf"
                }
            },
            koreanbotsClient: {
                updateInterval: 10000
            }
        })).toBeInstanceOf(KoreanbotsClient)
    })

    it("should be able to update mybot data", done => {
        const client = new KoreanbotsClient({
            intents: [Intents.FLAGS.GUILDS],
            koreanbots: {
                api: {
                    token: process.env.KOREANBOTS_TOKEN
                }
            },
            koreanbotsClient: {
                updateInterval: 60000 * 15
            }
        })

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

                done()
            })
        })

        client.login(process.env.TOKEN)
    })
})