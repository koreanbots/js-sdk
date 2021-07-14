const tasks = (...args) => args.join(" & ")

module.exports = {
    "hooks": {
        "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
        "pre-commit": tasks(
            "yarn lint:fix",
            "yarn test"
        )
    }
}