import { createElement, event, createProperty, addClass, Observer, isDifferentElements } from "@/util/index"
import { map, Info } from './map'
import './index.css'

type Options = {
    el: HTMLElement
    startOffset?: number
    direction?: 'horizontal' | 'vertical'
    theme?: {
        thumbBgColor?: string
        trackBgColor?: string
    }
}

type PageElement = HTMLDivElement | null

export class ScrollBar {
    public el: Options['el']
    public startOffset: Options['startOffset']
    public direction: Options['direction']
    public theme: Options['theme'] = { thumbBgColor: '#909399', trackBgColor: '#ddd' }
    
    public container: PageElement = null
    public thumb: PageElement = null
    public targetOverflowElement:PageElement = null
    public cursorDown: boolean = false
    public observer: Observer = new Observer()
    
    private bar: Info
    private transform: string = createProperty('transform')!
    private directionPrefix: string = 'scrollBar-'
    private thumbMouseDown: Function | null = null
    private containerClick: Function | null = null
    private mouseMove: Function | null = null
    private mouseUp: Function | null = null

    public constructor(options: Options) {
        const { el, startOffset, direction = 'vertical', theme = {} } = options
        this.el = el
        this.startOffset = this.getSafeNumber(startOffset!)
        this.direction = direction
        this.bar = map[this.direction === 'vertical' ? 'vertical' : 'horizontal']
        this.theme = this.extends(theme, this.theme)
        this.init()
    }

    public init() {
        const container: HTMLDivElement = createElement('div', 'scrollBar-container') as HTMLDivElement
        const thumb: HTMLDivElement = createElement('div', 'scrollBar-thumb') as HTMLDivElement

        this.container = container
        this.thumb = thumb
        this.targetOverflowElement = this.getOverflowElement(this.el)

        this.container.setAttribute('role', 'scrollBar')

        if (!this.targetOverflowElement) return

        this.setBgColor()

        switch (this.direction) {
            case 'vertical':
                this.setScrollBar(
                    'height', 
                    '100%', 
                    (this.el as any)[this.bar.offset] / (this.targetOverflowElement as any)[this.bar.scrollSize] * 100 + '%'
                )
                break
            case 'horizontal':
                this.setScrollBar(
                    'width',
                    (this.el as any)[this.bar.offset] / (this.targetOverflowElement as any)[this.bar.scrollSize] * 100 + '%',
                    '6px'
                )
                break
        }

        // ? 指示元素的方向是水平、垂直方向
        container.setAttribute('aria-orientation', `${ this.direction }`)

        this.disableNativeScrollBar()

        addClass(this.container, `${ this.directionPrefix }${ this.direction }`)

        this.registerEvent()

        container.appendChild(thumb)
        this.el.appendChild(container)
    }

    public extends(origin: any, target: any) {
        Object.keys(origin).forEach(key => {
            if (!origin[key]) return
            target[key] = origin[key]
        })
        return target
    }

    public setBgColor() {
        this.container!.style.backgroundColor = this.theme!.trackBgColor!
        this.thumb!.style.backgroundColor = this.theme!.thumbBgColor!
    }

    public registerEvent() {
        event.on(this.targetOverflowElement, 'scroll', this.setThumbPosition.bind(this))
        event.on(this.thumb!, 'mousedown', this.thumbMouseDown = this.mouseDownThumbHandler.bind(this))
        event.on(this.container!, 'click', this.containerClick = this.clickTrackHandler.bind(this))
    }

    public disableNativeScrollBar() {
        const style: HTMLStyleElement = createElement('style', '') as HTMLStyleElement
 
        document.head.appendChild(style)

        const sheet: CSSStyleSheet = style.sheet!
        let className: string | null = this.getFirstClassName()

        if (className) className = '.' + className
        else className = this.el.firstElementChild!.nodeName.toLowerCase()

        sheet.insertRule(`${ className }::-webkit-scrollbar { display: none }`, 0)
    }

    public getFirstClassName() {
        const classNames: string[] = this.targetOverflowElement!.className.split(' ')
        if (!classNames.length) return null
        return classNames[0]
    }

    public setScrollBar(attr: 'width' | 'height', thumbWidth: string, thumbHeight: string) {
        this.container!.style[attr] = '100%'
        this.thumb!.style.width = thumbWidth
        this.thumb!.style.height = thumbHeight
    }

    public clickTrackHandler(e: MouseEvent) {
        // & document.onmouseup事件触发完之后，又会触发容器的click事件，临时解决办法
        if (isDifferentElements(e)) return

        // ? 计算(鼠标点击的坐标 - 滚动条滑道 = 当前点击滑道的点距离滑道顶部的距离)
        const offset = (e as any)[this.bar.client] - (e.target as any).getBoundingClientRect()[this.bar.direction]

        // - 取滑块的一半是为了当点击滑道的时候让滑块的中间部分走到鼠标点的位置，此时鼠标的点为滑块的中心点
        const thumbHalf = (this.thumb as any)[this.bar.offset] / 2 | 0

        // = (总距离 - 滑块的一半) = 实际的总距离 -> 实际的总距离 * 100 = 百分比 -> 百分比 / 滑道的总高度 = 滑块位置的百分比
        const thumbPositionPercentage = (offset - thumbHalf) / (this.container as any)[this.bar.offset]
        
        // & 设置超出父级高度元素的scrollTop值，其中公式为thumbPositionPercentage * 超出父级高度元素的高/宽(scrollHeight/scrollWidth)
        // & 得到实际的scrollTop值
        this.setOverflowElementScroll(thumbPositionPercentage)
        this.setThumbPosition()
    }

    public mouseDownThumbHandler(e: MouseEvent) {
        if (e.ctrlKey || e.button === 2) return // ? prevent click event of right button

        // $ 点击事件前置准备
        e.stopPropagation()    // & 阻止冒泡

        this.cursorDown = true  // $ 标识已经点击

        // # 当前滑块的总高度 - (e.clientY/clientX - 当前滑块距离页面顶部的距离 = 滑块的顶部到鼠标位置的距离) = 滑块剩余部分的值
        ;(this as any)[this.bar.axis] = 
            (e.currentTarget as any)[this.bar.offset] - 
            (((e as any)[this.bar.client] - (e as any).currentTarget.getBoundingClientRect()[this.bar.direction]))

        event.on(document, 'mousemove', this.mouseMove = this.mouseMoveDocumentHandler.bind(this))
        event.on(document, 'mouseup', this.mouseUp = this.mouseUpDocumentHandler.bind(this))
        
        document.onselectstart = () => false    // ? 防止点击时候产生拖放
    }

    public mouseUpDocumentHandler(e: MouseEvent) {
        e.stopPropagation()
        if (this.cursorDown) {
            // ? 重置操作
            this.cursorDown = false
            
            // - 触发鼠标按键抬起的事件(mouseup)
            this.observer.trigger('mouseup', this.container)

            ;(this as any)[this.bar.axis] = 0

            event.off(document, 'mousemove', this.mouseMove)
            event.off(document, 'mouseup', this.mouseUp)

            document.onselectstart = null
        }
    }

    public mouseMoveDocumentHandler(e: MouseEvent) {
        e.stopPropagation()
        // ! 如果没有点击并且鼠标不在滑块上(也就是没有得到axis值的时候，无效)
        if (!this.cursorDown || !(this as any)[this.bar.axis]) return
        
        // % 鼠标滑动位置距离视口的距离 - 容器距离视口顶部的距离 = 偏移距离
        const offset: number = ((e as any)[this.bar.client] - (this.el as any).getBoundingClientRect()[this.bar.direction])

        // & 滑块总高度/总宽度 - 点击滑块的位置距离滑块底部的距离 = 滑块点击的位置(相对于滑块)
        const thumbClickPosition: number = (this.thumb as any)[this.bar.offset] - (this as any)[this.bar.axis]

        // * (偏移距离 - 滑块点击的位置) * 100 / 容器的总高度 = 滑块位置的百分比
        const thumbPositionPercentage = ((offset - thumbClickPosition) / (this.el as any)[this.bar.offset])

        this.setOverflowElementScroll(thumbPositionPercentage)
        this.setThumbPosition()
    }

    public setOverflowElementScroll(thumbPositionPercentage: number) {  // = 设置溢出元素的scrollTop/scrollLeft
        (this.targetOverflowElement as any)[this.bar.scroll] = 
            (thumbPositionPercentage * (this.targetOverflowElement as any)[this.bar.scrollSize])
    }

    public setThumbPosition() { // - 设置滑块的位置
        // ? 用溢出的元素的scrollHeight/scrollWidth(总高度) / 容器的clientHeight/clientWidth * 100 = 需要走到终点的百分比
        this.thumb!.style[this.transform as any] = 
            `translate${ this.bar.axis as any }(
                ${ (this.targetOverflowElement as any)[this.bar.scroll] / (this.el as any)[this.bar.content] * 100 }%
            )`
    }

    public destroyed() {
        event.off(document, 'mouseup', this.mouseUp)
    }

    public getSafeNumber(num: number) {
        if (this.isNumber(num)) return Math.max(Math.min(Number.MAX_SAFE_INTEGER, num), 0)
        return 0
    }

    public isNumber(num: number) {
        if (isNaN(+num)) return false
        num = +num
        return typeof num === 'number' && (num >= Number.MIN_SAFE_INTEGER && num <= Number.MAX_SAFE_INTEGER)
    }

    public getOverflowElement(el: HTMLElement, result: any[] = []): any {
        const length: number = el.children.length
        for (let i: number = 0; i < length; i++) {
            const child: HTMLElement = el.children[i] as HTMLElement
            if ((child as any)[this.bar.scrollSize] <= (el as any)[this.bar.offset]) return this.getOverflowElement(child, result)
            else {
                result.push(child)
                return result[0]
            }
        }
        return result[0]
    }
}