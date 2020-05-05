import { APIresponse, getBot, getByID } from './types'
import Request from './Request'
class MyBot {
    public readonly token: string;
        public lastUpdate: Date;
        constructor(token: string){
            if(!token || typeof token !== "string") throw new Error('올바른 토큰을 입력해주세요!')
            this.token = token
        }
    fetch = async(serverCount: Number) => {
        if(!serverCount || typeof serverCount !== "number") throw new Error('서버 수가 주어지지 않았거나, 올바르지 않은 타입입니다.')
        const res:APIresponse = await Request('/bots/servers', {
            method: 'POST',
            headers: {
                token: this.token,
                'Content-Type': 'application/json'
            },
            body: `{"servers": ${serverCount}}`
        })
        if(res.code !== 200) throw new Error(typeof res.message === 'string' ? res.message : `올바르지 않은 응답이 반환되었습니다.\n응답: ${JSON.stringify(res)}`)
        else {
            this.lastUpdate = new Date()
            return res
        }
    }

}

class Bots {
    get = async(page: Number = 1):Promise<getBot> => {
        if(typeof page !== "number") throw new Error('올바르지 않은 페이지입니다.')
        return await Request('/bots/get?page=' + page)
    }

    getByID = async(id: string):Promise<getByID> => {
        if(!id) throw new Error('아이디를 입력해주세요!')
        if(typeof id !== "string") throw new Error('올바르지 않은 아이디입니다.')
        return await Request('/bots/get/' + id)
    }

}

export { MyBot, Bots }

