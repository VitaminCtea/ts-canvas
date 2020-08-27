import { addClass } from '@/util/index'
import { Color } from '../color'
import { Observer } from '../Observer'

export class PresetColorArea {
    public node: HTMLDivElement
    public presetColorContainer: HTMLDivElement | null = null
    public color: Color = new Color()
    public observer: Observer = new Observer()

    public constructor(node: HTMLDivElement) {
        this.node = node
        this.init()
    }

    public init() {
        this.createDom()
    }

    public createDom() {
        const container: HTMLDivElement = this.createElement('preset-color__container')
        const content: HTMLDivElement = this.createElement('preset-color__content')
        const title: HTMLSpanElement = this.createElement('preset-color__title')
        const fragment: DocumentFragment = document.createDocumentFragment()

        title.textContent = '预设颜色: '
        this.presetColorContainer = container

        for (let i: number = 0; i < 14; i++) {
            const color: HTMLDivElement = this.createElement('color')
            this.initPresetBackgroundColor(color, i)
            fragment.appendChild(color)
        }

        content.appendChild(fragment)
        container.appendChild(title)
        container.appendChild(content)
        this.node.appendChild(container)
    }

    public createElement(className: string) {
        const el: HTMLDivElement = document.createElement('div')
        addClass(el, className)
        return el
    }

    public initPresetBackgroundColor(colorEl: HTMLDivElement, index: number) {
        const color: Color = new Color()
        color.setHSL(0, 50, 70, this.color.alpha)
        color.setHue(index * 25 % 360)
        const { r, g, b } = color
        colorEl.style.backgroundColor = `rgb(${ r }, ${ g }, ${ b })`
    }
}