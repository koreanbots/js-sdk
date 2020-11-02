# koreanbots/Bots 가이드

## 기본

**❯ 봇 정보**

```js
const CLIENT_ID = /* 봇 아이디 (예시: client.user.id) */
bots.get(CLIENT_ID)
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: {
    bot: {
      id: '봇 아이디',
      lib: '봇 라이브러리',
      prefix: '접두사',
      name: '봇 이름',
      servers: 서버 수,
      votes: 하트 수,
      intro: '...',
      desc: '...',
      avatar: '...',
      url: '...',
      web: '...',
      git: '...',
      category: Category[],
      tag: '...',
      discord: '...',
      state: '...',
      verified: Boolean,
      trusted: Boolean,
      boosted: Boolean,
      partnered: Boolean,
      vanity: '...',
      banner: '...',
      status: '...',
      bg: '...',
      owners: User[]
    }
  },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/

bots.get(CLIENT_ID, [
    "id",
    "prefix",
    "votes",
    "servers",
    "discord"
])
/**
{
  code: 200,
  statusText: 'OK',
  data: {
    bot: {
      id: '봇 아이디',
      prefix: '접두사',
      votes: 하트 수,
      servers: 서버 수,
      discord: '...'
    }
  },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
}
*/
```

**❯ 봇 리스팅**

* 이 함수를 사용하는 것은 추천되지 않습니다. 

```js
bots.list("TRUSTED")
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: Bot[], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/

bots.list("TRUSTED", "리스팅에반영되지않는값", 1, ["id"])
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: [{ id: '...' }, ...], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/
```

**❯ 봇 검색**

```js
bots.search("twilight twilight twilight 널 찾아내는 spolight spolight oh yeah")
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: Bot[], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/

bots.search("따따따따따", 1, ["name"])
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: [{ name: '...' }, ...], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/
```

**❯ 카테고리로 봇 검색**

```js
bots.category("웹 대시보드")
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: Bot[], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/

bots.category("웹 대시보드", 1, ["name"])
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: [{ name: '...' }, ...], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/
```

**❯ 하트 많은 순서대로 리스팅**

```js
bots.vote()
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: Bot[], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/

bots.vote(1, ["web"])
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: [{ web: '...' }, ...], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/
```

**❯ 새로운 봇 리스팅**

```js
bots.newList()
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: Bot[], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/

bots.newList(1, ["web"])
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: [{ web: '...' }, ...], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/
```

**❯ 신뢰되는 봇 리스팅**

```js
bots.trusted()
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: Bot[], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/

bots.trusted(1, ["web"])
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: [{ web: '...' }, ...], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/
```

**❯ 파트너 봇 리스팅**

```js
bots.partnered()
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: [], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/

bots.partnered(1, ["web"])
/**
Promise < {
  code: 200,
  statusText: 'OK',
  data: { list: { data: [], currentPage: 1, totalPage: 1 } },
  message: undefined,
  isCache: false,
  ratelimitRemaining: 149,
  endpoint: '/graphql',
  updatedTimestamp: undefined
} >
*/
```