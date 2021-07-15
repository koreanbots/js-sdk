import type { ClientOptions } from "discord.js"
import type { RequestInit, Response } from "node-fetch"
import type { URLSearchParams } from "url"
import type { KoreanbotsInternal } from "./Constants"

export type Version = 1 | 2

export type ValueOf<T> = T[keyof T]
export type Nullable<T> = T | null

export type WidgetType = "status" | "servers" | "votes"
export type WidgetTarget = "bots"
export type WidgetStyle = "classic" | "flat"
export type WidgetFormat = "webp" | "png" | "jpg" | "jpeg" | "svg"

export interface KoreanbotsClientOptions extends ClientOptions {
    koreanbots: Omit<KoreanbotsOptions, "clientID"> & { clientID?: string }
    koreanbotsClient?: {
        updateInterval?: number
    }
}

export interface Vote { 
    voted: boolean
    lastVote: number 
}
export interface WidgetOptions {
    style?: WidgetStyle
    scale?: number
    icon?: boolean
    format?: WidgetFormat
}

export interface FetchOptions {
    force?: boolean
    cache: boolean
}

export interface WidgetData {
    target: WidgetTarget
    type: WidgetType
    id: string
}

export type WidgetMakeOptions = WidgetData & WidgetOptions

export interface RequestInitWithInternals extends RequestInit {
    [KoreanbotsInternal]?: InternalOptions
}

export interface InternalOptions {
    global?: boolean
    query?: URLSearchParams | string
    bodyResolver?: <T = unknown>(res: Response) => Promise<T>
}

export enum BotFlags {
    NONE = 0 << 0,
    OFFICIAL = 1 << 0,
    KOREANBOTS_VERIFIED = 1 << 2,
    PARTNER = 1 << 3,
    DISCORD_VERIFIED = 1 << 4,
    PREMIUM = 1 << 5,
    HACKATHON_BOT = 1 << 6
}

export enum UserFlags {
    NONE = 0 << 0,
    ADMINISTRATOR = 1 << 0,
    BUG_HUNTER = 1 << 1,
    BOT_REVIEWER = 1 << 2,
    PREMIUM_USER = 1 << 3
}

export type BotStatus =
    "online" |
    "idle" |
    "dnd" |
    "streaming" |
    "offline"


export type BotState =
    "ok" |
    "reported" |
    "blocked" |
    "private" |
    "archived"

export type Category =
    "관리" |
    "뮤직" |
    "전적" |
    "게임" |
    "도박" |
    "로깅" |
    "슬래시 명령어" |
    "웹 대시보드" |
    "밈" |
    "레벨링" |
    "유틸리티" |
    "대화" |
    "NSFW" |
    "검색" |
    "학교" |
    "코로나19" |
    "번역" |
    "오버워치" |
    "리그 오브 레전드" |
    "배틀그라운드" |
    "마인크래프트"


export type Library =
    "discord.js" |
    "Eris" |
    "discord.py" |
    "discordcr" |
    "Nyxx" |
    "Discord.Net" |
    "DSharpPlus" |
    "Nostrum" |
    "coxir" |
    "DiscordGo" |
    "Discord4J" |
    "Javacord" |
    "JDA" |
    "Discordia" |
    "RestCord" |
    "Yasmin" |
    "disco" |
    "discordrb" |
    "serenity" |
    "SwiftDiscord" |
    "Sword" |
    "harmony" |
    "기타" |
    "비공개"

export interface FetchResponse<T = unknown> {
    code: number
    data: T | null
    message?: string
    isCache: boolean
    ratelimitRemaining: number
    url: string
    updatedTimestamp?: number
}

export type BaseOptions = {

}

export interface DefaultCacheOptions {
    max?: number
    maxAge?: number
}

export interface KoreanbotsOptions extends BaseOptions {
    api: RequestClientOptions
    bots?: BotManagerOptions
    widgets?: WidgetManagerOptions
    users?: UserManagerOptions
    clientID: string
    max?: number
    maxAge?: number
}

export interface RequestClientOptions extends BaseOptions {
    version?: Version
    token: string
    requestTimeout?: number
    retryLimit?: number
    unstable?: boolean
}

export interface BotManagerOptions extends BaseOptions {
    cache: DefaultCacheOptions
}

export type UserManagerOptions = BotManagerOptions
export type WidgetManagerOptions = BotManagerOptions
export interface ProxyValidator<T> {
    set(obj: T, prop: keyof T, value: ValueOf<T>): boolean
}

export interface RawBotInstance {
    id: string
    name: string
    tag: string
    avatar: Nullable<string>
    owners: RawUserInstance[]
    flags: number
    lib: Library
    prefix: string
    votes: number
    servers: number
    intro: string
    desc: string
    web: Nullable<string>
    git: Nullable<string>
    url: Nullable<string>
    discord: Nullable<string>
    category: Category[]
    vanity: Nullable<string>
    bg: Nullable<string>
    banner: Nullable<string>
    status?: Nullable<BotStatus>
    state: BotState
}

export interface RawUserInstance {
    id: string
    username: string
    tag: string
    github: Nullable<string>
    flags: UserFlags
    bots: (string | RawBotInstance)[]
}
