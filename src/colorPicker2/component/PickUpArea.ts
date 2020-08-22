import { addClass, getBorderWidth, getElementTotalWidth } from '@/util/index'
import { Color } from '../color'

export class PickUpArea {
    public node: HTMLElement
    public picking_area: HTMLDivElement | null = null
    public color_picker: HTMLDivElement | null = null
    public color: Color
    
    public constructor(node: HTMLElement, color: Color) {
        this.node = node
        this.color = color
        this.init()
    }

    public init() {
        const area: HTMLDivElement = document.createElement('div')
        const picker: HTMLDivElement = document.createElement('div')

        addClass(area, 'picking-area')
        addClass(picker, 'picker')

        this.picking_area = area
        this.color_picker = picker

        area.appendChild(picker)
        this.node.appendChild(area)
    }

    public updateColor(e: MouseEvent) {
        const { width, height, left, top } = this.picking_area!.getBoundingClientRect()

        const offset: number = getElementTotalWidth(this.color_picker!)
        const minX: number = Math.min(e.clientX - left, width)
        const minY: number = Math.min(e.clientY - top, height)
        
        let x: number = Math.max(minX, 0)
        let y: number = Math.max(minY, 0)

        const value = (100 - (y * 100) / height) | 0
        const saturation = ((x * 100) / width) | 0
        const { hue, alpha } = this.color

		if (this.color.colorMode === 'HSV') this.color.setHSV(hue, saturation, value, alpha)
        if (this.color.colorMode === 'HSL') this.color.setHSL(hue, saturation, value, alpha)

        x = Math.max(minX, offset >> 1)
        y = Math.max(minY, offset >> 1)
        
        this.color_picker!.style.left = `${ x - offset }px`
        this.color_picker!.style.top = `${ y - offset }px`
    }

    public updatePickerPosition() {
        const { width, height } = this.picking_area!.getBoundingClientRect()
        const borderWidth: number = getBorderWidth(this.color_picker!)
        const offset = (this.color_picker!.clientWidth >> 1) + (borderWidth << 1)

		let value = 0
        
		if (this.color.colorMode === 'HSV') value = this.color.value
        if (this.color.colorMode === 'HSL') value = this.color.light

        if (this.color.sat < 0 || this.color.sat > 100 || value < 0 || value > 100) return
        
		let x = ((this.color.sat * width) / 100) | 0
        let y = (height - (value * height) / 100) | 0
        
		this.color_picker!.style.left = x - offset + 'px'
        this.color_picker!.style.top = y - offset + 'px'
    }

    public updatePickerBackground() {
        const color: Color = new Color()
        color.copy(this.color)
        color.setHSV(color.hue, 100, 100, this.color.alpha)
        this.picking_area!.style.backgroundColor = color.getHex()
    }
}