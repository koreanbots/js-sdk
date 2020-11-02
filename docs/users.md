# koreanbots/Users 가이드

## 기본

**❯ 유저 정보**

```js
users.get("462355431071809537")
/**
Promise < {
    code: 200,
    statusText: 'OK',
    data: {
        user: {
            id: '462355431071809537',
            avatar: '1d6cd31b1f1d3102f45605a3871a4776',
            tag: '5005',
            username: 'zero734kr',
            perm: 0,
            github: 'zero734kr',
            bots: Bot[]
        }
    },
    message: undefined,
    isCache: false,
    ratelimitRemaining: 142,
    endpoint: '/graphql',
    updatedTimestamp: undefined
} >
*/

users.get("462355431071809537", ["github"])
/**
Promise < {
    code: 200,
    statusText: 'OK',
    data: {
        user: {
            github: 'zero734kr'
        }
    },
    message: undefined,
    isCache: false,
    ratelimitRemaining: 142,
    endpoint: '/graphql',
    updatedTimestamp: undefined
} >
*/
```

**❯ 로그인 정보**

* __***이 기능은 유저 토큰으로 Users 인스턴스를 생성 했을시에만 사용 가능합니다.***__

```js
users.me()
/**
Promise < {
    code: 200,
    statusText: 'OK',
    data: {
        user: {
            id: '유저 ID',
            avatar: '...',
            tag: '...',
            username: '유저 이름',
            perm: 숫자,
            github: '...',
            bots: Bot[]
        }
    },
    message: undefined,
    isCache: false,
    ratelimitRemaining: 142,
    endpoint: '/graphql',
    updatedTimestamp: undefined
} >
*/

users.me(["github"])
/**
Promise < {
    code: 200,
    statusText: 'OK',
    data: {
        user: {
            github: '...'
        }
    },
    message: undefined,
    isCache: false,
    ratelimitRemaining: 142,
    endpoint: '/graphql',
    updatedTimestamp: undefined
} >
*/
```

**❯ 하트 누른 봇 리스팅**

* __***이 기능은 유저 토큰으로 Users 인스턴스를 생성 했을시에만 사용 가능합니다.***__

```js
users.stars()
/**
Promise < {
    code: 200,
    statusText: 'OK',
    data: {
        stars: Bot[]
    },
    message: undefined,
    isCache: false,
    ratelimitRemaining: 142,
    endpoint: '/graphql',
    updatedTimestamp: undefined
} >
*/

users.stars(["id"])
/**
Promise < {
    code: 200,
    statusText: 'OK',
    data: {
        stars: [{ id: "..." }, ...]
    },
    message: undefined,
    isCache: false,
    ratelimitRemaining: 142,
    endpoint: '/graphql',
    updatedTimestamp: undefined
} >
*/
```