# koreanbots/MyBot 가이드

## 기본

**❯ 서버 수 업데이트**

```js
mybot.update(client.guilds.cache.size)
/**
Promise < {
    code: 200,
    statusText: 'OK',
    data: { bot: { id: '봇 아이디', servers: 서버 수 } },
    message: undefined,
    isCache: false,
    ratelimitRemaining: 147,
    endpoint: '/graphql',
    updatedTimestamp: undefined
} >
*/
```

**❯ 하트 체크**

```js
const USER_ID = /* ID 추출할 곳 (예시: message.author.id, message.mentions.users.first().id) */
mybot.checkVote(USER_ID)
/**
Promise < {
    code: 200,
    statusText: 'OK',
    data: { */FIELD_TO_BE_FILLED/** },
    message: undefined,
    isCache: false,
    ratelimitRemaining: 147,
    endpoint: '/graphql',
    updatedTimestamp: undefined
} >
*/
```

## 이벤트 연동(심화)

**❯ 서버 수 업데이트**

* JavaScript
```js
client.on("guildCreate", guild => {
    const { ratelimitRemaining } = mybot.fetchClient.endpointCache.find(q => q.endpoint === "/graphql") || { rateLimitRemaining: null }

    // ratelimitRemaining 값이 null이라는 것은 곧 ratelimitRemaining이 최대일 경우가 높습니다 (이때까지 쿼리를 안함)
    if (typeof ratelimitRemaining === "number" && ratelimitRemaining && ratelimitRemaining <= 10) return

    mybot.update((mybot.lastGuildCount || client.guilds.cache.size - 1) + 1)

    // ...
})

client.on("guildDelete", guild => {
    const { ratelimitRemaining } = mybot.fetchClient.endpointCache.find(q => q.endpoint === "/graphql") || { rateLimitRemaining: null }

    // ratelimitRemaining 값이 null이라는 것은 곧 ratelimitRemaining이 최대일 경우가 높습니다 (이때까지 쿼리를 안함)
    if (typeof ratelimitRemaining === "number" && ratelimitRemaining && ratelimitRemaining <= 10) return

    mybot.update((mybot.lastGuildCount || client.guilds.cache.size + 1) - 1)

    // ...
})
```

* TypeScript
```ts
import { Guild } from "discord.js"

interface FetchResponse {
    code: number
    statusText: string 
    message: string
    isCache: boolean
    ratelimitRemaining: number | string | null
    endpoint: string
    updatedTimestamp?: number
    data?: Record<string, any>
    errors?: GraphQLErrorResponse[]
}

client.on("guildCreate", (guild: Guild) => {
    const { ratelimitRemaining } = mybot.fetchClient.endpointCache.find(q => q.endpoint === "/graphql") as FetchResponse || { rateLimitRemaining: null } as { [key: string]: null }

    // ratelimitRemaining 값이 null이라는 것은 곧 ratelimitRemaining이 최대일 경우가 높습니다 (이때까지 쿼리를 안함)
    if (typeof ratelimitRemaining === "number" && ratelimitRemaining <= 10) return

    mybot.update((mybot.lastGuildCount || client.guilds.cache.size - 1) + 1)

    // ...
})

client.on("guildDelete", (guild: Guild) => {
    const { ratelimitRemaining } = mybot.fetchClient.endpointCache.find(q => q.endpoint === "/graphql") as FetchResponse || { rateLimitRemaining: null } as { [key: string]: null }

    // ratelimitRemaining 값이 null이라는 것은 곧 ratelimitRemaining이 최대일 경우가 높습니다 (이때까지 쿼리를 안함)
    if (typeof ratelimitRemaining === "number" && ratelimitRemaining <= 10) return

    mybot.update((mybot.lastGuildCount || client.guilds.cache.size + 1) - 1)

    // ...
})
```