import { Base } from "./Base"

import type { Koreanbots } from "../client/Koreanbots"
import type {
    WidgetOptions, 
    WidgetTarget, 
    WidgetType,
    WidgetData
} from "../utils/types"

export class Widget extends Base {
    public buffer: Buffer

    public readonly target: WidgetTarget
    public readonly type: WidgetType
    public readonly id: string

    constructor(public readonly koreanbots: Koreanbots, buffer: Buffer, data: WidgetData) {
        super()

        this.buffer = buffer

        this.target = data.target
        this.type = data.type
        this.id = data.id
    }

    fetch(options: WidgetOptions = { format: "svg" }): Promise<Widget> {
        return this.koreanbots.widgets._fetch({
            ...options,
            target: this.target,
            type: this.type,
            id: this.id
        })
    }
}
