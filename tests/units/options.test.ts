/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Koreanbots } from "../../src"

describe("Check options", () => {
    const clientID = process.env.CLIENT_ID!
    const token = process.env.TOKEN!
    
    it("should throw error if wrong clientID format was provided", done => {
        try {
            new Koreanbots({
                clientID: "테스트용아이디",
                apiOptions: {
                    token
                }
            })
        } catch (e) {
            expect(e.message).toBe("\"clientID\" 옵션은 디스코드의 ID 체계인 Snowflake여야 합니다.")
        }

        try {
            new Koreanbots({
                // @ts-expect-error disabling type check to test
                clientID: false,
                apiOptions: {
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
                apiOptions: {
                    token: "응애ㅐㅐㅐㅐㅐ"
                }
            })
        } catch (e) {
            expect(e.message).toBe("주어진 \"token\" 옵션은 정상적인 KOREANBOTS JWT 토큰이 아닙니다.")
        }

        done()
    })

    it("should throw error if wrong cache options format was provided", done => {
        try {
            new Koreanbots({
                clientID: clientID,
                apiOptions: {
                    token
                },
                botOptions: {
                    cache: {
                        // @ts-expect-error disabling type check to test
                        max: false
                    }
                }
            })
        } catch (e) {
            expect(e.message).toBe("\"max\" 옵션은 숫자여야 합니다. (받은 타입: boolean)")
        }

        try {
            new Koreanbots({
                clientID: clientID,
                apiOptions: {
                    token
                },
                botOptions: {
                    cache: {
                        // @ts-expect-error disabling type check to test
                        maxAge: false
                    }
                }
            })
        } catch (e) {
            expect(e.message).toBe("\"maxAge\" 옵션은 숫자여야 합니다. (받은 타입: boolean)")
        }

        try {
            new Koreanbots({
                clientID: clientID,
                apiOptions: {
                    token
                },
                botOptions: {
                    cache: {
                        max: -1
                    }
                }
            })
        } catch (e) {
            expect(e.message).toBe("\"max\" 옵션은 0보다 커야 합니다. (받은 값: -1, 최소보다 '2' 작음)")
        }

        try {
            new Koreanbots({
                clientID: clientID,
                apiOptions: {
                    token
                },
                botOptions: {
                    cache: {
                        maxAge: -1
                    }
                }
            })
        } catch (e) {
            expect(e.message).toBe("\"maxAge\" 옵션은 0보다 커야 합니다. (받은 값: -1, 최소보다 '2' 작음)")
        }

        try {
            new Koreanbots({
                clientID: clientID,
                apiOptions: {
                    token
                },
                botOptions: {
                    cache: {
                        max: Infinity
                    }
                }
            })
        } catch (e) {
            expect(e.message).toBe("\"max\" 옵션은 32비트 정수만 허용됩니다. (받은 값: Infinity)")
        }

        try {
            new Koreanbots({
                clientID: clientID,
                apiOptions: {
                    token
                },
                botOptions: {
                    cache: {
                        maxAge: Infinity
                    }
                }
            })
        } catch (e) {
            expect(e.message).toBe("\"maxAge\" 옵션은 32비트 정수만 허용됩니다. (받은 값: Infinity)")
        }

        done()
    })
})