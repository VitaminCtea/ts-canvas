import { addClass, createElement, Observer, removeClass, removeWhiteSpace, scrollToView } from "@/util/index"
import { Node, Options } from '@/cascadeSelector/components/node'
import { TargetHighlight } from './targetHighlight'

type ElementInterface<T = HTMLDivElement> = T | null

export class CascadeSelectorPanel {
    public el: HTMLElement
    public content: Options
    public disabled: boolean
    public showAllLevels: boolean
    public separator: string
    public isShowNodeChildrenCount: boolean
    public checkStrictly: boolean
    public node: Node | null = null
    public observer: Observer = new Observer()
    public panelContent: ElementInterface = null
    public panelContainer: ElementInterface = null
    
    private elements: ElementInterface<HTMLLIElement>[] = []
    private saveNodes: Node[] = []
    private cascadeSelectorMenu: ElementInterface = null
    private previousElement: ElementInterface<HTMLElement> = null
    private previousIconElement: ElementInterface<HTMLSpanElement> | null = null
    private iconComplete: ElementInterface<HTMLSpanElement> | null = null
    private previousNode: Node | null = null

    private nodes: Node[] | null = []
    private path: string[] = []
    private isRegisterMouseEvent: boolean = false
    private isRegisterTransitionEnd: boolean = false
    
    public constructor(
        el: HTMLElement, 
        content: Options, 
        disabled: boolean, 
        showAllLevels: boolean, 
        separator: string, 
        isShowNodeChildrenCount: boolean,
        checkStrictly: boolean
    ) {
        this.el = el
        this.content = content
        this.disabled = disabled
        this.showAllLevels = showAllLevels
        this.separator = separator
        this.isShowNodeChildrenCount = isShowNodeChildrenCount
        this.checkStrictly = checkStrictly
        this.init()
    }

    public init() {
        const container: HTMLDivElement = createElement('div', 'cascadeSelector-panel__container') as HTMLDivElement
        const panelContent: HTMLDivElement = createElement('div', 'cascadeSelector-panel__content') as HTMLDivElement
        const arrow: HTMLSpanElement = createElement('span', 'cascadeSelector-panel__arrow') as HTMLSpanElement
        
        this.panelContent = panelContent
        this.panelContainer = container

        this.nodes = this.generatorNodeTree(this.content) as any

        this.node = this.nodes![0]

        this.cascadeSelectorMenu = 
            this.node.createList(this.content, 1, this.panelContent!, this.disabled, this.isShowNodeChildrenCount)

        container.appendChild(panelContent)
        container.appendChild(arrow)

        this.el.appendChild(container)
    }

    public processMenuLogic(e: MouseEvent) {
        // & firefox和Safari浏览器没有e.path，需要使用e.composedPath，而谷歌有e.path
        // ? 解决办法 const paths = e.path || e.composedPath && e.composedPath()
        const paths = (e as any).path || e.composedPath && e.composedPath()
        const { menuContainerElement, menuItemElement } = this.getMenuElement(paths, e)

        const node: Node = this.getNode(this.nodes!, menuItemElement.getAttribute('value')!)

        if (node?.disabled && this.disabled) return

        this.elements[node.uid - 1] = menuItemElement as HTMLLIElement
        this.saveNodes[node.uid - 1] = node

        if (this.checkStrictly) this.checkStrictlyHandler(node, menuItemElement, e)

        if (node?.isLeaf) {
            if (this.previousNode && this.previousNode.value === node.value && !this.checkStrictly) {
                // & 当清空input.value值的时候，再选择同一个元素的时候应该添加icon，同时设置input.value
                this.changeLeafTrigger()
                return
            }

            if (this.checkStrictly && this.isLabelElement(e)) this.checkStrictlyToggleClass(e, menuItemElement)

            this.observer.trigger('registerMouseHover') // = 绑定mouseenter和mouseleave事件

            this.handleLeafNodesMenu(node, e)

            return
        }

        const level: string = this.getLevel(menuContainerElement)
        const index: number = this.findIndex(menuContainerElement)
        
        if (isNaN(+level) || this.previousElement === menuItemElement) return

        this.savePreviousElement(menuItemElement)
        
        if (this.panelContent!.children[index + 1] && +level === node.depth) {
            this.shouldUpdateMenu(node, level, index)
            return
        }

        this.addMenuHandler(node, level, e)
        this.node = node
    }

    // ? 解决当选择完叶节点之后，再选择不是叶节点的节点时，叶节点的aria-checked变化不改变
    public changeLeafAriaAttribute(e: MouseEvent) {
        if (!this.isLabelElement(e)) return
        const node = this.saveNodes[this.saveNodes.length - 1]
        if (node.isLeaf) (this.elements[this.elements.length - 1] as HTMLElement).setAttribute('aria-checked', 'false')
    }

    public getMenuElement(paths: HTMLElement[], e: MouseEvent) {
        if (!this.checkStrictly) 
            return {
                menuContainerElement: this.getCurrentTargetElement(paths),
                menuItemElement: this.isNotLIElement(paths) ? paths[1] : e.target as HTMLElement
            }

        return {
            menuItemElement: (paths[1] as HTMLElement).nodeName === 'LI' ? paths[1] : paths[3],
            menuContainerElement: (paths[5] as HTMLElement).dataset.level ? paths[5] : paths[7]
        }
    }

    public checkStrictlyHandler(node: Node, menuItemElement: HTMLElement, e: MouseEvent) {
        this.setPath(node)
        this.updatePath(node.uid)

        // ? 当选择上了，通知更新输入框
        if (menuItemElement.getAttribute('aria-checked') === 'true') this.observer.trigger('complete', this.getPath())

        // & 当点击的是label元素(小圆圈)并且不是叶节点
        if ((e.currentTarget as HTMLElement).nodeName === 'LABEL' && !node.isLeaf) {

            // = 更新指定元素的class
            const length = this.elements.length

            this.elements.slice(0, length - 1).forEach(el => this.batchRemoveClass(el!))

            this.elements.forEach(el => {
                removeClass(el as HTMLElement, TargetHighlight.LI_HIGHLIGHT)
                removeClass(el?.lastElementChild as HTMLElement, TargetHighlight.TEXT_HIGHLIGHT)
                addClass(el as HTMLElement, TargetHighlight.LI_HIGHLIGHT)
                this.batchRemoveSiblingElementClass(el!)
            })

            // & 针对指定树的总深度为2的情况，子节点不删除样式的可能
            const leafElement = this.elements[length - 1] as HTMLLIElement
            const isLeaf = leafElement && this.saveNodes[length - 1].isLeaf
            if (isLeaf) this.batchRemoveClass(this.elements[length - 1] as HTMLLIElement)

            // ? 其他Tree Node总深度大于2的情况，应该添加指定样式
            const target = e.currentTarget as HTMLElement

            addClass(target, TargetHighlight.LABEL_HIGHLIGHT)
            addClass(target.parentNode as HTMLElement, TargetHighlight.LI_HIGHLIGHT)

            // % 当选择了指定元素，那么需要注册mouseenter和mouseleave。为了防止重复注册，则只需注册一次即可
            if (!this.isRegisterMouseEvent) {
                this.isRegisterMouseEvent = true
                this.observer.trigger('registerMouseHover')
            }

            this.changeLeafAriaAttribute(e)
        }
    }

    public changeLeafTrigger() {
        this.node?.clickLIElement!.insertAdjacentElement('afterbegin', this.iconComplete!)
        this.observer.trigger('complete', this.getPath())
        this.observer.trigger('success')
    }

    public isLabelElement(e: MouseEvent) {
        return (e.currentTarget as HTMLElement).nodeName.toLowerCase() === 'label'
    }

    public checkStrictlyToggleClass(e: MouseEvent, menuItemElement: HTMLElement) {
        this.elements.forEach(el => {
            this.batchRemoveSiblingElementClass(el!)
            removeClass((el?.lastElementChild) as HTMLElement, TargetHighlight.TEXT_HIGHLIGHT)
            removeClass((el?.firstElementChild) as HTMLElement, TargetHighlight.LABEL_HIGHLIGHT)
            addClass(el as HTMLElement, TargetHighlight.LI_HIGHLIGHT)
        })

        addClass(e.currentTarget as HTMLElement, TargetHighlight.LABEL_HIGHLIGHT)
        addClass(menuItemElement, TargetHighlight.LI_HIGHLIGHT)

        removeClass((menuItemElement as HTMLElement).lastElementChild as HTMLElement, TargetHighlight.TEXT_HIGHLIGHT)
    }

    public batchRemoveSiblingElementClass(el: HTMLElement) {
        this.removeElementSiblingClass(el, 'previousElementSibling')
        this.removeElementSiblingClass(el, 'nextElementSibling')
    }

    public removeElementSiblingClass(menuItemElement: HTMLElement, attr: 'previousElementSibling' | 'nextElementSibling') {
        let sibling: HTMLElement = menuItemElement[attr] as HTMLElement

        while (sibling !== null) {
            this.batchRemoveClass(sibling as HTMLElement)
            sibling = sibling[attr] as HTMLElement
        }
    }

    public removeClassName() {
        const lastIndex: number = this.elements.length - 1

        this.elements.slice(0, lastIndex).forEach(el => {
            removeClass(el as HTMLElement, TargetHighlight.LI_HIGHLIGHT)
            removeClass(el?.firstElementChild as HTMLElement, TargetHighlight.LABEL_HIGHLIGHT)
            addClass(el?.lastElementChild as HTMLElement, TargetHighlight.TEXT_HIGHLIGHT)
        })
        
        this.batchRemoveClass(this.elements[lastIndex] as HTMLElement)
    }

    public batchRemoveClass(el: HTMLElement) {
        removeClass(el, TargetHighlight.LI_HIGHLIGHT)
        removeClass(el?.firstElementChild as HTMLElement, TargetHighlight.LABEL_HIGHLIGHT)
        removeClass(el?.lastElementChild as HTMLElement, TargetHighlight.TEXT_HIGHLIGHT)
    }

    public scrollToView() {
        const scrollWraps = document.getElementsByClassName('scroll-wrap')
        const length = scrollWraps.length
        for (let i: number = 0; i < length; i++) {
            const scrollWrap = scrollWraps[i]
            scrollToView(scrollWrap as HTMLElement, this.elements[i] as HTMLElement)
        }
    }

    public removeIcon() {
        this.node?.removeIcon()
        this.path.pop()
    }

    public getLevel(target: HTMLElement) {
        return target.dataset.level!
    }

    public findIndex(target: HTMLElement) {
        return Array.from(this.panelContent!.children).indexOf(target)
    }

    public handleLeafNodesMenu(node: Node, e: MouseEvent) {
        if (this.checkStrictly) return

        this.setPath(node)

        this.observer.trigger('complete', this.getPath())
        this.observer.trigger('success')

        if (this.previousIconElement && this.previousIconElement.childElementCount > 1) 

        this.iconComplete = this.previousIconElement.removeChild(this.previousIconElement!.firstElementChild!) as HTMLSpanElement
        this.iconComplete = this.iconComplete ? this.iconComplete : createElement('span', 'icon-complete') as HTMLSpanElement
        ;(e.currentTarget as HTMLElement).insertAdjacentElement('afterbegin', this.iconComplete)

        this.previousIconElement = e.currentTarget as HTMLElement
        this.previousNode = node
    }

    public savePreviousElement(target: HTMLElement) {
        this.previousElement = target
    }

    public shouldUpdateMenu(node: Node, level: string, index: number) {
        this.panelContent!.replaceChild(
            node.createList(
                node.data!, 
                +level + 1, 
                this.panelContent!, 
                this.disabled, 
                this.isShowNodeChildrenCount, 
                this.isLeaf(node.children!)
            ), 
            this.panelContent!.children[index + 1]
        )
        
        for (let i: number = this.panelContent!.childElementCount - 1; i > index + 1; i--) {
            this.panelContent?.removeChild(this.panelContent.children[i])
        }

        this.updatePath(node.uid)
        this.setPath(node)

        this.elements = this.elements.slice(0, node.uid)
        this.saveNodes = this.saveNodes.slice(0, node.uid)
    }

    public addMenuHandler(node: Node, level: string, e: MouseEvent) {
        let newMenuElement: HTMLElement | null = null
        newMenuElement = 
            node.createList(
                node.data!, 
                +level + 1, 
                this.panelContent!, 
                this.disabled, 
                this.isShowNodeChildrenCount, 
                this.isLeaf(node.children!)
            )

        this.setPath(node)

        if (newMenuElement) addClass(newMenuElement.previousElementSibling as HTMLElement, 'menu-line')
    }

    public getPath() {
        this.separator = this.separator === '/' ? this.separator : removeWhiteSpace(this.separator)
        return this.path.join(` ${ this.separator } `)
    }

    public setPath(node: Node) {
        let index: number = 0
        if (this.showAllLevels) index = node.uid - 1
        this.path[index] = node.label
    }

    public updatePath(uid: number) {
        this.path = this.path.slice(0, uid)
    }

    public isLeaf(children: any[]) {
        let isLeaf: boolean = false
        if (children.every(item => item.isLeaf)) isLeaf = true
        return isLeaf
    }

    public getCurrentTargetElement(paths: HTMLElement[]) {
        return this.isNotLIElement(paths) ? paths[5] : paths[4]
    }

    public isNotLIElement(paths: HTMLElement[]) {
        return paths[0].nodeName !== 'LI'
    }

    public getNode(content: Node[], value: string, attr: 'value' | 'label' = 'value', result: any[] = []): any {
        for (let i: number = 0; i < content.length; i++) {
            if (content[i][attr] === value) {
                result.push(content[i])
                return result[0]
            }
            this.getNode((content[i].children || []) as any, value, attr, result)
        }
        return result[0]
    }

    public resetIsRegisterMouseEvent() {
        this.isRegisterMouseEvent = false
    }

    public generatorNodeTree(content: Options, parent: any = null, depth: number = 1) {
        return content.map(item => {
            const node: Node = new Node()
            node.parentNode = parent
            node.isLeaf = !item.children
            node.data = item.children || []
            node.depth = node.uid = depth
            node.value = item.value
            node.label = item.label
            node.checkStrictly = this.checkStrictly
            node.disabled = !!item?.disabled
            node.callback = this.processMenuLogic.bind(this)
            node.children = this.generatorNodeTree(item.children! || [], node, depth + 1) as any
            return node
        })
    }

    // public createPaths(node: Node, result: string[][]) {
    //     const paths: string[] = []
    //     let parentNode: Node | null = node.parentNode
    //     while (parentNode !== null) {
    //         paths.unshift(parentNode.label)
    //         parentNode = parentNode.parentNode
    //     }
    //     paths.push(node.label)
    //     result.push(paths)
    // }

    // ? 根据指定关键字搜索，最后在nodes中找出关键字出现的所有路径
    // public getSearchPath(nodes: Node[], keywords: string, isMiddle: boolean = false, result: string[][] = []) {
    //     for (let i: number = 0; i < nodes.length; i++) {
    //         if (nodes[i].label.includes(keywords)) {
    //             if (!nodes[i].isLeaf) {
    //                 nodes[i].children?.forEach(node => this.createPaths(node, result))
    //                 isMiddle = true
    //             } else if (nodes[i].isLeaf && !isMiddle) this.createPaths(nodes[i], result)
    //         }
    //         this.getSearchPath(nodes[i].children!, keywords, isMiddle, result)
    //     }

    //     return result
    // }
}