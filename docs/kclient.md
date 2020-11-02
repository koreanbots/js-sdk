# koreanbots/KoreanbotsClient 가이드

## 기본

```js
const client = new KoreanbotsClient({
    koreanbotsOptions: {
        token: "토큰",
        updateInterval: 600000
    }
})
```

## 심화

```js
class CustomClient extends KoreanbotsClient {
    constructor(options) {
        super(options)

        const { clientToken } = options

        if(clientToken) this.login(clientToken)

        // ...
    }    
}

const client = new CustomClient({
    koreanbotsOptions: {
        token: "토큰",
        updateInterval: 600000
    }
})
```