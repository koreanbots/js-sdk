import { snowflakeRegex as userIdRegex } from "../util/Constants"

import type { RequestInit } from "node-fetch"
import type APIClient from "./APIClient"

type Serialize = () => string
type APIRequest<T> = (options?: RequestInit) => T
type Proxy = () => void

interface APIHandler<T> {
    get(target: never, name: string): Serialize | APIRequest<T> | Proxy
    apply(target: never, _: never, args: string[]): Proxy
}

/**
 * @license https://github.com/discordjs/discord.js/blob/master/LICENSE
 * @description 
 * I, zero734kr, maintainer and lead developer of js-sdk of KOREANBOTS, declare 
 * that this part of source code 'APIRouter.ts' is taken from 
 * https://github.com/discordjs/discord.js/blob/master/src/rest/APIRouter.js,
 * and modified the original source code to be compatible with TypeScript 
 * and KOREANBOTS API Routes. There were not many changes with original source code.
 * @see https://github.com/discordjs/discord.js/blob/master/src/rest/APIRouter.js
 */

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => { }
const methods = ["get", "post", "delete", "patch", "put"]
const routesWithId = /bots|users/
const reflectors = [
    "toString",
    "valueOf",
    "inspect",
    "constructor",
    Symbol.toPrimitive,
    Symbol.for("nodejs.util.inspect.custom"),
]

function buildRoute(client: APIClient): Proxy {
    const route = [""]
    const handler: APIHandler<ReturnType<typeof client.request>> = {
        get(target, name) {
            if (reflectors.includes(name)) return () => route.join("/")

            if (methods.includes(name)) {
                const routeBucket: string[] = []
                for (let i = 0; i < route.length; i++) {
                    // Literal IDs should only be taken account if they are the Major ID (the Channel/Guild ID)
                    if (userIdRegex.test(route[i]) && !routesWithId.test(route[i - 1])) routeBucket.push(":id")
                    // All other parts of the route should be considered as part of the bucket identifier
                    else routeBucket.push(route[i])
                }
                return (options?: RequestInit) =>
                    client.request(
                        name,
                        route.join("/"),
                        options
                    )
            }

            route.push(name)
            return new Proxy(noop, handler)
        },
        apply(target, _, args) {
            route.push(...args.filter(x => x != null))
            return new Proxy(noop, handler)
        }
    }
    return new Proxy(noop, handler)
}

export default buildRoute
