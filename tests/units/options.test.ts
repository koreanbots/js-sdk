/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Koreanbots } from "../../src"

describe("Check options", () => {
    const clientID = process.env.CLIENT_ID!
    const token = process.env.KOREANBOTS_TOKEN!
    
    it("should throw error if wrong clientID format was provided", done => {
        try {
            new Koreanbots({
                clientID: "테스트용아이디",
                api: {
                    token
                }
            })
        } catch (e) {
            expect(e.message).toBe("\"clientID\" 옵션은 Snowflake여야 합니다.")
        }

        try {
            new Koreanbots({
                // @ts-expect-error disabling type check to test
                clientID: false,
                api: {
                    token
                }
            })
        } catch (e) {
            expect(e.message).toBe("\"clientID\" 옵션은 문자열이여야 합니다. (받은 타입: boolean)")
        }

        done()
    })

    it("should throw error if wrong token format was provided", done => {
        try {
            new Koreanbots({
                clientID: clientID,
                api: {
                    token: "응애ㅐㅐㅐㅐㅐ"
                }
            })
        } catch (e) {
            expect(e.message).toBe("주어진 \"token\" 옵션은 정상적인 KOREANBOTS JWT 토큰이 아닙니다.")
        }

        done()
    })
})