import { MyBot, Bots, Utils } from "../../src"
import { token, clientID } from "../config.json"

describe("Real-World Test", () => {
    let bots
    let mybot
    
    beforeAll(() => {
        Utils.toggleBeta("true")
        bots = new Bots({ token })
        mybot = new MyBot({
            token, clientID
        })
    })

    afterAll(() => {
        Utils.toggleBeta("false")

        bots.fetchClient.cache.clear()
        mybot.fetchClient.cache.clear()

        bots = null
        mybot = null
    })

    it("should be able to update server count", async done => {
        const serverCount = Math.round(Math.random() * 750)
        await mybot.update(serverCount)

        const botInfo = await bots.get(clientID, ["servers", "id"])

        expect(botInfo.code).toBe(200)
        expect(botInfo.data.bot.id).toBe(clientID)
        expect(botInfo.data.bot.servers).toBe(serverCount)

        done()
    })

    it("should be able to fetch other bot's information with GraphQL", async done => {
        const botInfo = await bots.get("387548561816027138")

        expect(typeof botInfo).toBe("object")
        expect(botInfo.code).toBe(200)
        expect(botInfo.data.bot.id).toBe("387548561816027138")

        const keysList = [
            "id", "lib", "prefix",
            "name", "servers", "votes",
            "intro", "desc", "avatar",
            "url", "web", "git",
            "category", "tag", "discord",
            "state", "verified", "trusted",
            "boosted", "partnered", "vanity",
            "banner", "status", "bg"
        ]

        for (const key of keysList) expect(Object.keys(botInfo.data.bot).includes(key)).toBe(true)

        done()
    })

    it("should be able to filter values with GraphQL", async done => {
        const botInfo = await bots.get("387548561816027138", ["id", "lib"])

        expect(typeof botInfo).toBe("object")
        expect(botInfo.code).toBe(200)
        expect(Object.keys(botInfo.data.bot).length).toBe(2)
        expect(botInfo.data.bot.id).toBe("387548561816027138")
        expect(botInfo.data.bot.lib).toBe("discord.js")

        done()
    })
})