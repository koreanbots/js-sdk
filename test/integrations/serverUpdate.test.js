const { MyBot, Bots } = require("../../dist/src/")
const { token, clientID } = require("../config.json")
const mybot = new MyBot({
    token, clientID
})
const bots = new Bots({ token, clientID })

describe("Real-World Test", () => {
    it("should be able to update server count", async done => {
        const serverCount = Math.round(Math.random() * 750)
        await mybot.update(serverCount)

        const botInfo = await bots.get(clientID, ["servers", "id"])

        expect(botInfo.code).toBe(200)
        expect(botInfo.data.id).toBe(clientID)
        expect(botInfo.data.servers).toBe(serverCount)

        done()
    })

    it("should be able to fetch other bot's information with GraphQL", async done => {
        const botInfo = await bots.get("387548561816027138")

        expect(typeof botInfo).toBe("object")
        expect(botInfo.code).toBe(200)
        expect(botInfo.data.id).toBe("387548561816027138")
        
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

        for(const key of keysList) expect(Object.keys(botInfo).includes(key)).toBe(true)

        done()
    })

    it("should be able to filter values with GraphQL", async done => {
        const botInfo = await bots.get("387548561816027138", ["id", "lib"])

        expect(typeof botInfo).toBe("object")
        expect(botInfo.code).toBe(200)
        expect(botInfo.data).toBe({ id: "387548561816027138", lib: "discord.js" })

        done()
    })
})