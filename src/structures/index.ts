/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientOptions } from "discord.js"

export type Versions = 1 | 2

export interface Version {
    version: Versions
    deprecated?: boolean
    recommended?: boolean
}

interface BaseOptions {
    token: Required<string>
    apiVersion?: Versions
    hideToken?: boolean
    noWarning?: boolean
    avoidRateLimit?: boolean
}

export interface KoreanbotsOptions extends BaseOptions {
    clientID: Required<string>
    cacheTTL?: number
}

export interface BotsOptions extends BaseOptions {
    cacheTTL?: number
}

export interface UsersOptions extends BaseOptions {
    cacheTTL?: number
}

export interface FetchClientOptions extends BaseOptions {
    cacheTTL?: number
}

export interface WidgetsOptions {
    cacheTTL?: number
    apiVersion?: Versions
}

export interface FetchResponse {
    code: number
    statusText: string 
    message: string
    isCache: boolean
    ratelimitRemaining: number | string | null
    endpoint: string
    updatedTimestamp?: number
    data?: Record<string, any>
    errors?: GraphQLErrorResponse[]
}

export interface User {
    id: string
    avatar: string
    tag: string
    username: string
    perm: number
    github: string
    bots: Bot[]
}

export interface Bot {
    id: string
    lib: string
    prefix: string
    name: string
    servers: number
    votes: number
    intro: string
    desc: string
    avatar: string
    url: string
    web: string
    git: string
    category: string[]
    tag: string
    discord: string
    state: BotState
    verified: boolean
    trusted: boolean
    boosted: boolean
    partnered: boolean
    vanity: string
    banner: string
    status: Status
    bg: string
    owners: User[]
}

export interface TypedCacheValue {
    type: string
}

export interface KoreanbotsOptionsForKoreanbosClient {
    apiVersion?: Versions
    hideToken?: boolean
    noWarning?: boolean
    avoidRateLimit?: boolean
    cacheTTL?: number
    updateInterval: number
    token: Required<string>
}

export interface KoreanbotsClientOptions extends ClientOptions {
    koreanbotsOptions: KoreanbotsOptionsForKoreanbosClient
}

export enum Library {
    "discord.js",
    "Eris",
    "discord.py",
    "discordcr",
    "Nyxx",
    "Discord.Net",
    "DSharpPlus",
    "Nostrum",
    "coxir",
    "DiscordGo",
    "Discord4J",
    "Javacord",
    "JDA",
    "Discordia",
    "RestCord",
    "Yasmin",
    "disco",
    "discordrb",
    "serenity",
    "SwiftDiscord",
    "Sword",
    "기타",
    "비공개"
}

export enum Category {
    "관리",
    "뮤직",
    "전적",
    "웹 대시보드",
    "로깅",
    "도박",
    "게임",
    "밈",
    "레벨링",
    "유틸리티",
    "번역",
    "대화",
    "검색"
}

export enum BotState {
    "ok",
    "archived",
    "private",
    "reported"
}

export enum Status {
    "online",
    "idle",
    "dnd",
    "offline",
    "streaming"
}

export type ListType = "VOTE" | "NEW" | "TRUSTED" | "PARTNERED" | "SEARCH" | "CATEGORY"

export enum ListTypes {
    "VOTE",
    "NEW",
    "TRUSTED",
    "PARTNERED",
    "SEARCH",
    "CATEGORY"
}

export type Formats = "jpeg" | "png" | "webp" | "svg"

export type WidgetType = "Vote" | "Server"

export interface ErrorLocation {
    line: number
    column: number
}

export interface GraphQLErrorResponse {
    message: string
    err_type: string
    locations: ErrorLocation[]
}