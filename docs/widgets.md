# koreanbots/Widgets 가이드

## 변수

```js
const Discord = require("discord.js")
const { Widgets } = require("koreanbots")
const widgets = new Widgets({
    apiVersion: 1 | 2 | undefined,//(2)
    cacheTTL: 600000
})
```

## 기본

**❯ 하트 수 위젯 얻기**

```js
const widgetFormats = ["jpeg", "png", "webp", "svg"] 
const pickedFormat = widgetFormats[Math.floor(Math.random() * widgetFormats.length)]
const widgetBuffer = await widgets.getVoteWidget("봇 아이디", pickedFormat)

if(pickedFormat === "svg") return // svg 포맷 이미지는 디스코드에서 지원하지 않습니다. (보내봤자 이미지가 아닌 파일로써 출력됩니다.)

const widget = new Discord.MessageAttachment(widgetBuffer)

message.channel.send(widget)
```

**❯ 서버 수 위젯 얻기**

```js
const widgetFormats = ["jpeg", "png", "webp", "svg"] 
const pickedFormat = widgetFormats[Math.floor(Math.random() * widgetFormats.length)]
const widgetBuffer = await widgets.getServerWidget("봇 아이디", pickedFormat)

if(pickedFormat === "svg") return // svg 포맷 이미지는 디스코드에서 지원하지 않습니다. (보내봤자 이미지가 아닌 파일로써 출력됩니다.)

const widget = new Discord.MessageAttachment(widgetBuffer)

message.channel.send(widget)
```