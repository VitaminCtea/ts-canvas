import { Application } from '@/Application/index'
import { ApplicationTest } from '@/ApplicationTest'
import { DrawClock } from '@/demo/DrawClock'
import { hasClass, addClass, removeClass } from '@/util/index'
// import '@/colorPicker/index'
import '@/colorPicker2/index'
import './style/index.css'

// const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
// const appTest: ApplicationTest = new ApplicationTest(canvas)
// const app: Application = new Application(canvas)
// // const clock: DrawClock = new DrawClock(canvas)
// // clock.start()

// const startButton: HTMLButtonElement = document.getElementById('start') as HTMLButtonElement
// const stopButton: HTMLButtonElement = document.getElementById('stop') as HTMLButtonElement

// if (canvas === null) throw new Error('无法获取HTMLCanvasElement')

// // app.update(0, 0)
// // app.render()
// appTest.start()

// const timerCallback = (id: number, data: string): void => console.log('当前调用的Timer的id: ' + id + ', data: ' + data)

// const DATA = 'data是timeCallback的数据'
// const timer0: number = app.addTimer(timerCallback, 3, true, DATA)
// const timer1: number = app.addTimer(timerCallback, 1, false, DATA)

// startButton.onclick = (ev: MouseEvent) => app.start()

// stopButton.onclick = (ev: MouseEvent) => {
//     app.removeTimer(timer1)
//     console.log(app.timers.length)
//     let id: number = app.addTimer(timerCallback, 10, true, DATA)
//     console.log(id === 0)
//     setTimeout(() => {
//         app.stop()
//     }, 10000)
// }

const throttle = (fn: (...rest: any[]) => void, isFirstRun: boolean = false, timeout: number = 2000) => {
    let lastTime: number = +new Date()
    let timerId: any = null
    return (...rest: any[]) => {
        if (isFirstRun) {
            fn.apply(null, rest)
            isFirstRun = false
            lastTime = +new Date()
            return
        }
        const now = +new Date()
        if (timerId) clearTimeout(timerId)
        if (now - lastTime >= timeout) {
            fn.apply(null, rest)
            lastTime = now
        } else {
            timerId = setTimeout(() => {
                fn.apply(null, rest)
                timerId = null
            }, timeout)
        }
    }
}

const throttleButton: HTMLButtonElement = document.getElementById('throttle') as HTMLButtonElement
throttleButton.onclick = throttle(() => console.log('throttle'), true, 2000)

interface AnalogTimer {
    lastTime: number
    timer: number
    (timeStamp: number, type: 'timeout' | 'interval', fn: () => void): void
}

type Callback = () => void

const createTimer = ({ type, time, callback }: { type: 'timeout' | 'interval'; time: number; callback: Callback }) => {
    const strategyTimer = {
        originTime: time,
        countdown: time,
        timeout(intervalSec: number, callback: Callback, timer: number) {
            this.countdown -= intervalSec
            if (~~this.countdown <= 0) {
                callback()
                this.countdown = this.originTime
                window.cancelAnimationFrame(timer)
            }
        },
        interval(intervalSec: number, callback: Callback) {
            this.countdown -= intervalSec
            if (~~this.countdown <= 0) {
                callback()
                this.countdown = this.originTime
            }
        },
    }

    const analogTimer: AnalogTimer = (timeStamp: number, type: 'timeout' | 'interval', callback: Callback) => {
        if (analogTimer.lastTime === -1) analogTimer.lastTime = timeStamp
        let intervalSec: number = timeStamp - analogTimer.lastTime
        analogTimer.lastTime = timeStamp
        analogTimer.timer = window.requestAnimationFrame((timeStamp: number) => analogTimer(timeStamp, type, callback))
        strategyTimer[type](intervalSec, callback, analogTimer.timer)
    }

    analogTimer.lastTime = -1
    analogTimer.timer = window.requestAnimationFrame((timeStamp: number) => analogTimer(timeStamp, type, callback))

    return () => {
        window.cancelAnimationFrame(analogTimer.timer)
        strategyTimer.originTime = time
        strategyTimer.countdown = time
    }
}

const cancel: Function = createTimer({
    type: 'timeout',
    time: 4000,
    callback: () => {
        console.log('模拟SetInterval')
    },
})

setTimeout(() => {
    cancel()
}, 10000)

// 慢
console.time('r1')
const repeat: (count: number, str: string) => string = (count, str) => (count > 0 ? str + repeat(--count, str) : '')
console.log(repeat(6, 'yeah!'))
console.timeEnd('r1')

// 快(是repeat1的好几倍以上)
console.time('r2')
const repeat2: (str: string, count: number) => string = (str, count) => {
    let target: string = str
    let total: string = ''
    while (count > 0) {
        if (count % 2 === 1) total += target
        if (count === 1) break
        target += target
        count >>= 1
    }
    return total
}

console.log(repeat2('yeah!', 4))
console.timeEnd('r2')

// ----------------------------------------------树形菜单-------------------------------------------------

const isSupportTextContent = (el: HTMLElement) => 'textContent' in document.body && typeof el.textContent !== undefined

const setElementText = (el: HTMLElement, content: string) => {
    if (isSupportTextContent(el)) el.textContent = content
    else el.innerText = content
}

type TreeNode = { id: number; pId: number; name: string; children?: TreeNode[] }

const nodes: TreeNode[] = [
    {
        id: 1,
        pId: 0,
        name: '菜单一',
    },
    {
        id: 101,
        pId: 1,
        name: '菜单一子菜单一',
    },
    {
        id: 102,
        pId: 1,
        name: '菜单一子菜单二',
    },
    {
        id: 1010,
        pId: 101,
        name: '菜单一孙菜单一',
    },
    {
        id: 1020,
        pId: 102,
        name: '菜单一孙菜单二',
    },
    {
        id: 10100,
        pId: 1010,
        name: '菜单一孙子菜单一',
    },
    {
        id: 10200,
        pId: 1020,
        name: '菜单一孙子菜单二',
    },
    {
        id: 2,
        pId: 0,
        name: '菜单二',
    },
    {
        id: 201,
        pId: 2,
        name: '菜单二子菜单一',
    },
    {
        id: 202,
        pId: 2,
        name: '菜单二子菜单二',
    },
    {
        id: 2010,
        pId: 201,
        name: '菜单二子孙菜单一',
    },
    {
        id: 2020,
        pId: 202,
        name: '菜单二子孙菜单二',
    },
    {
        id: 3,
        pId: 0,
        name: '菜单三',
    },
]

class Node {
    public id: number = 0
    public label: string = ''
    public isOpen: boolean = false
    public originHeight: number = 0
    public paddingTop: number = 0
    public paddingBottom: number = 0
    public children: Node[] = []
    public parent: Node | null = null
}

const createTreeNode = (
    nodes: TreeNode[],
    padding: {
        top: number
        bottom: number
    },
    id: number = 0,
    key: keyof TreeNode = 'pId',
    parent: Node | null = null
): Node[] =>
    nodes
        .filter((item) => item[key] === id)
        .map((item) => {
            const node = new Node()

            node.id = id
            node.label = item.name
            node.originHeight = 20
            node.paddingTop = padding.top
            node.paddingBottom = padding.bottom
            node.children = createTreeNode(nodes, padding, item.id, key, node)
            node.parent = parent

            return node
        })

const getHeight = (state: boolean, originHeight: number, expandHeight: number): string =>
    state ? expandHeight + 'px' : originHeight + 'px'

type Paramter = string | null
const createElement = (textContent: Paramter, className: Paramter, tag: string = 'div') => {
    const node: HTMLElement = document.createElement(tag)
    if (textContent) setElementText(node, textContent)
    if (className) addClass(node, className)
    return node
}

let originHeight: number

function createTreeDom(treeNodes: Node[], parentNode: HTMLElement, paddingLeft: number = 20, depth: number = 0) {
    const fragment: DocumentFragment = document.createDocumentFragment()

    treeNodes.forEach((item) => {
        const treeItem: HTMLElement = createElement(null, 'treeItem')
        const treeNodeContent: HTMLElement = createElement(null, 'tree-node__content')
        const treeChildren: HTMLElement = createElement(null, 'tree-node__children')

        const treeNodeIcon: HTMLSpanElement = createElement(null, 'tree-node__expand-icon', 'span')
        const treeNodeLabel: HTMLSpanElement = createElement(item.label, 'tree-node__label', 'span')

        treeNodeContent.appendChild(treeNodeIcon)
        treeNodeContent.appendChild(treeNodeLabel)

        treeItem.appendChild(treeNodeContent)
        treeItem.appendChild(treeChildren)

        treeNodeContent.style.padding = `${item.paddingTop}px 0 ${item.paddingBottom}px ${paddingLeft * depth}px`

        if (Array.isArray(item.children) && item.children.length > 0) {
            addClass(treeNodeIcon, 'icon-caret-right')
            createTreeDom(item.children, treeChildren, paddingLeft, ++depth)
            depth--
        }

        fragment.appendChild(treeItem)
    })

    parentNode.appendChild(fragment)
}

const toggle = (node: Node, el: HTMLElement): void => setPreviousParentHeight(el, node)

const setPreviousParentHeight = (el: HTMLElement, node: Node) => {
    let parent: HTMLElement = el.parentNode as HTMLElement
    const currentHeight: number = el.scrollHeight

    node.isOpen = !node.isOpen
    el.style.height = getHeight(node.isOpen, originHeight, currentHeight)

    while (parent !== null) {
        if (hasClass(parent, 'treeItem')) {
            const parentHeight: number = parent!.scrollHeight
            parent!.style.height = getHeight(
                node.isOpen,
                parentHeight - currentHeight + originHeight,
                parentHeight + currentHeight - originHeight
            )
        }
        parent = parent.parentNode as HTMLElement
    }
}

const init = (parentNode: HTMLElement) =>
    Array.from(parentNode.children).forEach((treeItem: any) => {
        treeItem.style.height = `${originHeight}px`
        init(treeItem.lastElementChild)
    })

const getTotalHeight = (...rest: string[]) => {
    const collection: number[] = rest.map((value) =>
        /^\d+px$/g.test(value)
            ? parseInt(value, 10)
            : !isNaN(+value) && +value >= Number.MIN_SAFE_INTEGER && +value <= Number.MAX_SAFE_INTEGER
            ? +value
            : 0
    )

    return collection.reduce((result: number, current: number): number => result + current, 0)
}

type Options = {
    nodes: TreeNode[]
    parentNode: HTMLElement
    paddingLeft?: number
    paddingTop?: number
    paddingBottom?: number
}

const generateTreeMenu = ({ nodes, paddingLeft, parentNode, paddingTop: top, paddingBottom: bottom }: Options) => {
    createTreeDom(createTreeNode(nodes, { top, bottom } as any), parentNode, paddingLeft)
    const { height, paddingTop, paddingBottom } = window.getComputedStyle(
        parentNode.querySelector('.tree-node__content') as HTMLElement,
        null
    )
    originHeight = getTotalHeight(height, paddingTop, paddingBottom)
    init(parentNode)
}

const getParent = (el: HTMLElement, parentNodeClass: string) => {
    let current: HTMLElement = el.parentNode as HTMLElement
    if (hasClass(current, parentNodeClass)) return current
    while (current !== null) {
        if (hasClass(current, parentNodeClass)) return current
        current = current.parentNode as HTMLElement
    }
    return null
}

const traverse = <N extends Node>(nodes: N[], text: string, result: N[], callback?: (item: N) => void): void => {
    for (let i: number = 0; i < nodes.length; i++) {
        if (nodes[i].label === text) {
            result.push(nodes[i])
            break
        }
        if (callback) callback(nodes[i])
    }
}

const getNode = <N extends Node>(nodes: N[], text: string, result: N[] = []): N[] => {
    traverse(nodes, text, result)
    if (!result.length) traverse(nodes, text, result, (item) => getNode(item.children, text, result))
    return result
}

enum TriangleClass {
    TRIANGLE_0_DEG = 'triangle_0deg',
    TRIANGLE_90_DEG = 'triangle_90deg',
}

const triangleRotation = (el: HTMLElement, state: boolean, defaultLength: number = 2) => {
    let values: TriangleClass[] = Object.values(TriangleClass)
    let length: number = values.length
    let classNames: TriangleClass[] = new Array(length)
    values.forEach((item, index) => (classNames[state ? index : --length] = item))
    if (classNames.length > defaultLength) classNames = classNames.slice(0, defaultLength)
    removeClass(el, classNames[0])
    addClass(el, classNames[1])
}

const setTriangleRotation = (el: HTMLElement, node: Node) =>
    triangleRotation(el.firstElementChild?.firstElementChild! as HTMLElement, node.isOpen)

const treeMenuRun = (options: Omit<Options, 'parentNode'>) => {
    const { nodes, paddingLeft = 25, paddingTop = 5, paddingBottom = 5 } = options
    const treeParent: HTMLDivElement = document.getElementById('treeNode') as HTMLDivElement
    const treeNodes = createTreeNode(nodes, { top: paddingTop, bottom: paddingBottom })
    generateTreeMenu({ nodes, paddingLeft, parentNode: treeParent, paddingTop, paddingBottom })

    let previousBackGroundColorEl: HTMLElement
    treeParent.addEventListener('click', (event: Event) => {
        const el: HTMLElement | null = getParent(event.target as HTMLElement, 'treeItem')
        if (el !== null) {
            const backgroundColorEl: HTMLElement = el.firstElementChild as HTMLElement
            const node: Node = getNode(treeNodes, el.firstElementChild?.lastElementChild?.textContent!)[0]

            if (previousBackGroundColorEl) removeClass(previousBackGroundColorEl, 'is-current')
            addClass(backgroundColorEl, 'is-current')

            previousBackGroundColorEl = backgroundColorEl

            toggle(node, el)
            setTriangleRotation(el, node)
        }
    })
}

treeMenuRun({
    nodes,
    paddingLeft: 30,
    paddingTop: 15,
    paddingBottom: 15,
})

const baseRange = (start: number, end: number, step: number, isClosed: boolean, isReverse: boolean = false) => {
    let length: number = Math.max(Math.ceil((end - start) / (step || 1)), 0)
    let index: number = -1

    const result: number[] = new Array(!isClosed ? --length : ++length)

    while (length--) {
        let temp: number = start
        if (!isClosed) temp += step
        result[isReverse ? length : ++index] = temp
        start += step
    }

    return result
}

const isFiniteNumber = (value: number) =>
    typeof value === 'number' && value > Number.MIN_SAFE_INTEGER && value < Number.MAX_SAFE_INTEGER

const createRange = (
    start: number,
    end: number,
    isClosed: boolean,
    step: number | undefined,
    isReverse: boolean = false
) => {
    if (!(isFiniteNumber(start) && isFiniteNumber(end)))
        throw new TypeError('The first or second argument must be a valid number!')
    if (end === undefined) {
        end = start
        start = 0
    }
    step = step === undefined ? (start < end ? 1 : -1) : step
    return baseRange(start, end, step, isClosed, isReverse)
}

/**
 * @param {number} start 起始数字
 * @param {number} end 截止数字
 * @param {number} step 间隔数字(如: begin = 0, end = 10, step = 5, result = [0, 5, 10])
 * @returns {Array} 返回闭区间的所有数字(包括起始数字和结束数字)
 *
 * @example
 * rangeClosed(0, 10) // => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * rangeClosed(-20, -10) // -> [-20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10]
 * rangeClosed(0, 10, 5) // ?> [0, 5, 10]
 */
const rangeClosed = (start: number, end: number, step?: number) => createRange(start, end, true, step)

/**
 * @param {number} start 起始数字
 * @param {number} end 截止数字
 * @param {number} step 间隔数字(如: begin = 0, end = 10, step = 5, result = [5])
 * @returns {Array} 返回开区间的所有数字(不包括起始数字和结束数字)
 *
 * @example
 * rangeOpen(0, 10) // => [1, 2, 3, 4, 5, 6, 7, 8, 9]
 * rangeOpen(-20, -10) // -> [-19, -18, -17, -16, -15, -14, -13, -12, -11]
 * rangeOpen(0, 10, 5) // ?> [5]
 */
const rangeOpen = (start: number, end: number, step?: number) => createRange(start, end, false, step)

// console.log(rangeClosed(-20, -10))
// console.log(rangeClosed(0, 20))
// console.log(rangeClosed(0, 20, 5))
// console.log(rangeOpen(0, 20))
// console.log(rangeOpen(0, 20, 5))
// console.log(rangeOpen(-20, -10))

const getWeekDate = (days: number, isIncludeToday: boolean = false) => {
    const rangeMethod: Function = isIncludeToday ? rangeClosed : rangeOpen
    const begin: number = 0
    const end: number = isIncludeToday ? --days : ++days
    //= 60 * 1000 * 60 * 24 = 86400000 = 8.64 * 10⁷ = 8.64e7
    return rangeMethod(begin, end).map((item: number) => new Date(Date.now() + item * 8.64e7).toLocaleDateString())
}

console.log(getWeekDate(7))

const toDate = (days: number): string =>
    new Date(new Date(new Date().getFullYear(), 0, 1).getTime() + days * 8.64e7).toLocaleDateString()

console.log(toDate(219))

const toHex = ({ r, g, b }: { r: number; g: number; b: number }): string => {
    const INT_HEX_MAP = { 10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F' }
    const hexOne = (value: number): string => {
        value = Math.min(Math.round(value), 255)
        const high = Math.floor(value / 16) as keyof typeof INT_HEX_MAP
        const low = value % 16 as keyof typeof INT_HEX_MAP
        return '' + (INT_HEX_MAP[high] || high) + (INT_HEX_MAP[low] || low)
    }
    if (isNaN(r) || isNaN(g) || isNaN(b)) return ''
    return '#' + hexOne(r) + hexOne(g) + hexOne(b)
}

// 255,182,193
console.log('浅粉红(LightPink)十六进制颜色为: ' + toHex({ r: 255, g: 182, b: 193 }))
