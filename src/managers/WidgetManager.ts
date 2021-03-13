import LRU from "lru-cache"
import { Widget } from "../structures/Widget"
import { CacheOptionsValidator, KoreanbotsInternal } from "../util/Constants"
import { URLSearchParams } from "url"

import type {
    WidgetManagerOptions, FetchResponse, Nullable, WidgetOptions, WidgetMakeOptions,
    WidgetTarget, WidgetType, RequestInitWithInternals, DefaultCacheOptions, FetchOptions
} from "../util/types"
import type { Koreanbots } from "../client/Koreanbots"
import type { Response } from "node-fetch"

interface WidgetQuery {
    widget(target: WidgetTarget):
        (type: WidgetType) =>
            (id: string) => {
                get: (options?: RequestInitWithInternals) => FetchResponse<Buffer>
            }
}

const defaultCacheMaxSize = 100
const defaultCacheMaxAge = 60000 * 60

export class WidgetManager {
    public cache: LRU<string, Nullable<Widget>>

    constructor(public readonly koreanbots: Koreanbots, public readonly options: WidgetManagerOptions) {
        this.options = options ?? { cache: {} }

        const cacheOptionsProxy = new Proxy(this.options.cache, CacheOptionsValidator<DefaultCacheOptions>())
        // const optionsProxy = new Proxy(this.options, WidgetManager.validator<WidgetManagerOptions>())

        cacheOptionsProxy.max = options?.cache?.max ?? defaultCacheMaxSize
        cacheOptionsProxy.maxAge = options?.cache?.maxAge ?? defaultCacheMaxAge

        this.cache = new LRU({
            max: this.options.cache.max,
            maxAge: this.options.cache.maxAge
        })
    }

    getVoteWidgetURL(id: string): string {
        return `${this.koreanbots.api.client.globalUri}/widget/bots/votes/${id}.svg`
    }

    getStatusWidgetURL(id: string): string {
        return `${this.koreanbots.api.client.globalUri}/widget/bots/status/${id}.svg`
    }

    getServerWidgetURL(id: string): string {
        return `${this.koreanbots.api.client.globalUri}/widget/bots/servers/${id}.svg`
    }

    async getVoteWidget(id: string, options: WidgetOptions = { format: "png" }): Promise<Buffer> {
        const res = await this._fetch({
            target: "bots",
            type: "votes",
            id,
            ...options
        })

        const { buffer } = res.data ?? { buffer: new Error(`"${id}" 봇에 대한 투표 수 위젯을 불러오는 것에 실패 했습니다.`) }

        if (buffer instanceof Error) throw buffer

        return buffer
    }

    async getServerWidget(id: string, options: WidgetOptions = { format: "png" }): Promise<Buffer> {
        const res = await this._fetch({
            target: "bots",
            type: "servers",
            id,
            ...options
        })

        const { buffer } = res.data ?? { buffer: new Error(`"${id}" 봇에 대한 서버 수 위젯을 불러오는 것에 실패 했습니다.`) }

        if (buffer instanceof Error) throw buffer

        return buffer
    }

    async getStatusWidget(id: string, options: WidgetOptions = { format: "png" }): Promise<Buffer> {
        const res = await this._fetch({
            target: "bots",
            type: "status",
            id,
            ...options
        })

        const { buffer } = res.data ?? { buffer: new Error(`"${id}" 봇에 대한 상태 위젯을 불러오는 것에 실패 했습니다.`) }

        if (buffer instanceof Error) throw buffer

        return buffer
    }

    /**
     * 직접적인 사용이 권장되지 않습니다.
     */
    async _fetch(options: WidgetMakeOptions, fetchOptions: FetchOptions = { force: false }): Promise<FetchResponse<Widget>> {
        const query = new URLSearchParams()
        const queryOptions: (keyof WidgetOptions)[] = ["icon", "scale", "style"]

        const cache = this.cache.get(Object.keys(options).join("/"))

        if (fetchOptions?.force && cache) {
            const cacheObject: FetchResponse<Widget> = {
                code: 304,
                data: cache,
                isCache: true,
                ratelimitRemaining: 3,
                url: `/widget/${options.target}/${options.type}/${options.id}.svg`
            }

            return cacheObject
        }

        for (const queryOption of queryOptions) {
            const value = options[queryOption]?.toString?.() || options[queryOption] as string
            if (options[queryOption] || typeof options[queryOption] === "boolean") query.append(queryOption, value)
        }

        const [res, sharp] = await Promise.allSettled([
            this.koreanbots.api<WidgetQuery>({ global: true }).widget(options.target)(options.type)(`${options.id}.svg`).get({
                [KoreanbotsInternal]: {
                    query,
                    bodyResolver: <T>(res: Response) => res.buffer() as unknown as T
                }
            }),
            options?.format !== "svg" ? import("sharp") : (() => { throw new Error(`"${options.format}" 파일 형식으로 변환하기 위한 모듈 "sharp"를 찾을 수 없습니다.`) })()
        ])

        if (sharp.status === "rejected") throw new Error(sharp.reason)

        if (res.status === "fulfilled") {
            const sh = sharp.value.default
            const buffer = res.value.data

            if (!buffer) throw new Error("위젯에서 Buffer 데이터를 읽을 수 없습니다.")

            let converted
            switch (options?.format) {
            case "jpeg":
            case "jpg":
                converted = sh(buffer).jpeg().toBuffer()
                break
            case "png":
                converted = sh(buffer).png().toBuffer()
                break
            case "webp":
                converted = sh(buffer).webp().toBuffer()
                break
            default:
                converted = buffer
                break
            }

            res.value.data = await converted
        }

        const instance = res.status === "fulfilled" && 
            new Widget(this.koreanbots, res.value.data ?? Buffer.from("0"), options)

        if (!instance) throw new Error((res as PromiseRejectedResult).reason)

        this.cache.set(
            Object.keys(options).join("/"), 
            instance
        )

        // @ts-expect-error PromiseRejectedResult is being filtered above
        return { ...res.value, data: instance }
    }
}
