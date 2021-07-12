import { loadEnvConfig } from "@next/env"

// eslint-disable-next-line no-undef
jest.setTimeout(60000 * 3)

loadEnvConfig(__dirname, true)

process.on("unhandledRejection", console.warn)