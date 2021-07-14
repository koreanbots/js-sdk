# koreanbots/Cache 가이드

## 기본

```js
const { Cache } = require("koreanbots")

// 60초 뒤에 저장한 내용물 삭제
const cache = new Cache(60000)

cache.set("key", "value")

console.log(cache.get("key"))
// "value"

setTimeout(() => console.log(cache.get("key")), 61000)
// undefined
```