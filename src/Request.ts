import { api } from './config'
import fetch from 'node-fetch'
export default async function MakeReq( endpoint:RequestInfo, opt?: Object) {
    return await fetch( api + endpoint, opt).then((r: { json: () => any })=> r.json()).catch((e: string)=> { throw new Error(e) })
}


