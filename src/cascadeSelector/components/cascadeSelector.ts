import { addClass, createElement, createProperty, event, isDifferentElements, removeClass } from "@/util/index"
import { CascadeSelectorInput } from "./cascadeSelectorInput"
import { CascadeSelectorPanel } from './cascadeSelectorPanel'
import { Options } from './node'

const setStyle = (el: HTMLElement, attr: string, value: string | number) => el.style[attr as any] = value as string

class ShowPanel {
    public cascadeSelector: any
    public state: string = 'show'
    public constructor(cascadeSelector: any) {
        this.cascadeSelector = cascadeSelector
    }
    public execute(el: HTMLElement, content: HTMLElement, className: string) {
        setStyle(el, 'opacity', 1)
        setStyle(el, 'transform', 'scaleY(1)')
        addClass(content.firstElementChild as HTMLElement, className)
        this.cascadeSelector.setState(this.cascadeSelector.hidePanel)
    }
}

class HidePanel {
    public cascadeSelector: any
    public state: string = 'hide'
    public constructor(cascadeSelector: any) {
        this.cascadeSelector = cascadeSelector
    }
    public execute(el: HTMLElement, content: HTMLElement, className: string) {
        setStyle(el, 'opacity', 0)
        setStyle(el, 'transform', 'scaleY(0)')
        removeClass(content.firstElementChild as HTMLElement, className)
        this.cascadeSelector.setState(this.cascadeSelector.showPanel)
    }
}

type CascadeSelectorOptions = {
    el: HTMLElement
    content: Options
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
    showAllLevels?: boolean
    isShowLength?: boolean
    separator?: string
    isShowNodeChildrenCount?: boolean
    checkStrictly?: boolean
    getValue?: (val: string) => void
}

export class CascadeSelector {
    public el: HTMLElement
    public content: Options
    public placeholder: CascadeSelectorOptions['placeholder']
    public disabled: CascadeSelectorOptions['disabled']
    public clearable: CascadeSelectorOptions['clearable']
    public showAllLevels: CascadeSelectorOptions['showAllLevels']
    public isShowLength: CascadeSelectorOptions['isShowLength']
    public separator: CascadeSelectorOptions['separator']
    public isShowNodeChildrenCount: CascadeSelectorOptions['isShowNodeChildrenCount']
    public checkStrictly: CascadeSelectorOptions['checkStrictly']
    public getValue: CascadeSelectorOptions['getValue']

    private cascadeSelectorInput: CascadeSelectorInput | null = null
    private cascadeSelectorPanel: CascadeSelectorPanel | null = null
    private suffixInner: HTMLSpanElement | null = null
    private saveMouseDownElement: HTMLElement | null = null
    private clearElement: HTMLSpanElement | null = null

    private showPanel: ShowPanel = new ShowPanel(this)
    private hidePanel: HidePanel = new HidePanel(this)
    private state: ShowPanel | HidePanel = this.showPanel
    private transition: string = createProperty('transition')!
    private mouseIn: Function | null = null
    private mouseOut: Function | null = null
    private transitionEnd: Function | null = null

    public static CLICK_INPUT_CLASS_NAME: string = 'is-click'

    public constructor(options: CascadeSelectorOptions) {
        const { 
            el, 
            content,  
            isShowLength, 
            placeholder = '请选择',
            separator = '/',
            disabled = false, 
            clearable = false, 
            showAllLevels = true,
            isShowNodeChildrenCount = false,
            checkStrictly = false,
            getValue
        } = options

        this.el = el
        this.content = content
        this.placeholder = placeholder
        this.disabled = disabled
        this.clearable = clearable
        this.showAllLevels = showAllLevels
        this.isShowLength = isShowLength
        this.separator = separator
        this.isShowNodeChildrenCount = isShowNodeChildrenCount!
        this.checkStrictly = checkStrictly
        this.getValue = getValue
        this.init()
    }

    public init() {
        const container: HTMLDivElement = createElement('div', 'cascadeSelector-container') as HTMLDivElement
        const content: HTMLDivElement = createElement('div', 'cascadeSelector-content__input') as HTMLDivElement
        const suffixContainer: HTMLSpanElement = createElement('div', 'cascadeSelector-input__suffix') as HTMLSpanElement
        const suffixInner: HTMLSpanElement = createElement('span', 'cascadeSelector-input__arrow') as HTMLSpanElement

        this.suffixInner = suffixInner

        suffixContainer.appendChild(suffixInner)

        event.on(content, 'click', (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation() // & 阻止冒泡，防止点击元素外的空白区域意外隐藏菜单等操作
            this.panelStateMachine(content)
        })

        this.cascadeSelectorInput = new CascadeSelectorInput(content, this.placeholder!)

        content.appendChild(suffixContainer)
        container.appendChild(content)

        this.cascadeSelectorPanel = 
            new CascadeSelectorPanel(
                container, 
                this.content, 
                !!this.disabled, 
                this.showAllLevels!, 
                this.separator!,
                this.isShowNodeChildrenCount!,
                this.checkStrictly!
            )

        const hideExecute = this.hidePanel.execute
        this.hidePanel.execute = this.rewriteHideExecute.bind(this, this.cascadeSelectorPanel.panelContainer!, content, hideExecute)
        
        // & 测试搜索路径
        // let c = this.cascadeSelectorPanel.generatorNodeTree(this.content)
        // let path = this.cascadeSelectorPanel.getSearchPath(c, '框')
        // console.log(path)

        if (this.clearable) {
            this.clearElement = createElement('span', 'cascadeSelector-input__circle') as HTMLSpanElement

            const click: Function = (e: MouseEvent) => {
                e.stopPropagation()
                this.cascadeSelectorInput?.observer.trigger('clearValue')
                suffixContainer.replaceChild(this.suffixInner!, this.clearElement!)
                if (!this.checkStrictly) {
                    this.cascadeSelectorPanel?.removeIcon()
                    this.hidePanel.execute(this.cascadeSelectorPanel!.panelContainer!, content, CascadeSelector.CLICK_INPUT_CLASS_NAME)
                } else this.cascadeSelectorPanel!.removeClassName()

                event.off(content, 'mouseenter', this.mouseIn!)
                event.off(content, 'mouseleave', this.mouseOut!)
                event.off(suffixContainer, 'click', click)
            }

            this.cascadeSelectorPanel?.observer.listen(
                'registerMouseHover',
                () => {
                    this.registerClearableHoverEvent(content)
                    event.on(suffixContainer, 'click', click)
                }
            )

            event.on(suffixContainer, 'click', click)
        }

        this.cascadeSelectorPanel.observer.listen(
            'complete', 
            (val: string) => {
                if (this.getValue && typeof this.getValue === 'function') this.getValue(val)
                this.cascadeSelectorInput?.observer.trigger('selectComplete', val)
                this.cascadeSelectorPanel?.resetIsRegisterMouseEvent()
                if (!this.checkStrictly)
                    this.hidePanel.execute(this.cascadeSelectorPanel!.panelContainer!, content, CascadeSelector.CLICK_INPUT_CLASS_NAME)
            }
        )

        this.cascadeSelectorPanel.observer.listen(
            'success', 
            removeClass.bind(null, content.firstElementChild as HTMLElement, CascadeSelector.CLICK_INPUT_CLASS_NAME)
        )

        event.on(this.cascadeSelectorPanel!.panelContainer!, 'transitionstart', () => {
            switch (this.state.state) {
                case 'hide': setStyle(this.suffixInner!, 'transform', 'rotate(180deg)'); break
                case 'show': setStyle(this.suffixInner!, 'transform', 'rotate(0deg)'); break
            }
        })

        event.on(document, 'click', (e: MouseEvent) => {
            // ? 当正在拖动滚动条并且鼠标在面板外部时，松开鼠标时意外的自动关闭面板
            if (
                this.saveMouseDownElement && this.saveMouseDownElement !== e.target || 
                (e.target as HTMLElement).nodeName === 'LI'
            ) return

            if (this.state.state === 'hide') 
                this.hidePanel.execute(this.cascadeSelectorPanel!.panelContainer!, content, CascadeSelector.CLICK_INPUT_CLASS_NAME)

            removeClass(content.firstElementChild as HTMLElement, CascadeSelector.CLICK_INPUT_CLASS_NAME)
        })

        event.on(document, 'mousedown', (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            this.saveMouseDownElement = e.target as HTMLElement
        })
        
        this.el.appendChild(container)
    }

    public registerClearableHoverEvent(el: HTMLDivElement) {
        event.on(el, 'mouseenter', this.mouseIn = (e: MouseEvent) => this.updateIcon(e, this.clearElement!))
        event.on(el, 'mouseleave', this.mouseOut = (e: MouseEvent) => this.updateIcon(e, this.suffixInner!))
    }

    public updateIcon(e: MouseEvent, newIconElement: HTMLSpanElement) {
        const suffixContainer: HTMLDivElement = (e.currentTarget as HTMLElement).lastElementChild! as HTMLDivElement
        suffixContainer.style.display = 'none'
        suffixContainer.innerHTML = ''
        suffixContainer.appendChild(newIconElement)
        suffixContainer.style.display = 'block'
    }

    public rewriteHideExecute(panelContainer: HTMLElement, content: HTMLElement, hideExecute: Function) {
        hideExecute.call(this.hidePanel, this.cascadeSelectorPanel!.panelContainer!, content, CascadeSelector.CLICK_INPUT_CLASS_NAME)
        event.on(panelContainer, 'transitionend', this.transitionEnd = () => {
            this.cascadeSelectorPanel?.scrollToView()
            event.off(panelContainer, 'transitionend', this.transitionEnd)
        })
    }

    public panelStateMachine(content: HTMLElement) {
        this.state.execute(this.cascadeSelectorPanel!.panelContainer!, content, CascadeSelector.CLICK_INPUT_CLASS_NAME)
    }

    public setState(newState: any) {
        this.state = newState
    }
}