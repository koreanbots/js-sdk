const tasks = (...args) => args.join(" && ")

module.exports = {
    "hooks": {
        "pre-commit": tasks(
            "yarn lint:fix",
            "yarn build"
        )
    }
}