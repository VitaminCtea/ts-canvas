import { addClass, getElementTotalWidth, initCurrentSliderPosition, updateSliderPosition } from "@/util/index"
import { Color } from "../color"

export class HueArea {
    public node: HTMLElement
    public hue: HTMLDivElement | null = null
    public slider: HTMLDivElement | null = null
    public color: Color

    public constructor(node: HTMLElement, color: Color) {
        this.node = node
        this.color = color
        this.init()
    }

    public init() {
        const hue: HTMLDivElement = document.createElement('div')
        const slider: HTMLDivElement = document.createElement('div')

        addClass(hue, 'hue')
        addClass(slider, 'slider')

        this.hue = hue
        this.slider = slider

        hue.appendChild(slider)
        this.node.appendChild(hue)
    }

    public moveHueSliderUpdate(e: MouseEvent) {
        const { left, width } = this.hue!.getBoundingClientRect()
        const x: number = Math.max(Math.min(e.clientX - left, width), 0)
        const hue: number = (360 * x / width) | 0
        updateSliderPosition(this.slider!, x)
        return hue
    }
    public updateHueSliderPosition() {
        const { width } = this.hue!.getBoundingClientRect()
        const offset: number = getElementTotalWidth(this.slider!)
        const x: number = (this.color.hue * width / 360) | 0
        this.slider!.style.left = `${ x - offset }px`
    }
}