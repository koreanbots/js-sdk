/* eslint-disable @typescript-eslint/no-var-requires */

const Bots = require("./bots").default || require("./bots")
const MyBot = require("./mybot").default || require("./mybot")
const KoreanbotsClient = require("./kclient").default || require("./kclient")
const Widgets = require("./widgets").default || require("./widgets")
const Users = require("./users").default || require("./users")
const FetchClient = require("./utils/FetchClient").default || require("./utils/FetchClient")
const Errors = require("./utils/errors").default || require("./utils/errors")
const Cache = require("./utils/cache").default || require("./utils/cache")
const Utils = require("./utils").default || require("./utils")
const { version } = require("../../package.json")


module.exports = {
    Bots, MyBot,
    KoreanbotsClient,
    Widgets, Users,
    FetchClient,
    Errors, Cache,
    Utils,

    /**
     * koreanbots 버전
     * @type {string}
     */
    get version() {
        return `v${version}`
    }
}
