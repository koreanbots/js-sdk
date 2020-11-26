<h1 align="center">Koreanbots.js</h1>
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

> TypeScript/JavaScript SDK for <a href="https://koreanbots.dev">Koreanbots</a>

### 🏠 [홈페이지](https://koreanbots.dev)

## 설치

```sh
# NPM
$ npm install koreanbots
# Yarn
$ yarn add koreanbots
```

## v2 -> v3 마이그레이션 가이드

❯ [가이드](https://github.com/koreanbots/js-sdk/blob/master/docs/v3-migration.md)


## 옵션 

### Koreanbots.MyBot

❯ 이외의 함수 이용법 [가이드](https://github.com/koreanbots/js-sdk/blob/master/docs/mybot.md)

| 옵션                         | 타입         | 필수 | 기본값       | 설명                                                                                           |
|-----------------------------|-------------|-----|------------|-----------------------------------------------------------------------------------------------|
| `options.token`             | String      |  O  |      -     | Koreanbots의 토큰                                                                               |
| `options.clientID`          | String      |  O  |      -     | 자신의 봇의 ID                                                                                   |
| `options.hideToken`         | Boolean     |  X  |    false   | 외부로 유출될수 있는 `options.token`을 가립니다.                                                      |
| `options.noWarning`         | Boolean     |  X  |    false   | 모듈의 경고 알림을 끕니다                                                                           |
| `options.avoidRateLimit`    | Boolean     |  X  |    true    | 레이트리밋을 최대한 피합니다                                                                         |
| `options.cacheTTL`          | Number      |  x  |    60000   | Time-to-Live의 약자로써 `options.cacheTTL`(밀리초) 뒤에 해당 내용을 삭제합니다.                          |
| `options.apiVersion`        | Number      |  x  |      2     | Koreanbots API의 버전을 선택합니다.                                                                |

### Koreanbots.Bots

❯ 주의: Bots는 캐시를 자주 활용합니다. 이는 곧 메모리 사용량으로 직결되며 cacheTTL 옵션을 잘 설정해주세요.
❯ 이외의 함수 이용법 [가이드](https://github.com/koreanbots/js-sdk/blob/master/docs/bots.md)

| 옵션                         | 타입         | 필수 | 기본값       | 설명                                                                                           |
|-----------------------------|-------------|-----|------------|------------------------------------------------------------------------------------------------|
| `options.token`             | String      |  O  |      -     | Koreanbots의 토큰                                                                               |
| `options.hideToken`         | Boolean     |  X  |    false   | 외부로 유출될수 있는 `options.token`을 가립니다.                                                      |
| `options.noWarning`         | Boolean     |  x  |    false   | 모듈의 경고 알림을 끕니다                                                                           |
| `options.avoidRateLimit`    | Boolean     |  x  |    true    | 레이트리밋을 최대한 피합니다                                                                         |
| `options.cacheTTL`          | Number      |  x  |   3600000  | Time-to-Live의 약자로써 `options.cacheTTL`(밀리초) 뒤에 해당 내용을 삭제합니다.                          |
| `options.apiVersion`        | Number      |  x  |      2     | Koreanbots API의 버전을 선택합니다.                                                                |

### Koreanbots.KoreanbotsClient

❯ 이외의 이용법 [가이드](https://github.com/koreanbots/js-sdk/blob/master/docs/kclient.md)

| 옵션                                           | 타입         | 필수 | 기본값       | 설명                                                                         |
|-----------------------------------------------|-------------|-----|------------|------------------------------------------------------------------------------|
| `options.koreanbotsOptions.token`             | String      |  O  |      -     | Koreanbots의 토큰                                                             |
| `options.koreanbotsOptions.hideToken`         | Boolean     |  X  |    false   | 외부로 유출될수 있는 `options.token`을 가립니다.                                    |
| `options.koreanbotsOptions.cacheTTL`          | Number      |  x  |    60000   | Time-to-Live의 약자로써 `options.cacheTTL`(밀리초) 뒤에 해당 내용을 삭제합니다.        |
| `options.koreanbotsOptions.apiVersion`        | Number      |  x  |      2     | Koreanbots API의 버전을 선택합니다.                                              |
| `options.koreanbotsOptions.noWarning`         | Boolean     |  x  |    false   | 모듈의 경고 알림을 끕니다                                                         |
| `options.koreanbotsOptions.avoidRateLimit`    | Boolean     |  x  |    true    | 레이트리밋을 최대한 피합니다                                                       |
| `options.koreanbotsOptions.updateInterval`    | Number      |  x  |   1800000  | `options.koreanbotsOptions.updateInterval`(밀리초)마다 서버 수를 업데이트합니다.     |

### Koreanbots.Users

❯ 이외의 함수 이용법 [가이드](https://github.com/koreanbots/js-sdk/blob/master/docs/users.md)

| 옵션                         | 타입         | 필수 | 기본값       | 설명                                                                                           |
|-----------------------------|-------------|-----|------------|------------------------------------------------------------------------------------------------|
| `options.token`             | String      |  O  |      -     | Koreanbots의 토큰                                                                               |
| `options.hideToken`         | Boolean     |  X  |    false   | 외부로 유출될수 있는 `options.token`을 가립니다.                                                      |
| `options.noWarning`         | Boolean     |  x  |    false   | 모듈의 경고 알림을 끕니다                                                                           |
| `options.avoidRateLimit`    | Boolean     |  x  |    true    | 레이트리밋을 최대한 피합니다                                                                         |
| `options.cacheTTL`          | Number      |  x  |   3600000  | Time-to-Live의 약자로써 `options.cacheTTL`(밀리초) 뒤에 해당 내용을 삭제합니다.                          |
| `options.apiVersion`        | Number      |  x  |      2     | Koreanbots API의 버전을 선택합니다.                                                                |

### Koreanbots.FetchClient 

| 옵션                         | 타입         | 필수 | 기본값       | 설명                                                                                           |
|-----------------------------|-------------|-----|------------|------------------------------------------------------------------------------------------------|
| `options.token`             | String      |  O  |      -     | Koreanbots의 토큰                                                                               |
| `options.hideToken`         | Boolean     |  X  |    false   | 외부로 유출될수 있는 `options.token`을 가립니다.                                                      |
| `options.noWarning`         | Boolean     |  x  |    false   | 모듈의 경고 알림을 끕니다                                                                           |
| `options.avoidRateLimit`    | Boolean     |  x  |    true    | 레이트리밋을 최대한 피합니다                                                                         |
| `options.cacheTTL`          | Number      |  x  |    60000   | Time-to-Live의 약자로써 `options.cacheTTL`(밀리초) 뒤에 해당 내용을 삭제합니다.                          |
| `options.apiVersion`        | Number      |  x  |      2     | Koreanbots API의 버전을 선택합니다.                                                                |

### Koreanbots.Cache

❯ 이외의 이용법 [가이드](https://github.com/koreanbots/js-sdk/blob/master/docs/cache.md)

| 옵션                         | 타입         | 필수 | 기본값       | 설명                                                                                           | 
|-----------------------------|-------------|-----|------------|-----------------------------------------------------------------------------------------------|
| `ttl`                       | Number      |  O  |      -     | 캐시 Time-to-Live                                                                              |

### Koreanbots.Widgets

❯ 이외의 함수 이용법 [가이드](https://github.com/koreanbots/js-sdk/blob/master/docs/widgets.md)

| 옵션                         | 타입         | 필수 | 기본값       | 설명                                                                                           |
|-----------------------------|-------------|-----|------------|------------------------------------------------------------------------------------------------|
| `options.cacheTTL`          | Number      |  x  |  10800000  | Time-to-Live의 약자로써 `options.cacheTTL`(밀리초) 뒤에 해당 내용을 삭제합니다.                          |
| `options.apiVersion`        | Number      |  x  |      2     | Koreanbots API의 버전을 선택합니다.                                                                |


## 수동 메모리(캐시) 관리

```js
const { Bots } = require("koreanbots")
const bots = new Bots({
    token: "토큰"
})

if(bots.fetchClient.cache.size >= 100) bots.fetchClient.cache.clear()
```


## 테스트하기

- discord.js : 자동 업데이트 

**주의:** *이 KoreanbotsClient는 discord.js v12에서만 작동합니다.*
```js
const { KoreanbotsClient } = require("koreanbots")
const client = new KoreanbotsClient({
    koreanbotsOptions: {
        token: "토큰",
        updateInterval: 600000 //10분마다 서버 수를 업데이트합니다. (기본값 30분)
    }
})

client.on("ready", () => console.log(`${client.user.tag}로 로그인하였습니다.`))

client.login("토큰")

process.on("SIGINT", () => {
    client.destroy()
    process.exit()
})
```

- discord.js : 수동 업데이트
```js
const { MyBot } = require("koreanbots")
const Bot = new MyBot({
    token: "토큰",
    clientID: "봇 ID"
})

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


## Author

👤 **zero734kr**

* 개인 Github: [@zero734kr](https://github.com/zero734kr)
* Organization Github: [@koreanbots](https://github.com/koreanbots)


## 🤝 도움주기

이슈와 PR은 모두 환영입니다!<br>
무언가 문제가 생겼다면 [이슈 페이지](https://github.com/koreanbots/js-sdk/issues) 또는 [koreanbots 통합 이슈 페이지](https://github.com/koreanbots/koreanbots)에 저를 언급하여 알려주세요! ``(예시: @zero734kr, js sdk 버그입니다.)``<br>
코드 수정 요청은 [PR 페이지](https://github.com/koreanbots/js-sdk/pulls)에 올려주세요.


## 서포트

만약 이 모듈이 도움이 되었다면 ⭐️를 눌러주세요!


## 📝 라이센스

Copyright © 2020 [zero734kr](https://github.com/koreanbots).<br />
This project is [MIT](https://github.com/koreanbots/js-sdk/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
