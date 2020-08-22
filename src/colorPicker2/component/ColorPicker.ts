import { PickUpArea } from './PickUpArea'
import { HueArea } from './HueArea'
import { InputArea } from './InputArea'
import { AlphaArea } from './AlphaArea'
import { PreviewArea } from './PreviewArea'
import { PresetColorArea } from './PresetColor'
import { FormatColor } from './FormatColor'
import { Color, ColorInterface } from '../color'
import { addClass, registerEvent } from '@/util/index'

export class ColorPicker {
    public pickUpArea: PickUpArea | null = null
    public hueArea: HueArea | null = null
    public inputArea1: InputArea | null = null
    public inputArea2: InputArea | null = null
    public inputArea3: InputArea | null = null
    public alphaArea: AlphaArea | null = null
    public presetColorArea: PresetColorArea | null = null
    public formatColorArea: FormatColor | null = null
    public previewArea: PreviewArea | null = null

    public node: HTMLElement
    public color: Color = new Color()
    public pickers: ColorPicker[] = []
    public topic: string = 'picker'
    public colorMode: 'HSL' | 'HSV'
    public isFirstRender: boolean = true
    public hex2rgbMethodName: string = ''
    public rgb2hexMethodName: string = ''
    public activeColorChange: (color: string) => void = () => {}
    public defaultColor: Color | null = null
    public currentPreDefineColor: HTMLElement | null = null

    constructor(
        { node, colorMode, activeColorChange }: { node: HTMLElement, colorMode: 'HSL' | 'HSV', activeColorChange?: (color: string) => void }
    ) {
        this.node = node
        this.colorMode = colorMode
        if (activeColorChange) this.activeColorChange = activeColorChange
    }

    public init() {
        const color: Color = new Color().setHSL(0, 51, 51, this.color.alpha)
        this.createDom()
        this.setColor(color)
        this.presetColorClickUpdate()
        registerEvent(this.pickUpArea!.picking_area!, this.mousemoveUpdateColor.bind(this))
        this.hex2rgbMethodName = this.color.colorMode.toLocaleLowerCase() + '2rgb'
        this.rgb2hexMethodName = 'rgb2' + this.color.colorMode.toLocaleLowerCase()
        this.defaultColor = color
    }

    public createDom() {
        this.color.setFormat(this.colorMode)

        const colorPickerTopContainer: HTMLDivElement = this.createElement('color-picker__top')
        const container: HTMLDivElement = this.createElement('color-picker-right__container')
        const inputTopContainer: HTMLDivElement = this.createElement('color-picker-input__container')
        const inputBottomContainer: HTMLDivElement = this.createElement('color-picker-input__container')
        const inputBottomContainer2: HTMLDivElement = this.createElement('color-picker-input__container')
        const colorPickerBottomContainer: HTMLDivElement = this.createElement('color-picker__bottom')

        this.pickUpArea = new PickUpArea(colorPickerTopContainer, this.color)

        this.hueArea = new HueArea(container, this.color)
        registerEvent(this.hueArea.hue!, this.moveHueSliderUpdate.bind(this))

        this.inputArea1 = new InputArea(inputTopContainer)
        this.inputArea2 = new InputArea(inputBottomContainer)
        this.inputArea3 = new InputArea(inputBottomContainer2)

        this.inputArea1.createInputArea('H', 'hue', this.hueChange.bind(this))
        this.inputArea1.createInputArea('S', 'saturation', this.satChange.bind(this))

        if (this.colorMode === 'HSL') this.inputArea1.createInputArea('L', 'light', this.lightChange.bind(this))
        if (this.colorMode === 'HSV') this.inputArea1.createInputArea('V', 'value', this.valueChange.bind(this))

        container.appendChild(inputTopContainer)

        this.alphaArea = new AlphaArea(colorPickerBottomContainer, this.color)
        registerEvent(this.alphaArea.alphaMask!, this.moveAlphaSliderUpdate.bind(this))

        this.presetColorArea = new PresetColorArea(colorPickerBottomContainer)
        this.formatColorArea = new FormatColor(colorPickerBottomContainer, this.activeColorChange)

        this.formatColorArea!.cancel!.addEventListener('click', () => this.setColor(this.defaultColor!))
        this.formatColorArea.confirm!.addEventListener(
            'click', 
            () => this.formatColorArea!.observer.trigger('executeCallback', this.color.formatColor())
        )

        this.inputArea2.createInputArea('R', 'red', this.redChange.bind(this))
        this.inputArea2.createInputArea('G', 'green', this.greenChange.bind(this))
        this.inputArea2.createInputArea('B', 'blue', this.blueChange.bind(this))

        container.appendChild(inputBottomContainer)

        const view: HTMLDivElement = this.createElement('color-picker-view__container')
        this.previewArea = new PreviewArea(view, this.color)

        this.inputArea3.createInputArea('Alpha', 'alpha', this.alphaChange.bind(this))
        this.inputArea3.createInputArea('Hex', 'hex', this.hexChange.bind(this))

        view.appendChild(inputBottomContainer2)
        container.appendChild(view)

        colorPickerTopContainer.appendChild(container)
        
        this.node.appendChild(colorPickerTopContainer)
        this.node.appendChild(colorPickerBottomContainer)
    }

    public mousemoveUpdateColor(e: MouseEvent) {
        this.removeBoxShadow()
        this.pickUpArea!.updateColor(e) // = 鼠标移动时更新拾色区域颜色
        this.updateAlphaAndPreviewArea()   // & 更新拾色区域和显示颜色区域
        
        // ? 更新输入框(H, S, L and R, G, B and hex)
        this.updateAllInput()
    }

    public createElement(className: string) {
        const container: HTMLDivElement = document.createElement('div')
        addClass(container, className)
        return container
    }

    public moveHueSliderUpdate(e: MouseEvent) {
        this.removeBoxShadow()
        const hue: number = this.hueArea!.moveHueSliderUpdate(e)    // % 得出滑块当前位置的色相
        this.color.setHue(hue) // $ 色相滑块更新只需设置色相即可
        this.pickUpArea!.updatePickerBackground()   // * 色相内的滑块拖动时更新拾色区域背景颜色
        this.updateAlphaAndPreviewArea()    // & 更新拾色区域和显示颜色区域
        this.updateAllInput()  // ? 更新所有输入框的value值
        this.updateCopyArea()
    }

    public moveAlphaSliderUpdate(e: MouseEvent) {
        this.removeBoxShadow()
        this.alphaArea!.updateAlphaSlider(e)    // & 更新透明度区域
        this.inputArea3!.observer.trigger('alpha', this.color.alpha)    // $ 同步更新Alpha区域
        this.previewArea!.updatePreviewColor()  // # 更新显示颜色区域
        this.updateCopyArea()
    }

    public updateAlphaAndPreviewArea() {
        this.removeBoxShadow()
        this.alphaArea!.updateAlphaGradient()   // - 更新透明度颜色
        this.previewArea!.updatePreviewColor()  // % 更新显示颜色区域
    }

    public setColor(color: Color) {
        if (color.colorMode !== this.colorMode) {
            color.setFormat(this.colorMode)
			;(color as any)['rgb2' + color.colorMode.toLocaleLowerCase()]()
        }

        this.color.copy(color)

        this.updateCopyArea()
        this.pickUpArea!.updatePickerPosition()
        this.pickUpArea!.updatePickerBackground()
        this.hueArea!.updateHueSliderPosition()
		this.alphaArea!.initAlphaSliderPosition()
		this.alphaArea!.updateAlphaGradient()
        this.previewArea!.updatePreviewColor()

        this.updateAllInput()
    }

    public updateCopyArea() {
        const { format } = this.color
        this.color.format = 'RGB'
        this.formatColorArea!.observer.trigger('update', this.color.formatColor())
        this.color.format = format
    }

    public updateAllInput() {
        if (this.isFirstRender) {
            this.isFirstRender = false
            this.color.alpha = +this.color.alpha + ''
        }
        this.removeBoxShadow()
        this.inputArea1!.triggerInputUpdate(this.color)
        this.inputArea2!.triggerInputUpdate(this.color)
        this.inputArea3!.triggerInputUpdate(this.color)
    }

    public presetColorClickUpdate() {
        const presetContainer: HTMLDivElement = this.presetColorArea!.presetColorContainer!.lastElementChild as HTMLDivElement
        const children: HTMLDivElement[] = Array.from(presetContainer.children) as HTMLDivElement[]
        const createInstanceColor: (color: Color) => Color = this.getInstanceColor()
        const regExp: RegExp = /^rgb\((\d+), (\d+), (\d+)\)$/
        let previousElement: HTMLElement
        presetContainer.addEventListener('click', (e: Event) => {
            const target: HTMLDivElement = e.target as HTMLDivElement
            if (!children.includes(target)) return
            const { backgroundColor } = window.getComputedStyle(target, null)
            if (backgroundColor) {
                const match: RegExpMatchArray | null = backgroundColor.match(regExp)
                if (match) {
                    const c: Color = new Color()
                    c.setRGBA(+match[1], +match[2], +match[3], this.color.alpha)
                    this.setColor(c)

                    const color: Color = createInstanceColor(this.color)
                    const { hue, sat, light, alpha } = color
                    const { r, g, b } = color

                    color.setHSL(hue, sat, light, alpha)

                    if (previousElement) previousElement.style.removeProperty('box-shadow')
                    target.style.boxShadow = `0 0 3px 2px rgb(${ r }, ${ g }, ${ b })`
                    this.currentPreDefineColor = target
                }
            }
            previousElement = target
        })
    }

    public getInstanceColor() {
        let result: Color = new Color()
        return (color: Color) => result.copy(color)
    }

    public hueChange(e: Event) {
        this.inputValueChange(e, 'hue', this.hex2rgbMethodName)
    }

    public satChange(e: Event) {
        this.inputValueChange(e, 'sat', this.hex2rgbMethodName)
    }

    public lightChange(e: Event) {
        this.inputValueChange(e, 'light', this.hex2rgbMethodName)
    }

    public valueChange(e: Event) {
        this.inputValueChange(e, 'value', this.hex2rgbMethodName)
    }

    public redChange(e: Event) {
        this.inputValueChange(e, 'r', this.rgb2hexMethodName)
    }

    public greenChange(e: Event) {
        this.inputValueChange(e, 'g', this.rgb2hexMethodName)
    }

    public blueChange(e: Event) {
        this.inputValueChange(e, 'b', this.rgb2hexMethodName)
    }

    public inputValueChange(e: Event, attr: keyof ColorInterface, methodName: string) {
        const v: number = +(e.target! as any).value
        ;(e.target! as any).value = this.color[attr]
        switch (attr) {
            case 'hue':
                if (this.isColorBoundaryValue(v, 360)) return
                break
            case 'sat':
            case 'light':
            case 'value':
                if (this.isColorBoundaryValue(v, 100)) return
                break
            case 'r':
            case 'g':
            case 'b':
                if (this.isColorBoundaryValue(v, 255)) return
                break
        }
        (this.color as any)[attr] = v
        ;(this.color as any)[methodName]()
        this.setColor(this.color)
    }

    public isColorBoundaryValue(value: number, maxValue: number) {
        return value < 0 || value > maxValue
    }

    public alphaChange(e: Event) {
        let value = Math.max(Math.min(+(e.target! as any).value, 1), 0)

        if (typeof value !== 'number' || isNaN(value)) return

        (e.target! as any).value = value.toFixed(2)
        this.color.alpha = value.toFixed(2)

        this.alphaArea!.inputChangeUpdateAlphaSlider(value)
        this.updateAlphaAndPreviewArea()

        this.updateCopyArea()
    }

    public hexChange(e: Event) {
		this.color.setHex((e.target! as any).value)
		this.setColor(this.color)
    }

    public removeBoxShadow() {
        if (this.currentPreDefineColor) {
            this.currentPreDefineColor.style.removeProperty('box-shadow')
        }
    }
}