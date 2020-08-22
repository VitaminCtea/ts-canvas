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