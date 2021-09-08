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
  <a href="https://codecov.io/gh/koreanbots/js-sdk">
    <img alt="codecov-badge" src="https://codecov.io/gh/koreanbots/js-sdk/branch/master/graph/badge.svg?token=X7YON789AE" target="_blank" />
  </a>
</p>

> TypeScript/JavaScript SDK for <a href="https://koreanbots.dev">KOREANBOTS</a>

### 🏠 [홈페이지](https://koreanbots.dev)

## 설치

```sh
# NPM
$ npm install koreanbots
# Yarn
$ yarn add koreanbots
```

## 사용 조건

> Node.js v12 이상이 권장됩니다.

| discord.js version        | supported | planned to support |
|---------------------------|-----------|--------------------|
| v11.x                     |  no       |  no                |
| v12.x                     |  yes      |  -                 |
| v13.x (stable)            |  yes      |  -                 |

## 사용법

- 자동 업데이트

```js
const { KoreanbotsClient } = require("koreanbots")
const client = new KoreanbotsClient({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
    koreanbots: {
        api: {
            token: "KOREANBOTS 토큰"
        }
    },
    koreanbotsClient: {
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

- 수동 업데이트

```js
const { Koreanbots } = require("koreanbots")
const Discord = require("discord.js")
const client = new Discord.Client()
const koreanbots = new Koreanbots({
    api: {
        token: "KOREANBOTS 토큰"
    },
    clientID: "봇 아이디"
})

let update = servers => koreanbots.mybot.update({ servers, shards: client.shard?.count }) 
    .then(res => console.log("서버 수를 정상적으로 업데이트하였습니다!\n반환된 정보:" + JSON.stringify(res)))
    .catch(console.error)

client.on("ready", () => {
    console.log(`${client.user.tag}로 로그인하였습니다.`)

    update(client.guilds.cache.size) // 준비 상태를 시작할 때, 최초로 업데이트합니다.
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
무언가 문제가 생겼다면 [이슈 페이지](https://github.com/koreanbots/js-sdk/issues)에 이슈를 열어주세요.<br>
코드 수정 요청은 [PR 페이지](https://github.com/koreanbots/js-sdk/pulls)에 올려주세요.


## 서포트

만약 이 모듈이 도움이 되었다면 ⭐️를 눌러주세요!


## 📝 라이센스

Copyright © 2020-2021 [koreanbots](https://github.com/koreanbots).<br />
This project is [MIT](https://github.com/koreanbots/js-sdk/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
