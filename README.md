<h1 align="center">Koreanbots - JS SDK</h1>
<p>
  <a href="https://www.npmjs.com/package/koreanbots" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/koreanbots.svg">
  </a>
  <a href="https://github.com/koreanbots/js-sdk#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/koreanbots/js-sdk/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/koreanbots/js-sdk/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/koreanbots/js-sdk" />
  </a>
  <a href="https://npmcharts.com/compare/koreanbots?minimal=true" target="_blank">
    <img alt="Downloads" src="https://img.shields.io/npm/dm/koreanbots.svg">
  </a>
  <a href="https://github.com/koreanbots/js-sdk/blob/master/.github/workflows/eslint.yml" target="_blank">
    <img alt="eslint.yml" src="https://github.com/koreanbots/js-sdk/workflows/.github/workflows/eslint.yml/badge.svg">
  </a>
</p>

> JS SDK for <a href="https://koreanbots.dev">Koreanbots</a>

### 🏠 [홈페이지](https://koreanbots.dev)

## 설치

```sh
npm install koreanbots
```

## 옵션 

### Koreanbots.MyBot

| 옵션                         | 타입         | 필수  | 기본값      | 설명                                                                         |
|-----------------------------|-------------|-----|------------|----------------------------------------------------------------------------|
| `token`                     | String      |  O  |      -     | Koreanbots의 토큰                                                            |
| `options.hideToken`         | Boolean     |     |    false   | 외부로 유출될수 있는 this.token을 가립니다.                                         |
| `options.noWarning`         | Boolean     |     |    false   | 모듈의 경고 알림을 끕니다                                                         |
| `options.avoidRateLimit`    | Boolean     |     |    true    | 레이트리밋을 최대한 피합니다                                                       |
| `options.autoFlush`         | Number      |     |    100     | 캐시에 저장된 데이터 수가 `options.autoFlush`를 넘을시 캐시를 초기화합니다. (자동 캐시 관리) |
| `options.autoFlushInterval` | Number      |     |   60000    | `options.autoFlushInterval`(밀리초)마다 캐시를 관리합니다                          |

### Koreanbots.Bots

* 주의: Bots는 캐시를 자주 활용합니다. 이는 곧 메모리 사용량으로 직결되며 autoFlush로 시작하는 옵션들을 잘 설정해주세요.

| 옵션                         | 타입         | 필수  | 기본값       | 설명                                                                        |
|-----------------------------|-------------|-----|------------|----------------------------------------------------------------------------|
| `options.noWarning`         | Boolean     |     |    false   | 모듈의 경고 알림을 끕니다                                                         |
| `options.avoidRateLimit`    | Boolean     |     |    true    | 레이트리밋을 최대한 피합니다                                                       |
| `options.autoFlush`         | Number      |     |    100     | 캐시에 저장된 데이터 수가 `options.autoFlush`를 넘을시 캐시를 초기화합니다. (자동 캐시 관리) |
| `options.autoFlushInterval` | Number      |     |   900000   | `options.autoFlushInterval`(밀리초)마다 캐시를 관리합니다                          |

### Koreanbots.Widgets

| 옵션                         | 타입         | 필수  | 기본값       | 설명                                                                        |
|-----------------------------|-------------|-----|------------|----------------------------------------------------------------------------|
| `options.autoFlush`         | Number      |     |    100     | 캐시에 저장된 데이터 수가 `options.autoFlush`를 넘을시 캐시를 초기화합니다. (자동 캐시 관리) |
| `options.autoFlushInterval` | Number      |     |  3600000   | `options.autoFlushInterval`(밀리초)마다 캐시를 관리합니다                          |

## 수동 메모리(캐시) 관리

```js
const { SearchCache } = require("koreanbots")._cache.Bots

if(SearchCache.size >= 100) SearchCache.clear()
```

### 위젯 

```js
const { Widgets } = require("koreanbots")
const widget = new Widgets()
const { MessageAttachment } = require("discord.js")

widget.getVoteWidget(client.user.id, "jpeg").then(w => {
    let wg = new MessageAttachment(w)

    message.channel.send(wg)
}).catch(er => { throw er })
```

## 테스트하기

- discord.js : 자동 업데이트 

**주의:** *이 KoreanbotsClient는 discord.js v11,12에서 작동합니다.*
```js
const { KoreanbotsClient } = require("koreanbots")
const client = new KoreanbotsClient({
    koreanbotsToken: "토큰",
    koreanbotsOptions: {
        interval: 600000 //10분마다 서버 수를 업데이트합니다. (기본값 30분)
    }
})

client.on("ready", () => console.log(`${client.user.tag}로 로그인하였습니다.`))

client.login("토큰")

process.on("SIGINT", () => {
    client.destroy()
    process.exit()
})
```

- discord.js v12 : 수동 업데이트
```js
const { MyBot } = require("koreanbots")
const Bot = new MyBot("Koreanbots 토큰")

let update = count => Bot.update(count) 
    .then(res => console.log("서버 수를 정상적으로 업데이트하였습니다!\n반환된 정보:" + JSON.stringify(res)))
    .catch(console.error)

client.on("ready", () => {
    console.log(`${client.user.tag}로 로그인하였습니다.`)

    update(client.guilds.size) // 준비 상태를 시작할 때, 최초로 업데이트합니다.
    setInterval(() => update(client.guilds.cache.size), 600000) // 10분마다 서버 수를 업데이트합니다.
})

client.login("토큰")
```

- discord.js v11 : 수동 업데이트
```js
const { MyBot } = require("koreanbots")
const Bot = new MyBot("Koreanbots 토큰")

let update = count => Bot.update(count) 
    .then(res => console.log("서버 수를 정상적으로 업데이트하였습니다!\n반환된 정보:" + JSON.stringify(res)))
    .catch(console.error)

client.on("ready", () => {
    console.log(`${client.user.tag}로 로그인하였습니다.`)

    update(client.guilds.size) // 준비 상태를 시작할 때, 최초로 업데이트합니다.
    setInterval(() => update(client.guilds.size), 600000) // 10분마다 서버 수를 업데이트합니다.
})

client.login("토큰")
```

- 아이디로 봇 정보 가져오기 (/bots/get/:id)
```js
const koreanbots = require("koreanbots");
const Bots = new koreanbots.Bots()

Bots.get("653534001742741552")
    .then(r => console.log(r)) // 반환되는 데이터는 옆 링크를 참고해주세요: https://koreanbots.dev/js-sdk/interfaces/_types_.getbyid.html
    .catch(e => console.error(e))
```

## Author

👤 **zero734kr**

* 개인 Github: [@zero734kr](https://github.com/zero734kr)
* Organization Github: [@koreanbots](https://github.com/koreanbots)

## 🤝 도움주기

이슈와 PR은 모두 환영입니다!<br>
무언가 문제가 생겼다면 [이슈 페이지](https://github.com/koreanbots/js-sdk/issues)에 저를 언급하여 알려주세요! ``(예시: @zero734kr, js sdk 버그입니다.)``<br>
코드 수정 요청은 [PR 페이지](https://github.com/koreanbots/js-sdk/pulls)에 올려주세요.

## 서포트

만약 이 모듈이 도움이 되었다면 ⭐️를 눌러주세요!

## 📝 라이센스

Copyright © 2020 [zero734kr](https://github.com/koreanbots).<br />
This project is [MIT](https://github.com/koreanbots/js-sdk/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
