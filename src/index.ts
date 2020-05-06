import { APIresponse, getBots, getByID, Category, Voted} from './types'
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
         * @param serverCount 봇의 서버 수
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
    /**
     * 유저의 봇 하트 여부를 확인합니다.
     */ 
    checkVote  = async(id: string) => {
        /**
         * @param id 유저 아이디
         */
        if(!id || typeof id !== "string") throw new Error('아이디가 주어지지 않았거나, 올바르지 않은 아이디입니다!')
        const res:Voted = await Request('/bots/voted/' + id, {
            method: 'GET',
            headers: {
                token: this.token,
                'Content-Type': 'application/json'
            }
        })
        if(res.code !== 200) throw new Error(typeof res.message === 'string' ? res.message : `올바르지 않은 응답이 반환되었습니다.\n응답: ${JSON.stringify(res)}`)
        else return res
    }   
}

/**
 * 봇 정보들을 불러오는 앤드포인트에 관련한 것들입니다.
 */
const Bots =  {
    /**
     * 봇 리스트를 불러옵니다. (기본)
     */
    get: async(page: Number = 1):Promise<getBots> => {
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
    ,
    /**
     * 봇을 검색합니다.
     */
    search: async(query: string, page: Number = 1):Promise<getBots> => {
        /**
         * @param query 검색할 검색어
         * @param page 불러올 페이지
         */
        if(!query) throw new Error('쿼리 텍스트가 요구됩니다!')
        if(typeof page !== "number") throw new Error('올바르지 않은 페이지입니다.')

        return await Request(`/bots/search?q=${query}&page=${page}`)
    }
    ,
    /**
     * 카테고리별 봇의 리스트를 불러옵니다.
     */
    category: async(category: Category, page: Number = 1):Promise<getBots> => {
        /**
         * @param category 불러올 카테고리
         * @param page 불러올 페이지
         */
        if(!category) throw new Error('카테고리가 요구됩니다!')
        if(!Object.values(Category).includes(category)) throw new Error('올바르지 않은 카테고리입니다.')
        if(typeof page !== "number") throw new Error('올바르지 않은 페이지입니다.')

        return await Request(`/bots/category/${category}?page=${page}`)
    },
}

export { MyBot, Bots }

