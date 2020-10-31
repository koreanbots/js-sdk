/* eslint-disable @typescript-eslint/no-var-requires */

const Bots = require("./bots").default || require("./bots")
const MyBot = require("./mybot").default || require("./mybot")
const KoreanbotsClient = require("./kclient").default || require("./kclient")
const Widgets = require("./widgets").default || require("./widgets")
const Users = require("./users").default || require("./users")
const { version } = require("../../package.json")


module.exports = {
    Bots, MyBot,
    KoreanbotsClient,
    Widgets, Users,
    get version() {
        return version
    }
}