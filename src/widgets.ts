import { Cache } from "./utils/cache"
import * as Utils from "./utils"
import fetch from "node-fetch"
import { WidgetsOptions, Formats, WidgetType } from "../typings"

export class Widgets {
    public options: WidgetsOptions
    public cache: Cache
    public allowedFormats: Formats[]

    /**
     * 
     * @param {WidgetsOptions} [options] - WIdgets의 옵션
     */
    constructor(options: WidgetsOptions) {
        /**
         * Widgets의 옵션
         * @type {WidgetsOptions} 
         */
        this.options = options
        this.options.apiVersion = options.apiVersion ?? 2
        this.options.cacheTTL = options.cacheTTL ?? 60000 * 60

        /**
         * 위젯 버퍼(Buffer) 캐시
         * @type {Cache}
         */
        this.cache = new Cache(this.options.cacheTTL)

        /**
         * 허용된 위젯 확장자
         * @type {Formats}
         */
        this.allowedFormats = ["jpeg", "png", "webp", "svg"]
    }

    /**
     * Koreanbots의 위젯을 불러옵니다.
     * @param {WidgetType} type - 위젯 종류 
     * @param {string} id - 위젯 ID 
     * @param {Formats} format - 위젯 확장자 
     * @private
     */
    private async mkWidget(type: WidgetType, id: string, format: Formats): Promise<Buffer> {
        if (!this.allowedFormats.includes(format)) throw new Error(`[koreanbots/Wtdgets#mkWidget] 해당 포맷은 지원되지 않습니다. 지원되는 포맷: ${this.allowedFormats.join(", ")}`)
        if (this.cache.get(`${id}/${format}`)) return this.cache.get(`${id}/${format}`)

        // @ts-expect-error ignore 
        const genURL = this[`get${type}WidgetURL`].bind(this) as (id: string) => string
        const res = await fetch(genURL(id)).then(r => r.buffer())

        let widget: Buffer
        if (format === "svg") widget = res
        else {
            const sharp = (await import("sharp")).default
            widget = await sharp(res)[format]().toBuffer() //eslint-disable-line no-redeclare
        }

        this.cache.set(`${id}/${format}`, widget)

        return widget
    }

    /**
     * 하트 수 위젯 URL을 얻습니다.
     * @param {string} id - 위젯 ID 
     * @example
     * console.log(widgets.getVoteWidgetURL("387548561816027138"))
     */
    getVoteWidgetURL(id: string): string {
        return `${Utils.getAPI(this.options.apiVersion)}/widget/bots/votes/${id}.svg`
    }

    /**
     * 하트 수 위젯을 불러옵니다.
     * @param {string} id - 위젯 ID 
     * @param {Formats} [format="png"] - 위젯 확장자
     * @example
     * widgets.getVoteWidget("387548561816027138")
     *     .then(buffer => require("fs").writeFileSync(`${__dirname}/widget.png`, buffer))
     *     .catch(console.error)
     */
    async getVoteWidget(id: string, format: Formats = "png"): Promise<Buffer> {
        return this.mkWidget("Vote", id, format)
    }

    /**
     * 서버 수 위젯 URL을 얻습니다.
     * @param {string} id - 위젯 ID
     * @example
     * console.log(widgets.getServerWidgetURL("387548561816027138"))
    */
    getServerWidgetURL(id: string): string {
        return `${Utils.getAPI(this.options.apiVersion)}/widget/bots/servers/${id}.svg`
    }

    /**
     * 서버 수 위젯을 불러옵니다.
     * @param {string} id - 위젯 ID
     * @param {Formats} [format="png"] - 위젯 확장자
     * @example
     * widgets.getServerWidget("387548561816027138")
     *     .then(buffer => require("fs").writeFileSync(`${__dirname}/widget.png`, buffer))
     *     .catch(console.error)
    */
    async getServerWidget(id: string, format: Formats = "png"): Promise<Buffer> {
        return this.mkWidget("Server", id, format)
    }

    /**
     * 모든 위젯을 불러옵니다.
     * @param {string} id - 위젯 ID
     * @param {Record<string, Formats>|Formats} format - 위젯 확장자
     * @example
     * const formats = { server: "jpeg", vote: "png" }
     * widgets.getAllWidgets("387548561816027138", formats)
     *     .then(obj => {
     *         const fs = require("fs")
     *         for (const name in obj) fs.writeFileSync(`${__dirname}/${name}.${formats[name]}`, obj[name])
     *     }).catch(console.error)
     */
    async getAllWidgets(id: string, format: (Formats | Record<string, Formats>) = "png"): Promise<Record<string, Buffer>> {
        const widgets: Record<string, Buffer> = {
            server: Buffer.from("null"),
            vote: Buffer.from("null")
        }

        if (typeof format === "object") {
            const { server = "png", vote = "png" } = format

            await Promise.all([
                this.getServerWidget(id, server),
                this.getVoteWidget(id, vote)
            ]).then((a, i) => {
                if(!i) widgets["server"] = a
                else widgets["vote"] = a
            })
        } else if (typeof format === "string") {
            const func = await Promise.all([this.getServerWidget, this.getVoteWidget].map(e => e.bind(this)(id, format)))

            const arr: string[] = ["server", "vote"]

            for (let i = 0; i < func.length; i++) widgets[arr[i]] = func[i]
        } else throw new TypeError("[koreanbots/Widgets#getAllWidgets] 위젯 포맷 설정에는 \"string\"과 \"object\" 데이터 타입만 지원됩니다.")

        return widgets
    }
}
