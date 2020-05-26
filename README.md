<h1 align="center">Welcome to koreanbots 👋</h1>
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
    <img alt="License: MIT" src="https://img.shields.io/github/license/koreanbots/koreanbots" />
  </a>
</p>

> JS SDK for <a href="https://koreanbots.dev">Koreanbots</a>

### 🏠 [Homepage](https://koreanbots.dev)

## Install

```sh
npm install koreanbots
```

## Run tests

- discord.js v12
```js
const { MyBot } = require("koreanbots")
const Bot = new MyBot("Koreanbots 토큰")

let update = count => Bot.update(count) 
    .then(res => console.log("서버 수를 정상적으로 업데이트하였습니다!\n반환된 정보:" + JSON.stringify(res)))
    .catch(console.error)

client.on("ready", () => {
    console.log(`${client.user.tag}로 로그인하였습니다.`)

    update(client.guilds.cache.size) // 준비 상태를 시작할 때, 최초로 업데이트합니다.
    setInterval(() => update(client.guilds.cache.size), 600000) // 10분마다 서버 수를 업데이트합니다.
})

client.login("토큰")
```

- discord.js v11
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
const koreanbots = require('koreanbots');
const Bots = new koreanbots.Bots()

Bots.get("653534001742741552")
    .then(r=> console.log(r)) // 반환되는 데이터는 옆 링크를 참고해주세요: https://koreanbots.dev/js-sdk/interfaces/_types_.getbyid.html
    .catch(e=> console.error(e))
```

## Author

👤 **zero734kr**

* Personal Github: [@zero734kr](https://github.com/zero734kr)
* Organization Github: [@koreanbots](https://github.com/koreanbots)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/koreanbots/js-sdk/issues). You can also take a look at the [contributing guide](https://github.com/koreanbots/js-sdk/pulls).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2020 [zero734kr](https://github.com/koreanbots).<br />
This project is [MIT](https://github.com/koreanbots/js-sdk/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
