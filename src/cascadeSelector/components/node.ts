import { 
    createElement, 
    event, 
    Observer, 
    createProperty, 
    removeClass, 
    addClass, 
    getVendorPrefix, 
    hasClass
} from '@/util/index'
import { ScrollBar } from '@/scrollBar/scrollBar'
import { TargetHighlight } from './targetHighlight'

type Content = {
    value: string
    label: string
    disabled?: boolean
    children?: Options
}

export type Options = Content[]

type HTMLElementInterface = HTMLElement | null

export class Node {
    public parentNode: Node | null = null
    public data: Options | null = null
    public callback: Function | null = null
    public children: Node[] | null = []
    public depth: number | null = null
    public observer: Observer = new Observer()
    public value: string = ''
    public label: string = ''
    public disabled: boolean = false
    public checkStrictly: boolean = false
    public isLeaf: boolean = false
    public uid: number = 1
    public clickLIElement: HTMLElementInterface = null

    private transition: string = createProperty('transition')!
    private isMouseenterEvent: boolean = true
    private isSlide: boolean = false
    private nodeLabel: HTMLElementInterface = null
    private currentTarget: HTMLElementInterface = null
    private previousElement: HTMLElementInterface = null
    private cascadeSelectorMenuItem: HTMLElementInterface = null
    private cascadeSelectorMenuWrap: HTMLElementInterface = null
    private cascadeSelectorNodeLabel: HTMLElementInterface = null
    private previousLiElement: HTMLElementInterface = null

    public createMenuItem(
        item: Content, 
        label: string, 
        value: string, 
        isLeaf: boolean, 
        disabled: boolean, 
        isShowNodeChildrenCount: boolean
    ) {
        const cascadeSelectorMenuItem: HTMLLIElement = createElement('li', 'cascadeSelector-menu__item') as HTMLLIElement
        const cascadeSelectorNodeLabel: HTMLSpanElement = createElement('span', 'cascadeSelector-node__label') as HTMLLIElement
        const cascadeSelectorNodePostFix: HTMLSpanElement = createElement('span', 'cascadeSelector-node__postFix') as HTMLSpanElement
        const fragment: DocumentFragment = document.createDocumentFragment()

        this.cascadeSelectorMenuItem = cascadeSelectorMenuItem

        if (disabled) {
            addClass(cascadeSelectorMenuItem, 'is-disabled')
            event.on(cascadeSelectorMenuItem, 'click', (e: MouseEvent) => e.stopPropagation())
        } else {
            if (!this.checkStrictly) event.on(cascadeSelectorMenuItem, 'click', this.click.bind(this))
        }

        label = isShowNodeChildrenCount && item.children ? `${ label }(${ item.children!.length })` : label

        cascadeSelectorNodeLabel.textContent = label

        this.cascadeSelectorNodeLabel = cascadeSelectorNodeLabel

        cascadeSelectorMenuItem.setAttribute('role', 'menuitem')
        cascadeSelectorMenuItem.setAttribute('value', value)

        if (!this.checkStrictly) {
            if (!isLeaf) {
                fragment.appendChild(cascadeSelectorNodeLabel)
                fragment.appendChild(cascadeSelectorNodePostFix)
            } else fragment.appendChild(cascadeSelectorNodeLabel)
        } else {
            const label: HTMLLabelElement = createElement('label', 'cascadeSelector-radio') as HTMLLabelElement
            const inputContainer: HTMLDivElement = createElement('div', 'cascadeSelector-radio__input') as HTMLDivElement
            const inner: HTMLSpanElement = createElement('span', 'cascadeSelector-radio__inner') as HTMLSpanElement
            const input: HTMLInputElement = createElement('input', 'cascadeSelector-radio__original') as HTMLInputElement

            label.setAttribute('role', 'radio')
            input.setAttribute('role', 'radio')

            inputContainer.appendChild(inner)
            inputContainer.appendChild(input)

            event.on(cascadeSelectorNodeLabel, 'click', this.nodeLabelClick.bind(this))
            event.on(label, 'click', this.radioLabelClick.bind(this))

            label.appendChild(inputContainer)

            fragment.appendChild(label)
            fragment.appendChild(cascadeSelectorNodeLabel)
        }

        cascadeSelectorMenuItem.setAttribute('aria-checked', 'false')

        cascadeSelectorMenuItem.appendChild(fragment)

        return cascadeSelectorMenuItem
    }

    public click(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation() // & 阻止冒泡，防止点击元素外的空白区域意外隐藏菜单等操作
        if (this.previousElement) removeClass(this.previousElement as HTMLElement, TargetHighlight.LI_HIGHLIGHT)
        addClass(e.currentTarget as HTMLElement, TargetHighlight.LI_HIGHLIGHT)
        this.callback!(e)
        this.previousElement = this.clickLIElement = e.currentTarget as HTMLElement
    }

    public radioLabelClick(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation() // & 阻止冒泡，防止点击元素外的空白区域意外隐藏菜单等操作

        const paths = (e as any).path || e.composedPath && e.composedPath()

        if (hasClass((paths[3] as HTMLElement), 'is-disabled')) return

        if (this.previousLiElement) this.previousLiElement!.setAttribute('aria-checked', 'false')

        ;(paths[3] as HTMLElement).setAttribute('aria-checked', 'true')

        this.callback!(e)

        this.previousLiElement = paths[3] as HTMLElement
    }

    public nodeLabelClick(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation() // & 阻止冒泡，防止点击元素外的空白区域意外隐藏菜单等操作
        
        const paths = (e as any).path || e.composedPath && e.composedPath()

        if (hasClass((paths[1] as HTMLElement), 'is-disabled')) return

        if (this.nodeLabel) removeClass(this.nodeLabel as HTMLElement, TargetHighlight.TEXT_HIGHLIGHT)

        addClass(e.currentTarget as HTMLElement, TargetHighlight.TEXT_HIGHLIGHT)
        
        this.callback!(e)

        this.nodeLabel = e.currentTarget as HTMLElement
    }

    public createList(
        content: Options, 
        depth: number, 
        container: HTMLElement, 
        disabled: boolean, 
        isShowNodeChildrenCount: boolean, 
        isLeaf: boolean = false
    ) {
        const cascadeSelectorMenu: HTMLDivElement = createElement('div', 'cascadeSelector-menu__container') as HTMLDivElement
        const cascadeSelectorMenuWrap: HTMLDivElement = createElement('div', 'cascadeSelector-menu__wrap') as HTMLDivElement
        const cascadeSelectorScrollWrap: HTMLDivElement = createElement('div', 'scroll-wrap') as HTMLDivElement
        const cascadeSelectorMenuList: HTMLUListElement = createElement('ul', 'cascadeSelector-menu__list') as HTMLUListElement
        const fragment: DocumentFragment = document.createDocumentFragment()

        this.cascadeSelectorMenuWrap = cascadeSelectorMenuWrap

        switch (getVendorPrefix(document.documentElement)) {
            case 'Moz': cascadeSelectorScrollWrap.style['scrollbar-width' as any] = 'none'; break
            case 'ms': cascadeSelectorScrollWrap.style['-ms-overflow-style' as any] = 'none'; break
        }

        cascadeSelectorMenu.dataset.level = depth + ''

        content.forEach(item => 
            fragment.appendChild(
                this.createMenuItem(
                    item,
                    item.label, 
                    item.value, 
                    isLeaf, 
                    disabled && (item.disabled ? item.disabled : false),
                    isShowNodeChildrenCount
                )
            )
        )

        cascadeSelectorMenuList.setAttribute('role', 'menu')

        cascadeSelectorMenuList.appendChild(fragment)
        cascadeSelectorScrollWrap.appendChild(cascadeSelectorMenuList)
        cascadeSelectorMenuWrap.appendChild(cascadeSelectorScrollWrap)
        cascadeSelectorMenu.appendChild(cascadeSelectorMenuWrap)
        container.appendChild(cascadeSelectorMenu)

        const scrollBar: ScrollBar = new ScrollBar({ el: cascadeSelectorMenu })

        // & 滚动条初始化
        this.setElementStyle(scrollBar.container!, this.transition, 'opacity .2s')
        this.setScrollBarOpacity(scrollBar.container!, '0')

        // ? 处理当超出cascadeSelectorMenu容器外还拖动滚动条滑块时opacity = 0的情况
        scrollBar.observer.listen('mouseup', (container: HTMLElement) => {
            // = 如果松开鼠标并且当鼠标按下的滚动条和鼠标在进入时的滚动条是同一个滚动条，那么不需要隐藏
            if (!scrollBar.cursorDown && this.isMouseenterEvent && this.currentTarget === container) {
                this.setScrollBarOpacity(container, '1')
                return
            }
            // & 其他情况应该隐藏滚动条
            this.setScrollBarOpacity(container, '0')
        })

        this.registerMouseHoverEvent(cascadeSelectorMenu, 'mouseenter', scrollBar, '1')
        this.registerMouseHoverEvent(cascadeSelectorMenu, 'mouseleave', scrollBar, '0')

        return cascadeSelectorMenu
    }

    public registerMouseHoverEvent(el: HTMLElement, eventName: 'mouseenter' | 'mouseleave', scrollBar: ScrollBar, opacity: '0' | '1') {
        event.on(el, eventName, this.toggleScrollBarOpacity.bind(this, scrollBar, opacity))
    }

    public toggleScrollBarOpacity(scrollBar: ScrollBar, opacity: '0' | '1', e: MouseEvent) {
        this.isMouseenterEvent = e.type === 'mouseenter' ? true : false
        
        // % 如果是mouseenter事件的话，则需要获取当前鼠标所在的容器内的滚动条元素，保存起来以便判断上述是同一个滚动条所产生的opacity = 0的情况
        if (this.isMouseenterEvent) {
            const isScrollBar = this.isScrollBar((e.currentTarget as HTMLElement).lastElementChild as HTMLElement)
            this.currentTarget = isScrollBar ? this.getLastElementChild(e.currentTarget as HTMLElement) : null
        }

        // # 如果按下滚动条滑块的时候，则不对滚动条设置透明度
        if (scrollBar.cursorDown) return

        this.setScrollBarOpacity(scrollBar.container!, opacity)
    }

    public getLastElementChild(el: HTMLElement) {
        return el.lastElementChild! as HTMLElement
    }

    public isScrollBar(el: HTMLElement) {
        return el.getAttribute('role') === 'scrollBar'
    }

    public setScrollBarOpacity(el: HTMLElement, opacity: '0' | '1') {
        this.setElementStyle(el, 'opacity', opacity)
    }

    public setElementStyle(el: HTMLElement, attr: string, value: string) {
        el.style[attr as any] = value
    }

    public removeIcon() {
        this.clickLIElement!.removeChild(this.clickLIElement!.firstElementChild as HTMLElement)
        removeClass(this.clickLIElement!, TargetHighlight.LI_HIGHLIGHT)
    }
}