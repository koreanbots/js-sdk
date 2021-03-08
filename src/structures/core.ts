import type { Options } from "lru-cache"
import type { RequestInit } from "node-fetch"

export type Version = 1 | 2

export interface FetchResponse<T = unknown> {
    status: number
    data: T | null
}

export interface BaseOptions {
    noWarning?: boolean
}

export interface APIClientOptions extends BaseOptions {
    version: Version
    token: string
    cacheOptions: Options<unknown, unknown>
    requestTimeout: number
    retryLimit: number
    unstable: boolean
}

export interface InternalFetchCache {
    method: string
    url: string
    options?: RequestInit
}