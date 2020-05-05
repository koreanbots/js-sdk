import { api } from './config'
import fetch from 'node-fetch'
/**
 * DBKR API로 리퀘스트를 보냅니다.
 * @param endpoint 요청을 전송할 EndPoint
 * @param opt 요청 옵션 (fetch Opt)
 */
export default async function MakeReq( endpoint:RequestInfo, opt?: Object) {
    return await fetch( api + endpoint, opt).then((r: { json: () => any })=> r.json()).catch((e: string)=> { throw new Error(e) })
}