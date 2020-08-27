import { addClass } from "@/util/index"
import { Color } from "../color"

export class PreviewArea {
    public node: HTMLElement
    public previewColor: HTMLDivElement | null = null
    public color: Color

    constructor(node: HTMLElement, color: Color) {
        this.node = node
        this.color = color
        this.init()
    }

    public init() {
        const preview: HTMLDivElement = document.createElement('div')
        const previewColor: HTMLDivElement = document.createElement('div')

        addClass(preview, 'preview')
        addClass(previewColor, 'preview-color')

        this.previewColor = previewColor

        preview.appendChild(previewColor)
        this.node.appendChild(preview)
    }

    public updatePreviewColor() {
        const { r, g, b, alpha } = this.color
        this.previewColor!.style.backgroundColor = `rgba(${ r }, ${ g }, ${ b }, ${ alpha })`
    }
}