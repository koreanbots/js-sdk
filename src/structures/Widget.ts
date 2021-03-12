import { Base } from "./Base"
import { KoreanbotsInternal } from "../util/Constants"
import { URLSearchParams } from "node:url"

import type { Koreanbots } from "../client/Koreanbots"
import type { Response } from "node-fetch"
import type {
    WidgetOptions, WidgetTarget, WidgetType,
    FetchResponse, RequestInitWithInternals
} from "../util/types"


interface WidgetData {
    target: WidgetTarget
    type: WidgetType
    id: string
}

interface WidgetQuery {
    widget(target: WidgetTarget):
        (type: WidgetType) =>
            (id: string) =>
                (options?: RequestInitWithInternals) => FetchResponse<Buffer>
}

export class Widget extends Base {
    public readonly target: WidgetTarget
    public readonly type: WidgetType
    public readonly id: string

    constructor(public readonly koreanbots: Koreanbots, data: WidgetData) {
        super()

        this.target = data.target
        this.type = data.type
        this.id = data.id
    }

    async fetch(options: WidgetOptions = { format: "svg" }): Promise<FetchResponse<Buffer>> {
        const query = new URLSearchParams()

        for (const key of Object.keys(options).filter(f => f !== "format" && options[f as keyof WidgetOptions])) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const value = options[key as keyof WidgetOptions]?.toString?.() || options[key as keyof WidgetOptions] as string
            query.append(key, value)
        }

        const [res, sharp] = await Promise.allSettled([
            this.koreanbots.api<WidgetQuery>({ global: true }).widget(this.target)(this.type)(this.id)({
                [KoreanbotsInternal]: {
                    query,
                    bodyResolver: <T>(res: Response) => res.buffer() as unknown as T
                }
            }),
            options?.format !== "svg" ? import("sharp") : false
        ])

        if (sharp.status === "rejected") throw new Error(sharp.reason)

        if (typeof sharp.value !== "boolean" && res.status === "fulfilled") {
            const sh = (await sharp.value).default
            const response = res.value.data
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const buffer = res.status === "fulfilled" && response!

            if (!response || !buffer) throw new Error("위젯에서 Buffer 데이터를 읽을 수 없습니다.")

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

        const result = res.status === "fulfilled" && res.value

        if (!result) throw new Error

        return result
    }
}