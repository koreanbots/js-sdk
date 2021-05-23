import { loadEnvConfig } from "@next/env"

loadEnvConfig(__dirname, true)

process.on("unhandledRejection", console.warn)