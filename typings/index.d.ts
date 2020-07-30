
declare module "koreanbots" {
    import { Collection } from "@discordjs/collection"
    import { ClientOptions, Client } from "discord.js"

    export class MyBot {
        constructor(token: string, options?: DefaultClassOptions)

        public token: string
        public options: DefaultClassOptions
        public updatedAt: Date
        public updatedTimestamp: number

        public cache: Collection<string, object>
        public remainingPerEndpointCache: Collection<string, number | string>

        private isJSON(something: any): Boolean
        private _fetch(endpoint: string, opt?: FetchOptions): Promise<APIResponse>

        public update(count: number): Promise<APIResponse>
        public checkVote(id: string): Promise<APIResponse>
    }

    export class Bots {
        constructor(options?: DefaultClassOptions)

        public options: DefaultClassOptions

        public cache: Collection<string, object>
        public remainingPerEndpointCache: Collection<string, number | string>
        private _privateCache: {
            search: Collection<string, object>,
            category: Collection<string, object>
        }

        private isJSON(something: any): Boolean
        private _fetch(endpoint: string, opt?: FetchOptions): Promise<APIResponse>

        public get(pageOrID: string | number): Promise<getByID | getBots>
        public search(query: string, page?: number): Promise<getBots>
        public category(query: string, page?: number): Promise<getBots>
    }

    export class KoreanbotsClient extends Client {
        constructor(options: KoreanbotsClientOptions)

        public koreanbotsInterval: null | any

        private _update(): Promise<APIResponse>
        private _ok(): undefined
    }

    export class Widgets {
        constructor(options?: GlobalDefaultClassOptions)

        public cache: Collection<string, Buffer>
        public allowedFormats: ["svg", "png", "jpeg", "webp"]

        private _mkWidget(type: string, id: string, format: string): Promise<Buffer>

        public getVoteWidgetURL(id: string): string
        public getServerWidgetURL(id: string): string

        public getVoteWidget(id: string, format?: WidgetFormats): Promise<Buffer>
        public getServerWidget(id: string, format?: WidgetFormats): Promise<Buffer>
    }

    export namespace _cache {
        export interface MyBot {
            KoreanbotsCache: Collection<string, object>,
            RemainingEndpointCache: Collection<string, number | string>
        }
        export interface Bots {
            BotsCache: Collection<string, object>,
            BotsdotjsRemainingPerEndpoint: Collection<string, number | string>, 
            SearchCache: Collection<string, object>, 
            CategoryCache: Collection<string, object>
        }
        export interface Widgets {
            WidgetsCache: Collection<string, Buffer>
        }
    }

    interface GlobalDefaultClassOptions {
        autoFlush?: number
        autoFlushInterval?: number
    }

    interface DefaultClassOptions extends GlobalDefaultClassOptions {
        noWarning?: Boolean
        avoidRateLimit?: Boolean
    }

    interface FetchOptions {
        method?: "POST" | "GET" | "PUT" | "DELETE" | "PATCH"
        disableGlobalCache?: Boolean
        headers: object
        body: string | object
    }

    interface APIResponse {
        code: 200 | 400 | 403 | 401 | 429;
        message?: string | object;
    }

    interface Bot {
        id: string;
        name: string;
        servers: number;
        votes: number;
        intro: string;
        avatar: string;
        url: string;
        category: Category[];
        tag: string;
        state: "ok" | "archived" | "private"
    }

    interface getBots {
        code: 200 | 429 | 400;
        data?: Bot[];
        totalPage?: number;
        currentPage?: number;
        message?: string;
    }

    interface getByID {
        code: 200 | 429;
        data?: BotDetail;
        message?: string;
    }

    interface BotDetail {
        id: string;
        date: number;
        owners: User[]
        name: string;
        prefix: string;
        lib: Library;
        servers: number;
        votes: number;
        intro: string;
        desc: string;
        web: string;
        git: string;
        avatar: string;
        url: string;
        status: "online" | "offline" | "idle" | "dnd" | "streaming";
        verified: 0 | 1;
        trusted: 0 | 1;
        discord: string;
        category: Category[];
        tag: string;
        state: "ok" | "archived" | "private"
    }

    interface User {
        id: string;
        username: string;
        tag: string;
        avatar: string;
        bots: string[]
    }

    interface KoreanbotsClientOptions extends ClientOptions {
        koreanbotsToken: string
        koreanbotsOptions: { interval: number }
    }

    enum Library {
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

    enum Category {
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

    enum WidgetFormats {
        "png",
        "svg",
        "jpeg",
        "webp"
    }
}