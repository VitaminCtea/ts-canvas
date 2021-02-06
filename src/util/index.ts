type ClassFunc = (el: HTMLElement, className: string) => boolean | void

const trim = (classNames: string[]) => classNames.join(' ').replace(/^\s+|\s+$/, '')

const isEqualString = (str1: string, str2: string): boolean => {
    if (str1.length !== str2.length) return false
    for (let i: number = 0; i < str1.length; i++) {
        if (str1.charAt(i) !== str2.charAt(i)) return false
    }
    return true
}

export const hasClass: ClassFunc = (el, className) => new RegExp('(^|\\s*?)' + className + '(\\s*?|$)').test(el.className)

export const addClass: ClassFunc = (el, className) => {
    if (hasClass(el, className)) return
    const classNames: string[] = el.className.split(' ')
    classNames.push(className)
    el.className = trim(classNames)
}

export const removeClass: ClassFunc = (el, className) => {
    if (!hasClass(el, className)) return
    const classNames: string[] = el.className.split(' ')
    for (let i: number = 0; i < classNames.length; i++) {
        if (isEqualString(classNames[i], className)) {
            classNames.splice(i, 1)
            break
        }
    }
    if (!classNames.length) el.removeAttribute('class')
    else el.className = trim(classNames)
}

export const registerEvent = (el: HTMLElement, callback: (e: MouseEvent) => void) => {
    el.addEventListener('mousedown', (e: MouseEvent) => {
        callback(e)
        document.addEventListener('mousemove', callback)
    })

    document.addEventListener('mouseup', function (e) {
        document.removeEventListener('mousemove', callback)
    })
}

export const initCurrentSliderPosition = (bar: HTMLDivElement, slider: HTMLDivElement, calcPosition: (size: number) => number) => 
    slider.style.left = `${ calcPosition(bar.clientWidth) - 1 }px`

export const removeCSSUnit = (value: string) => {
    const regExp: RegExp = /^(\d+)px$/
    const match: RegExpMatchArray | null = value.match(regExp)
    if (!regExp.test(value) || !match) return 0
    return +match[1]
}

export const getBorderWidth = (el: HTMLDivElement) => {
    const { borderWidth } = window.getComputedStyle(el, null)
    return removeCSSUnit(borderWidth)
}

export const getElementTotalWidth = (el: HTMLDivElement) => el.clientWidth + (getBorderWidth(el) << 1)

export const updateSliderPosition = (el: HTMLDivElement, pos: number) => 
    el.style.left = Math.max(pos - getElementTotalWidth(el), -2) + 'px'


export const extend = (origin: any, target: any) => Object.keys(origin).forEach(key => target[key] = origin[key])

export const isObject = (obj: any) => obj && Object.prototype.toString.call(obj) === '[object Object]'

export class Observer {
    public subscribers: { [ PropName: string ]: Function[] } = {}

    public listen(registerName: string, fn: Function) {
        if (!this.subscribers[registerName]) {
            this.subscribers[registerName] = []
        }
        const length: number = this.subscribers[registerName].length
        this.subscribers[registerName][length] = fn
    }

    public trigger(...args: any[]) {
        const key: string = args.shift()
        const fns: Function[] = this.subscribers[key]

        if (!fns || fns.length === 0) return false

        fns.forEach(fn => fn.apply(this, args))
    }

    public remove(key: string, fn: Function) {
        const fns: Function[] = this.subscribers[key]
        if (!fns || fns.length === 0) return false
        if (!fn) {
            fns && (fns.length = 0)
            return
        }
        const index: number = fns.indexOf(fn)
        if (index !== -1) fns.splice(index, 1)
    }
}

export const createElement = (tag: string, className: string) => {
    const el: HTMLElement = document.createElement(tag)
    addClass(el, className)
    return el
}

export const event: { 
    on: Function, 
    off: Function 
} = {
    on: () => {},
    off: () => {}
}

event.on = (function (_this: typeof event) {
    if (!!(document.addEventListener)) {
        return (element: any, eventName: string, handler: Function, useCapture: boolean = false) => {
            if (element && eventName && handler) element.addEventListener(eventName, handler, useCapture)
        }
    } else if (!!((document as any).detachEvent)) {
        return (element: any, eventName: string, handler: Function) => {
            if (element && eventName && handler) (element as any).attachEvent('on' + eventName, handler)
        }
    } else {
        return (element: any, eventName: string, handler: Function) => 
            (element && eventName && handler) && ((element as any)['on' + eventName] = handler)
    }
})(event)

event.off = (function (_this: typeof event) {
    if (!!(document.removeEventListener)) {
        return (element: any, eventName: string, handler: Function) => {
            if (element && eventName && handler) {
                element.removeEventListener(eventName, handler)
            }
        }
    } else if (!!((document as any).detachEvent)) {
        return (element: any, eventName: string, handler: Function) => {
            if (element && eventName && handler) (element as any).detachEvent('on' + eventName, handler)
        }
    } else {
        return (element: any, eventName: string, handler: Function) => (element && eventName && handler) && ((element as any)['on' + eventName] = null)
    }
})(event)

const upper = (attr: keyof CSSStyleDeclaration) => (attr as string).charAt(0).toUpperCase() + (attr as string).substring(1)

export const getVendorPrefix = (element: HTMLElement): string => {
    const ANIMATION: string = 'Animation'
    const vendors: string[] = [ 'webkit', 'ms', 'O' ]
    const style: CSSStyleDeclaration = element.style

    if ([ `webkit${ ANIMATION }`, `Moz${ ANIMATION }` ].every(property => property in style)) return 'Moz'
    return vendors.find(vendor => `${ vendor }${ ANIMATION }` in style) as string
}

const getStyleName = <T extends keyof CSSStyleDeclaration>(element: HTMLElement, styleName: T): T => 
    styleName in element.style ? styleName : getVendorPrefix(element) + upper(styleName) as T

export const createProperty = <T extends keyof CSSStyleDeclaration>(property: T): T => getStyleName(document.body, property)

export const isDifferentElements = (e: MouseEvent) => e.target !== e.currentTarget

const isInViewport = (container: HTMLElement, el: HTMLElement) => {
    const containerBottom = container.scrollTop + container.clientHeight
    return el.scrollTop >= container.scrollTop || el.scrollTop + el.offsetHeight <= containerBottom
}

const getElementStyle = (el: HTMLElement) => window.getComputedStyle(el, null)

const getPadding = (...rest: string[]) => rest.map(padding => removeCSSUnit(padding))

const getTotalOffsetTop = <T extends HTMLElement>(container: T, selectTarget: T) => {
    let totalOffsetParent: number = 0
    let currentSelectOffsetParent: T = selectTarget.offsetParent as T

    while (currentSelectOffsetParent && container !== currentSelectOffsetParent && container.contains(currentSelectOffsetParent)) {
        totalOffsetParent += currentSelectOffsetParent.offsetTop
        currentSelectOffsetParent = currentSelectOffsetParent.offsetParent as T
    }

    return totalOffsetParent
}

// & getBoundingClientRect()方法的兼容函数
export const scrollToView = <T extends HTMLElement>(container: T, selectTarget: T) => {
    if (!selectTarget || !isInViewport(container, selectTarget)) return

    /**
     * = 来自MDN解释: 
     * ? HTMLElement.offsetParent 是一个只读属性，返回一个指向最近的（指包含层级上的最近）包含该元素的定位元素或者最近的table,td,th,body元素。
     * & 当元素的 style.display 设置为 "none" 时，offsetParent 返回 null。
     * $ offsetParent 很有用，因为 offsetTop 和 offsetLeft 都是相对于其内边距边界的。
    */
    let totalOffsetTop: number = getTotalOffsetTop(container, selectTarget)

    const top: number = selectTarget.offsetTop + totalOffsetTop
    const bottom: number = top + selectTarget.offsetHeight

    const { paddingTop, paddingBottom } = getElementStyle(container.firstElementChild as HTMLElement)

    const [ pt, pb ] = getPadding(paddingTop, paddingBottom)

    const containerTop: number = container.scrollTop - pt
    const containerBottom: number = containerTop + container.clientHeight - pb

    if (top < containerTop) container.scrollTop = top - pt
    else if (bottom > containerBottom) container.scrollTop = bottom - (container.clientHeight - pb)
}

export const removeWhiteSpace = (str: string) => str.replace(/^\s*((?:[\s\S]*\S)?)\s*$/, '$1')

export const setStyle = (el: HTMLElement, attr: string, value: string | number) => el.style[attr as any] = value as string
