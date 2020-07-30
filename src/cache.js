let { Collection } = require("@discordjs/collection")

if(!Collection) Collection = require("@discordjs/collection").default || require("@discordjs/collection")

const RemainingEndpointCache = new Collection()
const KoreanbotsCache = new Collection()
const BotsCache = new Collection()
const BotsdotjsRemainingPerEndpoint = new Collection()
const SearchCache = new Collection()
const CategoryCache = new Collection()
const WidgetsCache = new Collection()

module.exports = {
    "index.js": {
        KoreanbotsCache, RemainingEndpointCache
    },
    "bots.js": {
        BotsCache, BotsdotjsRemainingPerEndpoint, SearchCache, CategoryCache
    },
    "widget.js": {
        WidgetsCache
    }
}
