import { addClass, initCurrentSliderPosition, updateSliderPosition, getElementTotalWidth } from "@/util/index"
import { Color } from "../color"

export class AlphaArea {
    public node: HTMLElement
    public alpha: HTMLDivElement | null = null
    public alphaMask: HTMLDivElement | null = null
    public slider: HTMLDivElement | null = null
    public color: Color

    constructor(node: HTMLElement, color: Color) {
        this.node = node
        this.color = color
        this.init()
    }
    
    public init() {
        const alpha: HTMLDivElement = document.createElement('div')
        const alphaMask: HTMLDivElement = document.createElement('div')
        const slider: HTMLDivElement = document.createElement('div')

        addClass(alpha, 'alpha')
        addClass(alphaMask, 'alpha-mask')
        addClass(slider, 'slider')

        this.alpha = alpha
        this.alphaMask = alphaMask
        this.slider = slider

        alphaMask.appendChild(slider)
        alpha.appendChild(alphaMask)
        this.node.appendChild(alpha)
    }

    public initAlphaSliderPosition() {
        initCurrentSliderPosition(this.alpha!, this.slider!, size => (+this.color.alpha * size) | 0)
    }

    public getDistance() {
        const { width, left } = this.alpha!.getBoundingClientRect()
        return {
            width,
            left,
            distance: width - getElementTotalWidth(this.slider!)
        }
    }

    public updateAlphaSlider(e: MouseEvent) {
        const { distance, left, width } = this.getDistance()
        const x: number = Math.max(Math.min(e.clientX - left, width), 0)
        updateSliderPosition(this.slider!, x)
        const alphaPercent: number = x / distance
        this.color.alpha = +alphaPercent >= 1 ? '1' : +alphaPercent <= 0 ? '0' : alphaPercent.toFixed(2)
    }

    public inputChangeUpdateAlphaSlider(value: number) {
        updateSliderPosition(this.slider!, this.getDistance().distance * value)
    }

    public updateAlphaGradient() {
        const { r, g, b } = this.color
        this.alphaMask!.style.backgroundImage = `linear-gradient(to right, rgba(${ r }, ${ g }, ${ b }, 0), rgb(${ r }, ${ g }, ${ b }))`
    }
}