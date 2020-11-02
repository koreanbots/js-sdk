# v3 마이그레이션 가이드

## 주의 사항

* __***반환 값을 유심히 살펴보세요. 반환되는 형식이 달라진 함수가 매우 많습니다. (예시: ``{ data: Bot[] } `` -> ``{ data: { list: { data: Bot[] } } }``)***__

## 변수 가이드

```js
const koreanbots = require("koreanbots")
const MyBot = koreanbots.MyBot
const Bots = koreanbots.Bots
const KoreanbotsClient = koreanbots.KoreanbotsClient
const Widgets = koreanbots.Widgets
```


## MyBot

* [koreanbots/MyBot - 가이드](https://github.com/koreanbots/js-sdk/blob/master/docs/mybot.md)

**❯ constructor**
```diff
- const mybot = new MyBot("토큰", {
-     autoFlush: 100,
-     autoFlushInterval: 60000 * 30,
-     ...옵션
- })
+ const mybot = new MyBot({
+     token: "토큰",
+     cacheTTL: 60000 * 30,
+     ...옵션
+ })
```


## Bots

* [koreanbots/Bots - 가이드](https://github.com/koreanbots/js-sdk/blob/master/docs/bots.md)

**❯ constructor**
```diff
- const bots = new Bots({
-     autoFlush: 100,
-     autoFlushInterval: 60000 * 30,
-     ...옵션
- })
+ const bots = new Bots({
+     token: "토큰",
+     cacheTTL: 60000 * 30,
+     ...옵션
+ })
```

**❯ search**

```diff
# 1 === page

- await bots.search("검색어", 1)
# 반환 값: {
#     data: Bot[] 
# }
+ await bots.search("검색어", 1)
# 반환 값: {
#     // ...
#     data: {
#         list: {
#             data: Bot[]
#         }
#     }
#     // ...
# }
+ await bots.search("검색어", 1, ["id", "desc", "name"])
# 반환 값: {
#     // ...
#     data: {
#         list: {
#             data: [
#                 {
#                     id: 아이디,
#                     desc: 설명,
#                     name: 이름   
#                 }
#             ], 
#             currentPage: 1, 
#             totalPage: 1
#         }
#     }
#     // ...
# }
```

**❯ category**
```diff
# 1 === page

- await bots.category("전적", 1)
# 반환 값: {
#     currentPage: 1,
#     totalPage: 5,
#     data: Bot[]    
# }
+ await bots.category("전적", 1)
# 반환 값: {
#     // ...
#     data: {
#         list: {
#             data: Bot[],
#             currentPage: 1,
#             totalPage: 5
#         },
#         
#     }
#     // ...
# }
+ await bots.category("전적", 1, ["id", "desc", "name"])
# 반환 값: {
#     // ...
#     data: {
#         list: {
#             data: [
#                 {
#                     id: 아이디,
#                     desc: 설명,
#                     name: 이름   
#                 }
#             ],
#             currentPage: 1,
#             totalPage: 5
#         },
#         
#     }
#     // ...
# }
```

**❯ list**
```diff
- await bots.list("NEW", "누구세요", 1)
# 반환 값: TypeError: bots.list is not a function
+ await bots.list("NEW", "누구세요", 1)
# 반환 값: {
#     // ...
#     data: {
#         list: {
#             data: [Bot!]
#         }
#     }
# }
```

**❯ vote**
```diff
- await bots.vote()
# 반환 값: TypeError: bots.vote is not a function
+ await bots.vote()
# 반환 값: {
#     // ...
#     data: {
#         list: {
#             data: [Bot!]
#         }
#     }
# }
```

**❯ newList**
```diff
- await bots.newList()
# 반환 값: TypeError: bots.newList is not a function
+ await bots.newList()
# 반환 값: {
#     // ...
#     data: {
#         list: {
#             data: [Bot!]
#         }
#     }
# }
```

**❯ trusted**
```diff
- await bots.trusted()
# 반환 값: TypeError: bots.trusted is not a function
+ await bots.trusted()
# 반환 값: {
#     // ...
#     data: {
#         list: {
#             data: [Bot!]
#         }
#     }
# }
```

**❯ partnered**
```diff
- await bots.partnered()
# 반환 값: TypeError: bots.partnered is not a function
+ await bots.partnered()
# 반환 값: {
#     // ...
#     data: {
#         list: {
#             data: [Bot!]
#         }
#     }
# }
```


## KoreanbotsClient

* [koreanbots/KoreanbotsClient - 가이드](https://github.com/koreanbots/js-sdk/blob/master/docs/kclient.md)

**❯ constructor**
```diff
- const { KoreanbotsClient } = require("koreanbots")
- const client = new KoreanbotsClient({
-     koreanbotsToken: "토큰",
-     koreanbotsOptions: {
-         interval: 600000
-     }
- })
+ const { KoreanbotsClient } = require("koreanbots")
+ const client = new KoreanbotsClient({
+     koreanbotsOptions: {
+         token: "토큰",
+         updateInterval: 600000
+     }
+ })
```

## Users

* [koreanbots/Users - 가이드](https://github.com/koreanbots/js-sdk/blob/master/docs/users.md)

## Cache

* [koreanbots/Cache - 가이드](https://github.com/koreanbots/js-sdk/blob/master/docs/cache.md)

## Widgets

* [koreanbots/Widgets - 가이드](https://github.com/koreanbots/js-sdk/blob/master/docs/widgets.md)

**❯ constructor**
```diff
- const widget = new Widgets({
-     autoFlush: 100,
-     autoFlushInterval: 60000 * 30   
- })
+ const widget = new Widgets({
+     cacheTTL: 60000 * 30   
+ })
```
