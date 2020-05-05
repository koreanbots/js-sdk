import { APIresponse, getBot, getByID } from './types'
import Request from './Request'

class MyBot {

    public readonly token: string;
        public lastUpdate: Date;
        /**
         * 자신 봇의 클래스입니다.
         * @param token DBKR 토큰 (프로필->봇 관리에서 찾을 수 있습니다!)
         */
        constructor(token: string){
            if(!token || typeof token !== "string") throw new Error('올바른 토큰을 입력해주세요!')
            this.lastUpdate
            this.token = token
        }
        /**
         * 봇의 서버 수 정보를 업데이트합니다.
         */
    update = async(serverCount: Number) => {
        /**
         * @param serverCount 봇의 서버 수입니다.
         */
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

/**
 * 봇 정보들을 불러오는 앤드포인트에 관련한 것들입니다.
 */
const Bots =  {
    /**
     * 봇 리스트를 불러옵니다. (기본)
     */
    get: async(page: Number = 1):Promise<getBot> => {
        /**
         * @param page 불러올 페이지
         */
        if(typeof page !== "number") throw new Error('올바르지 않은 페이지입니다.')
        return await Request('/bots/get?page=' + page)
    }
    ,
    /**
     * 아이디로 봇 정보를 불러옵니다.
     */
    getByID: async(id: string):Promise<getByID> => {
        /**
         * @param id 불러올 봇의 아이디
         */
        if(!id) throw new Error('아이디를 입력해주세요!')
        if(typeof id !== "string") throw new Error('올바르지 않은 아이디입니다.')
        return await Request('/bots/get/' + id)
    }

}

export { MyBot, Bots }

