const toHex = (r: number, g: number, b: number): string => {
    const INT_HEX_MAP: { [ key: number ]: string } = { 10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F' }
    const hexOne = (value: number): string => {
        value = Math.min(Math.round(value), 255)
        const high: number = value / 16 | 0
        const low: number = value % 16
        return '' + (INT_HEX_MAP[high] || high) + (INT_HEX_MAP[low] || low)
    }
    if (isNaN(r) || isNaN(g) || isNaN(b)) return ''
    return '#' + hexOne(r) + hexOne(g) + hexOne(b)
}

const parseHexChannel = function(hex: string) {
    const HEX_INT_MAP: { [ key: string ]: number } = { A: 10, B: 11, C: 12, D: 13, E: 14, F: 15 }
    if (hex.length === 2) return (HEX_INT_MAP[hex[0].toUpperCase()] || +hex[0]) * 16 + (HEX_INT_MAP[hex[1].toUpperCase()] || +hex[1])
    return HEX_INT_MAP[hex[1].toUpperCase()] || +hex[1]
  }

type BaseColor = { h: number, s: number }
type HSLColor = BaseColor & { l: number }
type HSVColor = BaseColor & { v: number}
type RGBColor = { r: number, g: number, b: number }

// = 参考链接: https://en.wikipedia.org/wiki/HSL_and_HSV#Color_conversion_formulae
const rgb2hsl = (r: number, g: number, b: number): HSLColor => {

    r = r / 255
    g = g / 255
    b = b / 255

    const colorMax: number = Math.max(r, g, b)
    const colorMin: number = Math.min(r, g, b)
    const delta: number = colorMax - colorMin

    let h: any
    let s: number = colorMax === 0 ? 0 : delta / colorMax
    let l: any = (colorMax + colorMin) / 2

    if (colorMax === colorMin) {
        h = 0
    } else {
        switch (colorMax) {
            case r: h = (g - b) / delta + (g < b ? 6 : 0); break
            case g: h = (b - r) / delta + 2; break
            case b: h = (r - g) / delta + 4; break
        }
        h /= 6
    }

    if (l === 0 || l === 1) s = 0
    else s = (colorMax - l) / Math.min(l, 1 - l)

    h = h * 360 | 0
    s = s * 100 | 0
    l = l * 100 | 0

    return {
        h,
        s,
        l
    }
}

const rgb2hsv = (r: number, g: number, b: number): HSVColor => {
    
    r = r / 255
    g = g / 255
    b = b / 255

    const colorMax: number = Math.max(r, g, b)
    const colorMin: number = Math.min(r, g, b)
    const delta: number = colorMax - colorMin

    let h: any
    let s: number = colorMax === 0 ? 0 : delta / colorMax
    let v: any = colorMax

    if (colorMax === colorMin) {
        h = 0
    } else {
        switch (colorMax) {
            case r: h = (g - b) / delta + (g < b ? 6 : 0); break
            case g: h = (b - r) / delta + 2; break
            case b: h = (r - g) / delta + 4; break
        }
        h /= 6
    }

    if (colorMax === 0) {
        s = 0
    } else {
        s = delta / colorMax
    }

    h = h * 360 | 0
    s = s * 100 | 0
    v = v * 100 | 0

    return {
        h,
        s,
        v
    }
}

const hsl2hsv = (hue: number, sat: number, light: number): HSVColor => {
    sat /= 100
    light /= 100

    let v: number = light + sat * Math.min(light, 1 - light)
    let sv: number

    if (v == 0) sv = 0
    else sv = 2 * (1 - light / v)

    sv = sv * 100 | 0
    v = v * 100 | 0

    return {
        h: hue,
        s: sv,
        v
    }
}

const hsv2hsl = (hue: number, sat: number, val: number): HSLColor => {
    sat /= 100
    val /= 100

    let h: number = hue
    let s: number
    let l: number = val * (1 - sat / 2)

    if (l === 0 || l === 1) s = 0
    else s = (val - l) / Math.min(l, 1 - l)

    s = s * 100 | 0
    l = l * 100 | 0
    
    return {
        h,
        s,
        l
    }
}

const createRGB = (h: number, vC: number, vM: number): RGBColor => {
    const X: number = vC * (1 - Math.abs(h % 2 - 1))
    let rgb: number[] = []

    switch (true) {
        case h === undefined: rgb = [ 0, 0, 0 ]; break
        case h >= 0 && h <= 1: rgb = [ vC, X, 0 ]; break
        case h >= 1 && h <= 2: rgb = [ X, vC, 0 ]; break
        case h >= 2 && h <= 3: rgb = [ 0, vC, X ]; break
        case h >= 3 && h <= 4: rgb = [ 0, X, vC ]; break
        case h >= 4 && h <= 5: rgb = [ X, 0, vC ]; break
        case h >= 5 && h <= 6: rgb = [ vC, 0, X ]; break
    }

    let [ r, g, b ] = rgb

    r = (r + vM) * 255 | 0
    g = (g + vM) * 255 | 0
    b = (b + vM) * 255 | 0

    return {
        r,
        g,
        b
    }
}

const hsl2rgb = (h: number, s: number, l: number): RGBColor => {

    s /= 100
    l /= 100

    const C: number = (1 - Math.abs(2 * l - 1)) * s
    return createRGB(h / 60, C, l - C / 2)
}

const hsv2rgb = (h: number, s: number, v: number): RGBColor => {

    s /= 100
    v /= 100

    const C: number = v * s
    return createRGB(h / 60, C, v - C)
}

export type ColorInterface = {
    r: number
    g: number
    b: number
    alpha: string
    hue: number
    sat: number
    light: number
    value: number
    colorMode: 'HSV' | 'HSL'
}

const isValidValue = (value: number) => typeof +value === 'number' && Number.isSafeInteger(+value)
const isValidRGBValue = (value: string) => isValidValue(+value) && (+value >= 0 && +value <= 255)

export class Color implements ColorInterface {
    public r: number = 0
    public g: number = 0
    public b: number = 0
    public alpha: string = '1'
    public hue: number = 0
    public sat: number = 0
    public light: number = 0
    public value: number = 0
    public colorMode: 'HSV' | 'HSL' = 'HSL'
    public formatValue: string = ''
    public enableAlpha: boolean = true
    public format: 'RGB' | 'HSL' | 'HEX' | 'HSV' = 'HEX'

    public setHex(value: string) {
        value = value.replace('#', '').trim()

        if (/^(?:#?[0-9a-fA-F]{3}){1, 2}$/.test(value)) return

        switch (value.length) {
            case 3:
                this.r = parseHexChannel(value[0] + value[0])
                this.g = parseHexChannel(value[1] + value[1])
                this.b = parseHexChannel(value[2] + value[2])
                break
            case 6:
            case 8:
                this.r = parseHexChannel(value.substring(0, 2))
                this.g = parseHexChannel(value.substring(2, 4))
                this.b = parseHexChannel(value.substring(4, 6))
                break
        }

        switch (value.length) {
            case 3:
            case 6:
                this.alpha = '1'
                break
            case 8:
                this.alpha = Math.floor(parseHexChannel(value.substring(6)) / 255 * 100) + ''
                break
        }

        const { h, s, v } = rgb2hsv(this.r, this.g, this.b)

        this.hue = h
        this.sat = s
        this.value = v
    }

    public getHex() {
        return toHex(this.r, this.g, this.b)
    }

    public formatColor() {
        const { hue, sat, light, value, alpha, format, r, g, b } = this
        if (this.enableAlpha) {
            switch (format) {
                case 'HSL':
                    this.formatValue = `hsla(${ hue }, ${ sat }%, ${ light }%, ${ +alpha })`
                    break
                case 'HSV':
                    this.formatValue = `hsva(${ hue }, ${ sat }%, ${ value }%, ${ +alpha })`
                    break
                default:
                    this.formatValue = `rgba(${ r }, ${ g }, ${ b }, ${ +alpha })`
            }
        } else {
            switch (format) {
                case 'HSL':
                    this.formatValue = `hsl(${ hue }, ${ sat }%, ${ light }%)`
                    break
                case 'HSV':
                    this.formatValue = `hsv(${ hue }, ${ sat }%, ${ value }%)`
                    break
                case 'RGB':
                    this.formatValue = `rgb(${ r }, ${ g }, ${ b })`
                    break
                default:
                    this.formatValue = toHex(r, g, b)
            }
        }
        return this.formatValue
    }

    public getColor() {
        return this.formatColor()
    }

    public hsl2rgb() {
        const { r, g, b } = hsl2rgb(this.hue, this.sat, this.light)
        this.setRGBA(r, g, b, this.alpha)
    }

    public hsv2rgb() {
        const { r, g, b } = hsv2rgb(this.hue, this.sat, this.value)
        this.setRGBA(r, g, b, this.alpha)
    }

    public rgb2hsv() {
        const { h, s, v } = rgb2hsv(this.r, this.g, this.b)
        this.hue = h
        this.sat = s
        this.value = v
    }
    
    public rgb2hsl() {
        const { h, s, l } = rgb2hsl(this.r, this.g, this.b)
        this.hue = h
        this.sat = s
        this.light = l
    }

    public copy(color: Color) {
        Object.keys(color).forEach(key => (this as any)[key] = (color as any)[key])
        return this
    }

    private setColor(v1: number, v2: number, v3: number, v4: string = this.alpha, callback: (v1: number, v2: number, v3: number) => void) {
        if (!([ v1, v2, v3 ].some(isValidValue))) return

        v1 = Math.max(Math.min(v1, 360), 0)
        v2 = Math.max(Math.min(v2, 100), 0)
        v3 = Math.max(Math.min(v3, 100), 0)

        this.hue = v1 | 0
        this.sat = v2 | 0
        callback(v1, v2, v3)
        this.alpha = v4
    }

    public updateColor(v: number, r: number, g: number, b: number, a: string, callback: (v: number) => void) {
        callback(v)
        this.setRGBA(r, g, b, a)
    }

    public setHSL(newH: number, newS: number, newL: number, newA: string) {
        this.setColor(newH, newS, newL, newA, (v1, v2, v3) => {
            const { r, g, b } = hsl2rgb(v1, v2, v3)
            this.updateColor(v3, r, g, b, newA, (v) => this.light = v | 0)
        })
        return this
    }

    public setHSV(newH: number, newS: number, newV: number, newA: string) {
        this.setColor(newH, newS, newV, newA, (v1, v2, v3) => {
            const { r, g, b } = hsv2rgb(v1, v2, v3)
            this.updateColor(v3, r, g, b, newA, (v) => this.value = v | 0)
        })
        return this
    }

    public setRGBA(newR: number, newG: number, newB: number, newA: string) {
        if (isNaN(newR) || isNaN(newG) || isNaN(newB)) return
        this.r = newR | 0
        this.g = newG | 0
        this.b = newB | 0
        if (isValidRGBValue(newA)) this.alpha = ((+newA) | 0) + ''
        return this
    }

    public setHue(hue: number) {
        if (typeof hue !== 'number' || isNaN(hue) || hue < 0 || hue > 360) return
        this.hue = hue
        this.updateRGB()
    }

    public updateRGB() {
        (this as any)[this.colorMode.toLocaleLowerCase() + '2rgb']()
    }

    public setFormat(format: ColorInterface['colorMode']) {
        this.colorMode = format
    }
}
