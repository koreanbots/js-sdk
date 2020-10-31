import Cache from "./utils/cache"
import fetch from "node-fetch"
import { WidgetsOptions, Formats, WidgetType } from "./structures"

class Widgets {
    public options: WidgetsOptions
    public cache: Cache
    public allowedFormats: Formats[]

    constructor(options: WidgetsOptions) {
        this.options = options
        this.options.apiVersion = options.apiVersion ?? 2
        this.options.cacheTTL = options.cacheTTL ?? 60000 * 60

        this.cache = new Cache(this.options.cacheTTL)

        this.allowedFormats = ["jpeg", "png", "webp", "svg"] 
    }

    private async mkWidget(type: WidgetType, id: string, format: Formats): Promise<Buffer> {
        if (!this.allowedFormats.includes(format)) throw new Error(`[koreanbots/Wtdgets#mkWidget] 해당 포맷은 지원되지 않습니다. 지원되는 포맷: ${this.allowedFormats.join(", ")}`)
        if (this.cache.get(`${id}/${format}`)) return this.cache.get(`${id}/${format}`)

        // @ts-ignore
        const genURL = this[`get${type}WidgetURL`].bind(this) as (id: string) => string 
        const res = await fetch(genURL(id)).then(r => r.buffer())

        let widget: Buffer
        if (format === "svg") widget = res
        else {
            const sharp = (await import("sharp")).default || await import("sharp")
            widget = await sharp(res)[format]().toBuffer() //eslint-disable-line no-redeclare
        }

        this.cache.set(`${id}/${format}`, widget)

        return widget
    }

    getVoteWidgetURL(id: string): string {
        return `https://api.koreanbots.dev/v${this.options.apiVersion}/widget/bots/votes/${id}.svg`
    }

    async getVoteWidget(id: string, format: Formats = "png"): Promise<Buffer> {
        return this.mkWidget("Vote", id, format)
    }

    getServerWidgetURL(id: string): string {
        return `https://api.koreanbots.dev/v${this.options.apiVersion}/widget/bots/servers/${id}.svg`
    }

    async getServerWidget(id: string, format: Formats = "png"): Promise<Buffer> {
        return this.mkWidget("Server", id, format)
    }
}

export default Widgets