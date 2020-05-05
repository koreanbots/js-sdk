# koreanbots

JS SDK for Koreanbots (Made in TS)

## 문서

[문서](https://koreanbots.cf/js-sdk)

## 예시

### 서버수 업데이트하기

주기적으로 봇의 서버 수를 업데이트합니다. (discord.js)

#### v12

```js
const Discord = require('discord.js');
const client = new Discord.Client();

const koreanbots = require('koreanbots');
const Bot = new koreanbots.MyBot('Koreanbots 토큰')

client.on('ready', () => {
    console.log(`${client.user.tag}로 로그인하였습니다.`);
    Bot.update(client.guilds.cache.size) // 준비 상태를 시작할 때, 최초로 업데이트합니다.
    .then(res=>console.log('서버 수를 정상적으로 업데이트하였습니다!\n반환된 정보:' + JSON.stringify(res)))
    .catch(e=> console.error(e))
    setInterval(() => {
        Bot.update(client.guilds.cache.size)
        .then(res=>console.log('서버 수를 정상적으로 업데이트하였습니다!\n반환된 정보:' + JSON.stringify(res)))
        .catch(e=> console.log(e))
    }, 600000) // 10분마다 서버 수를 업데이트합니다.
});

client.login('토큰')
```

#### v11 >

```js
const Discord = require('discord.js');
const client = new Discord.Client();

const koreanbots = require('koreanbots');
const Bot = new koreanbots.MyBot('Koreanbots 토큰')

client.on('ready', () => {
    console.log(`${client.user.tag}로 로그인하였습니다.`);
    Bot.update(client.guilds.size) // 준비 상태를 시작할 때, 최초로 업데이트합니다.
    .then(res=>console.log('서버 수를 정상적으로 업데이트하였습니다!\n반환된 정보:' + JSON.stringify(res)))
    .catch(e=> console.error(e))
    setInterval(()=> {
        Bot.update(client.guilds.size)
        .then(res=>console.log('서버 수를 정상적으로 업데이트하였습니다!\n반환된 정보:' + JSON.stringify(res)))
        .catch(e=> console.log(e))
    }, 600000) // 10분마다 서버 수를 업데이트합니다.
    });

client.login('토큰')
```

### 아이디로 봇 정보 가져오기 (/bots/get/:id)

```js
const koreanbots = require('koreanbots');
const Bots = koreanbots.Bots

Bots.getByID('653534001742741552')
.then(r=> console.log(r)) // 반환되는 데이터는 옆 링크를 참고해주세요: https://koreanbots.cf/js-sdk/interfaces/_types_.getbyid.html
.catch(e=> console.error(e))
```
