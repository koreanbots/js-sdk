import { Koreanbots } from "../../src"
import { token, clientID } from "../config.json"

describe("Real-World Test", () => {
    let koreanbots: Koreanbots

    beforeAll(() => {
        koreanbots = new Koreanbots({
            clientID,
            apiOptions: {
                token,
                unstable: true // change it to false if v2 get released to stable channel
            }
        })
    })

    afterAll(() => {
        koreanbots.users.cache.clear()
        koreanbots.widgets.cache.clear()
        koreanbots.bots.cache.clear()
    })

    it("should be able to update server count", async done => {
        const serverCount = Math.round(Math.random() * 750)
        await koreanbots.mybot.update(serverCount)

        const botInfo = await koreanbots.bots.fetch(clientID)

        expect(botInfo.id).toBe(clientID)
        expect(botInfo.servers).toBe(serverCount)

        done()
    })

    it("should be able to fetch other bot's information", async done => {
        const botInfo = await koreanbots.bots.fetch("387548561816027138")

        expect(typeof botInfo).toBe("object")
        expect(botInfo.id).toBe("387548561816027138")
        
        done()
    })
})