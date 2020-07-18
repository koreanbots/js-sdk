const options = {
    maxKeys: 10,
    stdTTL: 60000 * 10
}

const NodeCache = require("node-cache")
const RemainingEndpointCache = new NodeCache(options)
const KoreanbotsCache = new NodeCache(options)

const botsdotjsOptions = {
    maxKeys: 10,
    stdTTL: 60000 * 5
}

const queryCacheOptions = {
    maxKeys: 25,
    stdTTL: 60000 * 5
}

const BotsCache = new NodeCache(botsdotjsOptions)
const BotsdotjsRemainingPerEndpoint = new NodeCache({
    maxKeys: 10,
    stdTTL: 60000 * 60
})
const SearchCache = new NodeCache(queryCacheOptions)
const CategoryCache = new NodeCache(queryCacheOptions)

module.exports = {
    "index.js": {
        KoreanbotsCache, RemainingEndpointCache
    },
    "bots.js": {
        BotsCache, BotsdotjsRemainingPerEndpoint, SearchCache, CategoryCache
    }
}

//내가 봐도 이건 좀 개판이네