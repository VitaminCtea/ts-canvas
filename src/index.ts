// import { Application } from '@/Application/index'
// import { ApplicationTest } from '@/ApplicationTest'
// import { DrawClock } from '@/demo/DrawClock'
import { hasClass, addClass, removeClass } from '@/util/index'
// import '@/colorPicker/index'
import '@/colorPicker2/index'
import '@/steps/index'
import './style/index.css'
import '@/cascadeSelector/index'
import { Transaction } from '@/transaction/index'

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

const arr = [
    {
        value: 1,
        children: [{
            value: 2,
            children: [{
                value: 3
            }]
        }]
    },
    {
        value: 4,
        children: [{
            value: 5,
            children: [{
                value: 6
            }]
        }]
    }
]

const getValue = (arr: any, val: number, result: any = []) => {
    for (let i: number = 0; i < arr.length; i++) {
        if (arr[i].value === val) {
            result.push(arr[i])
            return result[0]
        }
        getValue(arr[i].children || [], val, result)
    }
    return result[0]
}

console.log(getValue(arr, 5))

// const serial = (taskList: Function[], done: Function) => {
//     const invoke = () => {
//         let used: boolean = false
//         return (...rest: any[]) => {
//             if (used) return
//             used = true
//             const step = taskList.shift()
//             if (step) {
//                 const err = rest.shift()
//                 if (err) done(err)
//                 rest.push(invoke())
//                 step.apply(null, rest)
//                 return
//             }
//             done.apply(null, rest)
//         }
//     }
//     const start = invoke()
//     start()
// }

// const step1 = (next: Function) => setTimeout(() => {
//     console.log(1)
//     next()
// }, 2000)

// const step2 = (next: Function) => setTimeout(() => {
//     console.log(2)
//     next()
// }, 3000)

// const step3 = (next: Function) => setTimeout(() => {
//     console.log(3)
//     next()
// }, 5000)

// serial([ step1, step2, step3 ], (err: any) => {
//     if (err) throw new Error('invoke fail')
//     console.log('complete')
// })

class Stack {
    private stack: any[] = []

    public push(element: any){  
        this.stack.push(element)
    }

    public pop() {
        return this.stack.pop()
    }

    public getTop() {
        return this.stack[this.stack.length - 1]
    }

    public isEmpty(): boolean {
        return this.stack.length === 0
    }

    public getSize() {
        return this.stack.length
    }

    public clear() {
        this.stack.length = 0
        return true
    }

    public traverse(callback: (item: any) => void) {
        while (!this.isEmpty()) {
            callback(this.pop())
        }
    }
}

type Operator = '*' | '/' | '+' | '-' | '(' | ')'

const operatorPriority: { [key in Operator]: { inStack: number, outsideStack: number } } = {
    '*': {
        inStack: 4,
        outsideStack: 3
    },
    '/': {
        inStack: 4,
        outsideStack: 3
    },
    '+': {
        inStack: 2,
        outsideStack: 1
    },
    '-': {
        inStack: 2,
        outsideStack: 1
    },
    '(': {
        inStack: 0,
        outsideStack: 5
    },
    ')': {
        inStack: 5,
        outsideStack: 0
    }
}

const getPriority = (c: string, isPriority1: boolean) => 
    c in operatorPriority ? operatorPriority[c as Operator][isPriority1 ? 'inStack' : 'outsideStack'] : -1

const comparePriority = (c1: string, c2: string) => {
    let c_temp1: number = getPriority(c1, true)
    let c_temp2: number = getPriority(c2, false)

    return c_temp1 < c_temp2 ? -1 : c_temp1 > c_temp2 ? 1 : 0
}

const getCharMethod = (index: number = 0) => (expression: string) => {
    let result: string = ''
    const length: number = expression.length

    while (index < length) {
        const char: string = expression.charAt(index)
        // ? 解决当匹配到小数点时异常(匹配到小数点时，由于.代表任意字符，所以正则表达式测试会为true)
        if (/[+-/*()#]/.test(char) && /[^.]/.test(char)) break
        result += char
        index++
    }

    if (!result && index < length) result = expression.charAt(index++)

    return result
}

const getChar = getCharMethod()

const stackOperation = (obj: { char: string }, expression: string) => {
    return (callback: (element: any) => void) => {
        callback(obj.char)
        obj.char = getChar(expression)
    }
}

const evaluateExpression = (expression: string) => {
    const originExpression: string = expression
    const operatorStack: Stack = new Stack()
    const operandsStack: Stack = new Stack()
    expression = expression.replace(/\s/g, '')
    expression += '#'
    
    operatorStack.push('#')

    let obj: { char: string } = { char: getChar(expression) }

    const invokePushStack = stackOperation(obj, expression)
    const invokePopStack = stackOperation(obj, expression)

    const push = (stack: Stack) => (element: string) => stack.push(element)

    const pushOperatorFunc = push(operatorStack)
    const pushOperandsFunc = push(operandsStack)

    while (obj.char !== '#' || operatorStack.getTop() !== '#') {
        
        // ? 检测是不是+-*/()#这些字符，如果不是则说明是操作数，进入操作数栈，然后获取下一个字符。
        if (/[^+-/*()#]/.test(obj.char)) {
            invokePushStack(pushOperandsFunc)
            continue
        }

        /** 
         * % 运算符处理
         * $ 通过比较栈顶运算符和当前运算符的优先级，决定是否入栈和出栈操作。外部优先级大于内部优先级外部运算符进栈，小于则内部运算符出栈
         * # 优先级相等只有一种情况，运算符栈内的左括号优先级和当前字符的右括号优先级相匹配。这时需要将运算符栈的栈顶出栈(左括号出栈)，
         * # 当前运算符不进栈，然后获取下一个字符，如果是运算符的话，则接着比较优先级。
         * & 当运算符栈顶的运算符优先级大于当前运算符优先级时，则表明需要运算，运算符栈顶出栈，
         * & 接着操作数栈出栈两次，得到两个操作数和一个运算符，利用eval或new Function动态函数对字符串表达式进行求值，得到的结果进入操作数栈。
        */
        switch (comparePriority(operatorStack.getTop(), obj.char)) {
            case -1: invokePushStack(pushOperatorFunc); break
            case 0: invokePopStack(() => operatorStack.pop()); break
            case 1:
                const operator: string = operatorStack.pop()
                const num1: string = operandsStack.pop()
                const num2: string = operandsStack.pop()
                pushOperandsFunc(Function(`return ${ (num2 + operator + num1).toString() }`)())
                break
        }
    }

    const result = operandsStack.pop()

    return {
        result,
        expressionResults: `${ originExpression } = ${ result }`
    }
}

console.log(evaluateExpression('3 * 15 / 5 + 90 / 3 - 100 + 20 * 30 + 999 * 1.81'))

// ? 返回 [ low, high )
const uniform = (low: number, high: number): number => low + Math.floor(Math.random() * (high - low))

console.log(uniform(1, 5))

// & 二分查找
const rank = (key: number, array: number[], low: number, high: number): number => {
    if (low > high) return -1

    const middle: number = low + ((high - low) >> 1)

    if (key < array[middle]) return rank(key, array, low, middle - 1)
    else if (key > array[middle]) return rank(key, array, middle + 1, high)

    return middle
}

const binarySearch = (key: number, array: number[]): number => {
    const orderlyArray: number[] = array.sort((a: number, b: number) => a - b)
    return rank(key, orderlyArray, 0, orderlyArray.length - 1)
}

const binarySearchTestArray: number[] = [ 8, 4, 1, 6, 2, 3, 10, 88, 34 ]

console.log(binarySearch(3, binarySearchTestArray))

const swapPosition = (array: number[], i: number, j: number) => ([ array[i], array[j] ] = [ array[j], array[i] ])
const isLess = (a: number, b: number): boolean => a < b

const shellSort = (arr: number[]) => {
    const length: number = arr.length

    for (let gap: number = Math.floor(length / 2); gap > 0; gap = Math.floor(gap / 2))     // & 希尔排序(增量分组)
        for (let i: number = gap; i < length; i++)  // = 对每组进行排序(交替)
            for (let j: number = i - gap; j >= 0 && isLess(arr[j + gap], arr[j]); j -= gap) // ? 插入排序(在对基本有序数组进行排序时，效率较高)
                swapPosition(arr, j + gap, j)

    return arr
}

console.log(shellSort([ 8, 4, 1, 6, 2, 3, 10, 88, 34, 0, 11, 22, -1 ]))

// ? 归并排序(优化版)
const sort = (src: number[], target: number[], low: number, high: number) => {
    const mid: number = low + ((high - low) >> 1)
    const CUTOFF: number = 7

    if (high - low <= CUTOFF) { // - 对于大部分有序、小数组进行插入排序性能较好
        insertSort(target, low, high)
        return
    }

    sort(src, target, low, mid)
    sort(src, target, mid + 1, high)

    if (isLess(src[mid], src[mid + 1])) {
        target = Array.from({ length: high - low + 1 }, (v, i) => src[i])
        return
    }

    merge(src, target, low, mid, high)
}

const merge = (src: number[], target: number[], low: number, mid: number, high: number) => {
    let i: number = low
    let j: number = mid + 1
    
    for (let k: number = low; k <= high; k++) {
        if (i > mid) target[k] = src[j++]
        else if (j > high) target[k] = src[i++]
        else if (isLess(src[j], src[i])) target[k] = src[j++]
        else target[k] = src[i++]
    }
}

const insertSort = (arr: number[], low: number, high: number) => {
    for (let i: number = low; i <= high; i++)
        for (let j: number = i; j > 0 && isLess(arr[j], arr[j - 1]); j--)
            swapPosition(arr, j, j - 1)
}

const mergeSort = (arr: number[]) => {
    const copy: number[] = arr.slice(0)
    sort(arr, copy, 0, arr.length - 1)
    return copy
}

console.log(mergeSort([ 8, 4, 1, 6, 2, 3, 10, 88, 34, 0, 11, 22, -1 ]))

const partition = (arr: number[], low: number, high: number) => {
    let i: number = low
    let j: number = high + 1
    const v: number = arr[low]
    while (true) {
        while (isLess(arr[++i], v)) if (i === high) break
        while (isLess(v, arr[--j])) if (j === low) break
        if (i >= j) break
        swapPosition(arr, i, j)
    }
    swapPosition(arr, low, j)
    return j
}

const quickMainSort = (arr: number[], low: number, high: number) => {
    const INSERTION_SORT_CUTOFF: number = 8

    if (high - low + 1 < INSERTION_SORT_CUTOFF) {
        insertSort(arr, low, high)
        return
    }

    const segmentation: number = partition(arr, low, high)
    quickMainSort(arr, low, segmentation - 1)
    quickMainSort(arr, segmentation + 1, high)
}

const quick3way = (arr: number[], low: number, high: number) => {
    if (high <= low) return

    let lt: number = low
    let i: number = low + 1
    let gt: number = high

    while (i <= gt) {
        const cmp: number = arr[i] - arr[lt]
        if (cmp < 0) swapPosition(arr, lt++, i++)
        else if (cmp > 0) swapPosition(arr, i, gt--)
        else i++
    }

    quick3way(arr, low, lt - 1)
    quick3way(arr, gt + 1, high)
}

const quickSort = (arr: number[]) => {
    quick3way(arr, 0, arr.length - 1)
    return arr
}

console.log(quickSort([ 8, 4, 1, 1, 1, 2, 6, 2, -1 ]))

// ? 最大优先队列
class MaxPQ<K> {
    private priorityQueue: K[] = []
    private len: number = 0

    public insert(element: K): void {
        this.priorityQueue[++this.len] = element
        this.swim(this.len)
    }

    public insertKeys(keys: K[]): void {
        const len: number = keys.length
        keys.forEach(key => this.priorityQueue[++this.len] = key)
        for (let parentIndex: number = ~~(len / 2); parentIndex >= 1; parentIndex--) 
            this.sink(parentIndex)
    }

    public swim(childIndex: number): void {
        let parentIndex: number = ~~(childIndex / 2)
        while (parentIndex > 1 && this.less(parentIndex, childIndex)) {
            this.swap(childIndex, parentIndex)
            parentIndex = ~~(parentIndex / 2)
        }
    }

    public sink(parentIndex: number): void {
        while (2 * parentIndex <= this.len) {
            let childIndex: number = 2 * parentIndex
            if (childIndex < this.len && this.less(childIndex, childIndex + 1)) childIndex++
            if (!this.less(parentIndex, childIndex)) break
            this.swap(parentIndex, childIndex)
            parentIndex = childIndex
        }
    }

    public delMax(): K {
        const max: K = this.priorityQueue[1]
        this.swap(1, this.len--)
        this.sink(1)
        return max
    }

    public less(i: number, j: number): boolean {
        const queue: K[] = this.priorityQueue
        return queue[i] < queue[j]
    }

    public swap(i: number, j: number): void {
        const queue: K[] = this.priorityQueue
        ;[queue[i], queue[j]] = [queue[j], queue[i]]
    }

    public isEmpty(): boolean {
        return this.len === 0
    }

    public size(): number {
        return this.len
    }
}

const maxPQ: MaxPQ<number> = new MaxPQ<number>()
maxPQ.insertKeys([30, 5, 1, 6, 10, 11, 2, 0])

console.log(maxPQ.delMax())
console.log(maxPQ)

const getType = (type: string) => (val: string) => {
    const code: number = type.charCodeAt(0)
    if (code >= 97 && code <= 122) type = type.charAt(0).toUpperCase() + type.substring(1)
    return Object.prototype.toString.call(val) === `[object ${ type }]`
}

const isString: Function = getType('String')

// % 索引优先队列
class IndexMinPQ<T> {
    private maxCapacity: number = 0
    private n: number = 0    // & 索引的个数
    private pq: number[]    // ? 保存索引
    private qp: number[]    // & 保存pq的逆序的二叉堆(qp[i]的值是i在pq[]中的位置(即：索引k -> pq[k] = i))
    private keys: (T | null)[]   // - 保存元素

    public constructor(maxCapacity: number) {
        if (maxCapacity < 0) throw new RangeError('maxCapacity must be a positive integer')
        this.maxCapacity = maxCapacity
        this.keys = new Array(maxCapacity)
        this.pq = new Array(maxCapacity + 1)
        this.qp = new Array(maxCapacity)
        for (let i: number = 0; i <= maxCapacity; i++) 
            this.qp[i] = -1
    }

    public insert(index: number, val: T): void {
        if (this.contains(index)) throw new Error('index is already in the priority queue')
        this.n++
        this.qp[index] = this.n
        this.pq[this.n] = index
        this.keys[index] = val
        this.swim(this.n)    // # 插入则需要上浮操作，上浮到合适的位置(相对于子节点)
    }
    
    public delMin(): number {
        this.checkInvalidIndex()
        const min: number = this.pq[1]
        this.exch(1, this.n--)
        this.sink(1)    // $ 交换元素后最后的叶节点在first处，此时需要下沉操作(相当于父节点)
        // * 下沉操作结束之后，需要将删除掉的索引还原(即：-1)
        this.qp[min] = -1
        this.pq[this.n + 1] = -1
        return min  // ? 返回删除掉的索引
    }

    public keyOf(index: number): T | null {
        this.checkNoIndexExists(index)
        return this.keys[index]
    }

    public decreaseKey(index: number, val: T): void {
        this.controlKey(index, val, 'decreaseKey', compare => compare < 0)
    }

    public increaseKey(index: number, val: T): void {
        this.controlKey(index, val, 'increaseKey', compare => compare > 0)
    }

    private controlKey(index: number, val: T, methodName: string, isGreater: (compare: number) => boolean): void {
        if (!this.contains(index)) throw new RangeError('index is not in the priority queue')

        const compareResult: number = this.compareTo(this.keys[index]!, val)

        if (compareResult === 0)
            throw new Error(`Calling ${ methodName }() with a key equal to the key in the priority queue`)

        if (isGreater(compareResult)) 
            throw new Error(`Calling ${ methodName }() with a key strictly greater than the key in the priority queue`)

        this.keys[index] = val
        compareResult < 0 ? this.sink(this.qp[index]) : this.swim(this.qp[index])
    }

    public delete(i: number): boolean {
        this.checkNoIndexExists(i)
        const index: number = this.qp[i]
        this.exch(index, this.n--)
        this.swim(index)
        this.sink(index)
        this.keys[i] = null
        this.qp[i] = -1
        return true
    }

    public change(index: number, key: T): void {
        this.changeKey(index, key)
    }

    private changeKey(index: number, key: T): void {
        this.checkNoIndexExists(index)
        this.keys[index] = key
        this.swim(this.qp[index])
        this.sink(this.qp[index])
    }

    private exch(i: number, j: number): void {
        [this.pq[i], this.pq[j]] = [this.pq[j], this.pq[i]]
        this.qp[this.pq[i]] = i
        this.qp[this.pq[j]] = j
    }

    private swim(k: number): void {
        while (k > 1 && this.greater(k / 2 | 0, k)) {
            this.exch(k, k / 2 | 0)
            k = k / 2 | 0
        }
    }

    private sink(parentIndex: number): void {
        while (2 * parentIndex <= this.n) {
            // ? 如果索引是以0开始的话，那么获取节点下的左节点应该是2 * parentIndex + 1, 右节点是2 * parentIndex + 2
            // = 因为这里的起始索引是1，所以直接用2 * parentIndex即可获取当前节点下的左子节点
            // $ 即: K节点的子节点位于2k和2k + 1位置
            let childIndex: number = 2 * parentIndex
            // & 如果当前节点的左节点比当前右节点大，则取右节点(即: 取最小!!)
            if (childIndex < this.n && this.greater(childIndex, childIndex + 1)) childIndex++
            if (!this.greater(parentIndex, childIndex)) break
            this.exch(parentIndex, childIndex)
            parentIndex = childIndex
        }
    }

    private greater(i: number, j: number): boolean {
        return this.compareTo(this.keys[this.pq[i]]!, this.keys[this.pq[j]]!) > 0
    }

    private compareTo(a: T, b: T): number {
        if (isString(a) && isString(b)) return (a as any).localeCompare(b as any)
        return a < b ? -1 : a > b ? 1 : 0
    }

    private checkInvalidIndex(): void | never {
        if (this.n === 0) throw new RangeError('Priority queue underflow')
    }

    private checkNoIndexExists(index: number): void | never {
        if (!this.contains(index)) throw new RangeError('index is not in the priority queue')
    }

    public getMinIndex(): never | number {
        this.checkInvalidIndex()
        return this.pq[1]
    }

    public getMinKey(): never | T | null {
        this.checkInvalidIndex()
        return this.keys[this.pq[1]]
    }

    public size(): number {
        return this.n
    }

    public contains(i: number): boolean {
        return this.qp[i] !== -1
    }

    public isEmpty(): boolean {
        return this.n === 0
    }
}

const createIndexMinPQ = () => {
    // ? insert a bunch of strings
    const strings: string[] = [ 'it', 'was', 'the', 'best', 'of', 'times', 'it', 'was', 'the', 'worst' ]
    const indexMinPQ: IndexMinPQ<string> = new IndexMinPQ(strings.length)

    for (let i: number = 0; i < strings.length; i++) 
        indexMinPQ.insert(i, strings[i])

    // & delete and print each key
    while (!indexMinPQ.isEmpty()) {
        const i: number = indexMinPQ.delMin()
        console.log(i + ' ' + strings[i])
    }
}

createIndexMinPQ()

// ? 二叉查找树
class BinaryTreeNode<K, V> {
    public key: K
    public val: V
    public left: BinaryTreeNode<K, V> | null = null
    public right: BinaryTreeNode<K, V> | null = null
    public N: number

    public constructor (key: K, val: V, N: number) {
        this.key = key
        this.val = val
        this.N = N
    }
}

class BST<K, V> {
    private root: BinaryTreeNode<K, V> | null = null

    public getSize(): number {
        return this.size(this.root!)
    }

    private size(node: BinaryTreeNode<K, V>): number {
        if (node == null) return 0
        return node.N
    }

    public getVal(key: K): V | null {
        return this.baseGetVal(this.root!, key)
    }

    private baseGetVal(node: BinaryTreeNode<K, V>, key: K): V | null {
        if (node == null) return null

        const cmp: number = this.compareTo(key, node.key)
        
        if (cmp < 0) return this.baseGetVal(node.left!, key)
        else if (cmp > 0) return this.baseGetVal(node.right!, key)
        else return node.val
    }

    public put(key: K, val: V): void {
        this.root = this.insert(this.root!, key, val)
    }

    private insert(node: BinaryTreeNode<K, V>, key: K, val: V): BinaryTreeNode<K, V> {
        if (node == null) return new BinaryTreeNode(key, val, 1)

        const cmp: number = this.compareTo(key, node.key)

        if (cmp < 0) node.left = this.insert(node.left!, key, val)
        else if (cmp > 0) node.right = this.insert(node.right!, key, val)
        else this.updateVal(node, val)

        node.N = this.size(node.left!) + this.size(node.right!) + 1
        return node
    }

    private updateVal(node: BinaryTreeNode<K, V>, newVal: V): boolean {
        return !!(node.val = newVal)
    }

    public getMinKey(): K {
        return this.baseGetMinKey(this.root!).key
    }

    public getMaxKey(): K {
        return this.baseGetMaxKey(this.root!).key
    }

    private baseGetMinKey(node: BinaryTreeNode<K, V>): BinaryTreeNode<K, V> {
        if (node.left == null) return node
        return this.baseGetMinKey(node.left!)
    }

    private baseGetMaxKey(node: BinaryTreeNode<K, V>): BinaryTreeNode<K, V> {
        if (node.right == null) return node
        return this.baseGetMaxKey(node.right!)
    }

    public floor(key: K): K | never {
        return this.baseRound(key, 'baseFloor', 'floor')
    }

    public ceiling(key: K): K | never {
        return this.baseRound(key, 'baseCelling', 'celling')
    }

    private baseRound(key: K, methodName: 'baseFloor' | 'baseCelling', errorFuncName: 'floor' | 'celling') {
        if (key == null) throw new TypeError(`argument to ${ errorFuncName }() is null`)
        if (this.isEmpty()) throw new Error(`calls ${ errorFuncName }() with empty symbol table`)
        const node: BinaryTreeNode<K, V> | null = this[methodName](this.root!, key)
        if (node == null) throw new RangeError(`argument to ${ errorFuncName }() is too large`)
        return node.key
    }

    private baseFloor(node: BinaryTreeNode<K, V>, key: K): BinaryTreeNode<K, V> | null {
        return this.baseHandle(node, key, false)
    }

    private baseCelling(node: BinaryTreeNode<K, V>, key: K): BinaryTreeNode<K, V> | null {
        return this.baseHandle(node, key)
    }

    private baseHandle(node: BinaryTreeNode<K, V>, key: K, isCelling: boolean = true): BinaryTreeNode<K, V> | null {
        if (node == null) return null
        const cmp: number = this.compareTo(key, node.key)
        if (cmp === 0) return node
        // & 如果是floor并且cmp < 0时，向左子树查找
        // ? 否则如果是celling并且cmp > 0时，向右子树查找
        if (isCelling ? cmp > 0 : cmp < 0) return this.baseHandle(isCelling ? node.right! : node.left!, key, isCelling)
        // $ 剩余情况
        const t: BinaryTreeNode<K, V> | null = this.baseHandle(isCelling ? node.left! : node.right!, key, isCelling)
        if (t != null) return t
        return node
    }

    public select(rankIndex: number): K | null {
        if (rankIndex > this.root?.N! - 1) return null
        const result: BinaryTreeNode<K, V> | null = this.baseSelect(this.root!, rankIndex)
        if (result) return result.key
        return null
    }

    /**
     * @param node { BinaryTreeNode<K, V> }根节点
     * @param rankIndex { number } 要查找键的排名
     * @returns { BinaryTreeNode<K, V> } 成功找到的节点
     * $ explain: 
     * & Node: 注意事项就是必须满足rankIndex >= n，由于根节点上的节点数量N包括根节点在内，所以要进行减1操作
     * = 1. 如果左子树中的节点数 n 大于 k，则继续(递归地)在左子树中查找排名为 k 的键
     * - 2. 如果 n 等于 k，则返回根节点中的键
     * % 3. 如果 n 小于 k，则递归的在右子树中查找排名为( k - n - 1 )的键
     */
    private baseSelect(node: BinaryTreeNode<K, V>, rankIndex: number): BinaryTreeNode<K, V> | null {
        if (node == null) return null
        const n: number = this.size(node.left!)
        if (n > rankIndex) return this.baseSelect(node.left!, rankIndex)
        else if (n < rankIndex) return this.baseSelect(node.right!, rankIndex - n - 1)
        return node
    }

    public rank(key: K): number {
        return this.baseRank(key, this.root!)
    }

    /**
     * @param key { K } 要查询的键
     * @param node { BinaryTreeNode<K, V> } 根节点
     * @returns { number } 排名
     * $ explain: 
     * = 1. 如果给定的键和根节点的键相等，则返回左子树中的节点总数
     * - 2. 如果给定的键小于根节点，则返回该键在左子树中的排名(递归计算)
     * % 3. 如果给定的键大于根节点，则返回1 + 该键的左子树中的深度 + 该键的右子树中的排名(递归计算)
     */
    private baseRank(key: K, node: BinaryTreeNode<K, V>): number {
        if (node == null) return 0
        const cmp: number = this.compareTo(key, node.key)
        if (cmp < 0) return this.baseRank(key, node.left!)
        else if (cmp > 0) return 1 + this.size(node.left!) + this.baseRank(key, node.right!)
        return this.size(node.left!)
    }

    public deleteMin(): void {
        this.root = this.baseDeleteMin(this.root!)
    }

    public deleteMax(): void {
        this.root = this.baseDeleteMax(this.root!)
    }
    
    private baseDeleteMax(node: BinaryTreeNode<K, V>): BinaryTreeNode<K, V> {
        return this.baseDeleteBoundaryKey(node, 'right', 'left')
    }

    private baseDeleteMin(node: BinaryTreeNode<K, V>): BinaryTreeNode<K, V> {
        return this.baseDeleteBoundaryKey(node, 'left', 'right')
    }

    private baseDeleteBoundaryKey<T extends 'left' | 'right'>(node: BinaryTreeNode<K, V>, recursionSubtree: T, returnSubtree: T): BinaryTreeNode<K, V> {
        if (node[recursionSubtree] == null) return node[returnSubtree]!
        node[recursionSubtree] = this.baseDeleteBoundaryKey(node[recursionSubtree]!, recursionSubtree, returnSubtree)
        node.N = this.size(node.left!) + this.size(node.right!) + 1
        return node
    }

    public delete(key: K): void {
        this.root = this.baseDelete(this.root!, key)
    }

    private baseDelete(node: BinaryTreeNode<K, V>, key: K): BinaryTreeNode<K, V> | null {
        if (node == null) return null
        const cmp: number = this.compareTo(key, node.key)
        if (cmp < 0) node.left = this.baseDelete(node.left!, key)
        else if (cmp > 0) node.right = this.baseDelete(node.right!, key)
        else {
            if (node.right == null) return node.left
            if (node.left == null) return node.right
            const t: BinaryTreeNode<K, V> = node
            // ? 这里必须得取右子树的最小值，因为直接取该节点的左子树的最小节点，则不满足二叉树性质(即: 左子树永远都比根节点小)
            node = this.baseGetMinKey(t.right!)
            // % 取到最小节点之后，则删除掉这个节点，因为右子树中的最小节点现已成为了根节点，所以要把原来的位置删除掉
            node.right = this.baseDeleteMin(t.right!)
            // # 删除掉的节点的左节点直接赋值给新的根节点左子树就可以
            node.left = t.left
        }
        node.N = this.size(node.left!) + this.size(node.right!) + 1
        return node
    }

    public getRangeKeys(): Array<K> {
        const queue: Array<K> = []
        this.baseGetRangeKeys(this.root!, queue, this.getMinKey(), 'F')
        return queue
    }

    private baseGetRangeKeys(node: BinaryTreeNode<K, V>, queue: K[], low: K | string, high: K | string): void {
        if (node == null) return
        const cmpLow: number = this.compareTo(node.key, low as K)
        const cmpHigh: number = this.compareTo(node.key, high as K)
        this.baseGetRangeKeys(node.left!, queue, low, high)
        if (cmpLow >= 0 && cmpHigh <= 0) queue.push(node.key)   // * 搜索到的key在指定范围内则入栈
        this.baseGetRangeKeys(node.right!, queue, low, high)
    }

    private compareTo(a: K, b: K): number {
        if (isString(a) && isString(b)) return (a as any).localeCompare(b as any)
        return a < b ? -1 : a > b ? 1 : 0
    }

    public isEmpty(): boolean {
        return this.size(this.root!) === 0
    }
}

const bst: BST<string, number> = new BST()

bst.put('S', 3)
bst.put('E', 6)
bst.put('X', 100)
bst.put('A', 10)
bst.put('C', 8)
bst.put('R', 2)
bst.put('H', 22)
bst.put('M', 9)

console.log(bst)
console.log('S is rounded down to: ' + bst.floor('S'))
console.log('G is rounded down to: ' + bst.floor('G'))
console.log('G is rounded up to: ' + bst.ceiling('G'))
console.log('二叉查找树最小值为: ' + bst.getMinKey())
console.log('键为A的值为: ' + bst.getVal('A'))

console.log('排名第一位的是: ' + bst.select(0))
console.log('排名第二位的是: ' + bst.select(1))
console.log('排名第三位的是: ' + bst.select(2))
console.log('排名第四位的是: ' + bst.select(3))
console.log('排名第五位的是: ' + bst.select(4))
console.log('排名第六位的是: ' + bst.select(5))
console.log('排名第七位的是: ' + bst.select(6))
console.log('排名第八位的是: ' + bst.select(7))

console.log('键为S的排名为: ' + bst.rank('S'))
console.log('键为E的排名为: ' + bst.rank('E'))
console.log('键为X的排名为: ' + bst.rank('X'))
console.log('键为A的排名为: ' + bst.rank('A'))
console.log('键为C的排名为: ' + bst.rank('C'))
console.log('键为R的排名为: ' + bst.rank('R'))
console.log('键为H的排名为: ' + bst.rank('H'))
console.log('键为M的排名为: ' + bst.rank('M'))

// bst.delete('E')
console.log(bst.getRangeKeys())

class RedBlackNode<K, V> {
    public key: K
    public val: V
    public left: RedBlackNode<K, V> | null = null
    public right: RedBlackNode<K, V> | null = null
    public color: boolean
    public size: number

    public constructor(key: K, val: V, N: number, color: boolean) {
        this.key = key
        this.val = val
        this.size = N
        this.color = color
    }
}

class RedBlackBST<K, V> {
    private root: RedBlackNode<K, V> | null = null
    private static RED: boolean = true
    private static BLACK: boolean = false

    public put(key: K, val: V): void {
        this.root = this.insert(this.root, key, val)
        this.root!.color = RedBlackBST.BLACK
    }

    private insert<T extends RedBlackNode<K, V>>(node: T | null, key: K, val: V): T {
        if (node == null) return new RedBlackNode(key, val, 1, RedBlackBST.RED) as T

        const cmp: number = this.compareTo(key, node.key)

        if (cmp < 0) node.left = this.insert(node.left, key, val)
        else if (cmp > 0) node.right = this.insert(node.right, key, val)
        else node.val = val

        /** 
         * ? 当左链接是黑色并且右链接是红色时，需要左旋
         * & 当左链接是红色并且左链接的左子链接也是红色时，需要右旋
         * $ 当左链接和右链接同时为红色时，需要交换颜色
        */
       if (this.isRed(node.right!) && !this.isRed(node.left!)) node = this.rotateLeft(node)
       if (this.isRed(node.left!) && this.isRed(node.left!.left!)) node = this.rotateRight(node)
       if (this.isRed(node.left!) && this.isRed(node.right!)) this.flipColors(node)

        node.size = this.computedSize(node)

        return node
    }

    public rotateLeft<T extends RedBlackNode<K, V>>(node: T): T {
        return this.rotate(node, 'right', 'left')
    }

    public rotateRight<T extends RedBlackNode<K, V>>(node: T): T {
        return this.rotate(node, 'left', 'right')
    }

    private rotate<T extends 'left' | 'right', R extends RedBlackNode<K, V>>(node: R, chooseSubtree: T, rotateSubtree: T): R {
        const rotateNode: RedBlackNode<K, V> = node[chooseSubtree]!

        node[chooseSubtree] = rotateNode[rotateSubtree]
        rotateNode[rotateSubtree] = node
        rotateNode.color = node.color
        node.color = RedBlackBST.RED
        rotateNode.size = node.size
        node.size = this.computedSize(node)

        return rotateNode as R
    }

    public delete(key: K): void {
        if (key === null) throw new RangeError('argument to delete() is null')
        if (!this.contains(key)) return
        if (!this.isRed(this.root!.left!) && !this.isRed(this.root!.right!)) this.root!.color = RedBlackBST.RED
        this.root = this.baseDelete(this.root!, key)
        if (!this.isEmpty()) this.root!.color = RedBlackBST.BLACK
    }

    private baseDelete<T extends RedBlackNode<K, V>>(node: T, key: K): T | null {
        if (this.compareTo(key, node.key) < 0) {
            if (!this.isRed(node.left!) && !this.isRed(node.left!.left!))
                node = this.moveRedLeft(node)
            node.left = this.baseDelete(node.left!, key)
        } else {
            if (this.isRed(node.left!)) node = this.rotateRight(node)
            if (this.compareTo(key, node.key) === 0 && (node.right == null)) return null
            if (!this.isRed(node.right!) && !this.isRed(node.right!.left!)) node = this.moveRedRight(node)
            if (this.compareTo(key, node.key) === 0) {
                const minNode: T = this.min(node.right!) as T
                node.key = minNode.key
                node.val = minNode.val
                node.right = this.baseDeleteMin(node.right!)
            } else node.right = this.baseDelete(node.right!, key)
        }
        return this.balance(node)
    }

    private moveRedLeft<T extends RedBlackNode<K, V>>(node: T): T {
        this.flipColors(node)
        /**
         * = 如果当前节点的右节点下的左节点是红色，则说明当前节点的右节点是一个3-节点树，不是普通的2-节点树，此时如果当前节点的左节点是一个2-节点树的话
         * - 那么需要从当前节点下的右节点借出一个节点来插入到当前节点的左子树中，这时，如果寻找到了这个要删除的值的时候，已经变成3-节点树
         * & 所以删除一个节点(键)之后还会剩一个，满足红黑树的平衡。否则会导致红黑树的不平衡，导致会影响红黑树性质5
         * ? 即: 从任意叶子节点(null)到根节点所有路径上的黑节点相等!
         */
        // ! 需要注意的是: 节点的左右子树中的链接，只有左子树的链接可能是红色的。 所以兄弟节点有多个键时只能左链接是红色!
        if (this.isRed(node.right!.left!)) {
            // % 旋转完成之后返回的是新的node.right节点，所以要更新之前node.right的节点
            node.right = this.rotateRight(node.right!)
            // $ 继续左旋，返回上面旋转完成之后的node.right节点
            node = this.rotateLeft(node)
            // # 接着由于之前更改了原来节点树的颜色，所以这一步要还原一下，符合二叉树的规则
            this.flipColors(node)
        }
        return node
    }

    // * 逻辑同moveRedLeft函数(叶节点为null的节点为红色时，则直接删除即可，不影响红黑树性质！当删除的是一个黑色节点时，就得需要修复，因为红黑树性质5)
    private moveRedRight<T extends RedBlackNode<K, V>>(node: T): T {
        this.flipColors(node)
        if (this.isRed(node.left!.left!)) {
            node = this.rotateRight(node)
            this.flipColors(node)
        }
        return node
    }

    public min<T extends RedBlackNode<K, V>>(node: T): T {
        if (node.left == null) return node
        return this.min(node.left!) as T
    }

    public deleteMin(): void {
        if (this.isEmpty()) throw new Error('BST underflow')
        if (!this.isRed(this.root!.left!) && !this.isRed(this.root!.right!)) this.root!.color = RedBlackBST.RED
        this.root = this.baseDeleteMin(this.root!)
        if (!this.isEmpty()) this.root!.color = RedBlackBST.BLACK
    }

    private baseDeleteMin<T extends RedBlackNode<K, V>>(node: T): T | null {
        if (node.left == null) return null
        // ? 意味着 node 的左子节点为一个2节点
        if (!this.isRed(node.left!) && !this.isRed(node.left!.left!)) node = this.moveRedLeft(node)
        node.left = this.baseDeleteMin(node.left!)
        return this.balance(node)
    }

    private balance<T extends RedBlackNode<K, V>>(node: T): T {
        if (this.isRed(node.right!)) node = this.rotateLeft(node)
        if (this.isRed(node.left!) && this.isRed(node.left!.left!)) node = this.rotateRight(node)
        if (this.isRed(node.left!) && this.isRed(node.right!)) this.flipColors(node)
        node.size = this.computedSize(node)
        return node
    }

    public flipColors(node: RedBlackNode<K, V>): void {
        node.color = !node.color
        node.left!.color = !node.left!.color
        node.right!.color = !node.right!.color
    }

    private computedSize(node: RedBlackNode<K, V>): number {
        return 1 + this.size(node.left!) + this.size(node.right!)
    }

    private contains(key: K): boolean {
        return this.getVal(key, this.root!) != null
    }

    private getVal(key: K, node: RedBlackNode<K, V>): V | null {
        if (node == null) return null
        const cmp: number = this.compareTo(key, node.key)
        if (cmp < 0) return this.getVal(key, node.left!)
        else if (cmp > 0) return this.getVal(key, node.right!)
        else return node.val
    }

    public isEmpty(): boolean {
        return this.root == null
    }

    public size(node: RedBlackNode<K, V>): number {
        if (node == null) return 0
        return node.size
    }

    private compareTo(a: K, b: K): number {
        if (isString(a) && isString(b)) return (a as any).localeCompare(b as any)
        return a < b ? -1 : a > b ? 1 : 0
    }

    private isRed(node: RedBlackNode<K, V>): boolean {
        if (node == null) return false
        return node.color === RedBlackBST.RED
    }
}

const redBlackBST: RedBlackBST<string, number> = new RedBlackBST()

redBlackBST.put('A', 8)
redBlackBST.put('C', 4)
redBlackBST.put('E', 12)
redBlackBST.put('H', 5)
redBlackBST.put('L', 11)
redBlackBST.put('M', 9)
redBlackBST.put('P', 10)
redBlackBST.put('R', 3)
redBlackBST.put('S', 0)
redBlackBST.put('X', 7)

// redBlackBST.delete('E')

console.log(redBlackBST)

class BagNode<V> {
    public item: V | null = null
    public next: BagNode<V> | null = null
}

class Bag<V> {
    public first: BagNode<V> | null = null
    private n: number = 0

    public isEmpty(): boolean {
        return this.first === null
    }

    public size(): number {
        return this.n
    }

    public add(item: V): void {
        const oldFirst: BagNode<V> | null = this.first
        this.first = new BagNode()
        this.first.item = item
        this.first.next = oldFirst
        this.n++
    }

    public search(item: V): BagNode<V> | null {
        if (this.isEmpty()) return null
        let current: BagNode<V> | null = this.first
        while (current) {
            if (current.item === item) return current
            current = current.next
        }
        return null
    }

    public traverse(callback: (item: any) => any) {
        let current: BagNode<V> | null = this.first
        while (current) {   
            callback(current)
            current = current.next
        }
    }
}

class G {
    public print(title: string, color: string = 'white', callback?: (w: any) => string): void {
        console.group(`%c${ title }`, `color: ${ color }`)
        console.log(`${ (this as any).V } vertex, ${ (this as any).E } edges`)

        for (let v: number = 0; v < (this as any).V; v++) {
            const r: string[] = []
            r[r.length] = `${ v }:`
            ;(this as any).getAdj(v).traverse((w: any) => {
                if (callback) r[r.length] = callback(w)
                else r[r.length] = w.item + ''
            })
            console.log(r.join(' '))
        }

        console.groupEnd()
    }

    private validateVertex(v: number): void | never {
        if (v < 0 || v > (this as any).V)
            throw new RangeError(`vertex ${ v } is not between 0 and ${ length - 1 }`)
    }
}

class Graph extends G {
    private V: number = 0
    private E: number = 0
    private adj: Bag<any>[] = []

    public constructor(V: number | Graph) {
        super()
        if (typeof V === 'number') {
            this.validateVal(V)
            this.V = V
            this.initAllAdjacentVertices(V)
        } else if (V instanceof Graph) {
            const G: Graph = V
            this.V = G.getV()
            this.E = G.getE()
            this.validateVal(this.V)
            this.initAllAdjacentVertices(this.V)
            for (let i: number = 0; i < this.V; i++) {
                const reverse: Stack = new Stack()
                let current: Bag<any> | null = G.adj[i]
                current.traverse(current => reverse.push(current))
                reverse.traverse(() => this.adj[i].add(current))
            }
        }
    }

    public initAllAdjacentVertices(V: number) {
        for (let i: number = 0; i < V; i++) this.adj[i] = new Bag()
    }

    private validateVal(V: number): void | never {
        if (V < 0) throw new RangeError('Number of vertices must be nonnegative')
    }

    public addEdge(v: number, w: number) {
        (this as any).validateVertex(v)
        ;(this as any).validateVertex(w)
        this.adj[v].add(w)
        this.adj[w].add(v)
        this.E++
    }

    public degree(v: number) {
        (this as any).validateVertex(v)
        return this.adj[v].size()
    }

    public toString(): string {
        let result: string = `${ this.V } vertices, ${ this.E } edges\n`
        for (let i: number = 0; i < this.V; i++) {
            result += i + ': '
            this.adj[i].traverse((current) => result += current.item + ' ')
            result += '\n'
        }
        return result
    }

    public static degree<T extends number>(G: Graph, v: T): T {
        let count: T = 0 as T
        G.getAdj(v).traverse(() => count++)
        return count
    }

    public static maxDegree(G: Graph): number {
        let max: number = 0
        const V: number = G.getV()
        for (let i: number = 0; i < V; i++) {
            const d: number = Graph.degree(G, i)
            if (d > max) max = d
        }
        return max
    }

    public static calcAvgDegree(G: Graph): number {
        // ? 总边数除以顶点数 = 所有顶点的平均度数(这里乘以2是因为在这里是无向图，添加顶点时，会添加两次边)
        return 2 * G.getE() / G.getV()
    }

    // & 自环。自环是指从一个顶点引出的边指向的另一个顶点还是自身(即: 顶点A -> 顶点A)
    public static numberOfSelfLoops(G: Graph): number {
        let count: number = 0
        const V: number = G.getV()
        for (let v: number = 0; v < V; v++) {
            G.getAdj(v).traverse((item: any) => item === v && count++)
        }
        // $ 因为要计算自环的个数，而上面循环计算的是所有顶点的邻接点的个数(实际计算的是所有顶点上的所有边)，添加边的时候实际会添加两条边
        // % 即: A -> B, B -> A。所以这里除以2来计算出自环的个数
        return count / 2
    }

    public getV(): number {
        return this.V
    }

    public getE(): number {
        return this.E
    }

    public getAdj(v: number) {
        (this as any).validateVertex(v)
        return this.adj[v]
    }
}

const generatorGraph = (G: any, V: number, vertex: number[][]): any => {
    const graph: Graph = new G(V)
    vertex.forEach(([ v1, v2 ]) => graph.addEdge(v1, v2))
    return graph
}

const graph = generatorGraph(
    Graph,
    13, 
    [
        [ 0, 5 ], [ 4, 3 ], [ 0, 1 ], 
        [ 9, 12 ], [ 6, 4 ], [ 5, 4 ], 
        [ 0, 2 ], [ 11, 12 ], [ 9, 10 ], 
        [ 0, 6 ], [ 7, 8 ], [ 9, 11 ], [ 5, 3 ]
    ]
)

graph.print('无向图: ', 'turquoise')

class Origin {
    public hasPathTo(v: number): boolean {
        this.validateVertex(v)
        return (this as any).marked[v]
    }

    public pathTo(v: number): Stack | null {
        this.validateVertex(v)
        if (!this.hasPathTo(v)) return null
        const path: Stack = new Stack()
        for (let x: number = v; x !== (this as any).source; x = (this as any).edgeTo[x]) path.push(x)
        path.push((this as any).source)
        return path
    }

    private validateVertex(v: number): void | never {
        const length: number = (this as any).marked.length
        if (length < 0 || v > length)
            throw new RangeError(`vertex ${ v } is not between 0 and ${ length - 1 }`)
    }
}

const mixin = function (target: any, Origin: any) {
    const o = new Origin()
    for (let key in o) {
        if (typeof o[key] === 'function') {
            const method = o[key].bind(target)
            target[key] = method
        }
    }
    return target
}

class DepthFirstPaths {
    private marked: boolean[] = []
    private edgeTo: number[] = []
    private readonly source: number

    public constructor(G: Graph, source: number) {
        mixin(this, Origin)
        const initCapacity: number = G.getV()
        this.source = source
        this.edgeTo = new Array<number>(initCapacity)
        this.marked = new Array<boolean>(initCapacity)
        ;(this as any).validateVertex(source)
        this.dfs(G, source)
    }

    private dfs(G: Graph, v: number): void {
        this.marked[v] = true
        G.getAdj(v).traverse(w => {
            const val: number = w.item
            if (!this.marked[val]) {
                this.edgeTo[val] = v
                this.dfs(G, val)
            }
        })
    }
}

const outputFirstSearchPaths = (Paths: any, callback: (dfs: any, v: number) => string, title: string) => {
    const graph: Graph = generatorGraph(Graph, 6, [[ 0, 5 ], [ 2, 4 ], [ 2, 3 ], [ 1, 2 ], [ 0, 1 ], [ 3, 4 ], [ 3, 5 ], [ 0, 2 ]])
    const dfs: any = new Paths(graph, 0/* source */)
    const vertexTotalCount: number = graph.getV()

    console.group(`%c${ title }`, 'color: yellow')

    for (let v: number = 0; v < vertexTotalCount; v++) {
        if ((dfs as any).hasPathTo(v)) {
            let result: string = callback(dfs, v)
            const path: Stack = (dfs as any).pathTo(v)!
            const stack: number[] = []
            while (!path.isEmpty()) stack.push(path.pop())
            result += stack.join(' - ')
            console.log(result)
        } else console.log(`0 to ${ v }: not connected`)
    }

    console.groupEnd()
}

outputFirstSearchPaths(DepthFirstPaths, (dfs, v) => `${ 0 } to ${ v }: `, '图的深度优先搜索: ')

class Queue<T> {
    private queue: T[] = []

    public enqueue(element: T) {
        this.queue.push(element)
    }

    public dequeue(): T {
        return this.queue.shift() as T
    }

    public isEmpty(): boolean {
        return this.queue.length === 0
    }

    public getFirst(): T | null {
        if (this.isEmpty()) return null
        return this.queue[0]
    }

    public getLast(): T | null {
        if (this.isEmpty()) return null
        return this.queue[this.queue.length - 1]
    }

    public size(): number {
        return this.queue.length
    }

    public traverse(callback: (v: T) => void): void {
        while (!this.isEmpty()) {
            callback(this.dequeue())
        }
    }
}

class BreadthFirstPaths {
    private marked: boolean[]
    private edgeTo: number[]
    private distTo: number[]
    private readonly source: number

    public constructor(G: Graph, source: number) {
        mixin(this, Origin)
        const initCapacity: number = G.getV()
        this.marked = new Array<boolean>(initCapacity)
        this.edgeTo = new Array<number>(initCapacity)
        this.distTo = new Array<number>(initCapacity).fill(0)
        this.source = source
        this.bfs(G, source)
    }

    private bfs(G: Graph, source: number): void {
        const queue: Queue<number> = new Queue()
        this.marked[source] = true
        queue.enqueue(source)
        while (!queue.isEmpty()) {
            const v: number = queue.dequeue()
            G.getAdj(v).traverse(w => {
                const val: number = w.item
                if (!this.marked[val]) {
                    this.edgeTo[val] = v
                    this.marked[val] = true
                    this.distTo[val] = this.distTo[v] + 1
                    queue.enqueue(val)
                }
            })
        }
    }

    public pathTo(v: number): Stack | null {
        (this as any).validateVertex(v)
        if (!(this as any).hasPathTo(v)) return null
        const stack: Stack = new Stack()
        let x: number
        for (x = v; this.distTo[x] != this.source; x = this.edgeTo[x]) stack.push(x)
        stack.push(x)
        return stack
    }

    public getShortestPathBetweenTwoPoints(v: number): number {
        (this as any).validateVertex(v)
        return this.distTo[v]
    }
}

outputFirstSearchPaths(BreadthFirstPaths, (dfs, v) => `${ 0 } to ${ v } (${ dfs.distTo[v] }): `, '图的广度优先搜索: ')

class SymbolGraph {
    private st: Map<string, number> = new Map<string, number>()
    private keys: string[]
    private graph: Graph

    public constructor(stream: string[][]) {
        // % 构建映射 string -> number
        stream.forEach(values => values.forEach(v => !this.st.has(v) && this.st.set(v, this.st.size)))

        // & 键集合
        this.keys = new Array<string>(this.st.size)

        // ? 创建反向索引 number -> string
        for (let key of this.st.keys()) this.keys[this.st.get(key)!] = key

        this.graph = new Graph(this.st.size)

        // $ 构建图
        stream.forEach(([ v1, v2 ]) => this.graph.addEdge(this.st.get(v1)!, this.st.get(v2)!))
    }

    public contains(s: string): boolean {
        return this.st.has(s)
    }

    public indexOf(s: string): number {
        return this.st.get(s)!
    }

    public nameOf(v: number): string {
        this.validateVertex(v)
        return this.keys[v]
    }

    public getGraph(): Graph {
        return this.graph
    }

    private validateVertex(v: number): void | never {
        const length: number = this.graph.getV()
        if (length < 0 || v > length)
            throw new RangeError(`vertex ${ v } is not between 0 and ${ length - 1 }`)
    }
}

const routes: string[][] = [ [ 'JFK', 'MCO' ], [ 'ORD', 'DEN' ], [ 'DFW', 'PHX' ], [ 'JFK', 'ATL' ], [ 'ATL', 'HOU' ]]

const sg: SymbolGraph = new SymbolGraph(routes)
const g: Graph = sg.getGraph()

console.group('%c符号表: ', 'color: orange')

routes.forEach(values => {
    values.forEach(val => {
        console.log(val)
        if (sg.contains(val)) g.getAdj(sg.indexOf(val)).traverse(v => console.log(`  ${ sg.nameOf(v.item) }`))
        else console.log(`input not contain ${ val }`)
    })
})

console.groupEnd()

// ? 有向图
class Digraph extends G {
    private readonly V: number
    private E: number
    private adj: Bag<number>[]

    public constructor(V: number) {
        super()
        this.V = V
        this.E = 0
        this.adj = new Array<Bag<number>>(V)
        for (let v: number = 0; v < V; v++) this.adj[v] = new Bag<number>()
    }

    public getV(): number {
        return this.V
    }

    public getE(): number {
        return this.E
    }

    public addEdge(v: number, w: number): void {
        this.adj[v].add(w)
        this.E++
    }

    public getAdj(v: number): Bag<number> {
        return this.adj[v]
    }
    
    // & 得到反向图
    public reverse(): Digraph {
        const R: Digraph = new Digraph(this.V)
        for (let v: number = 0; v < this.V; v++) this.getAdj(v).traverse(w => R.addEdge(w.item!, v))
        return R
    }
}

const directedCyclicGraphVertex: number[][] = [
    [ 4, 2 ], [ 2, 3 ], [ 3, 2 ], [ 6, 0 ], [ 0, 1 ], [ 2, 0 ], [ 11, 12 ], [ 12, 9 ], [ 9, 10 ],
    [ 9, 11 ], [ 7, 9 ],[ 10, 12 ], [ 11, 4 ], [ 4, 3 ], [ 3, 5 ],[ 6, 8 ], [ 8, 6 ], [ 5, 4 ],
    [ 0, 5 ], [ 6, 4 ], [ 6, 9 ], [ 7, 6 ]
]

const directedAcyclicGraphVertex: number[][] = [
    [ 2, 3 ], [ 0, 6 ], [ 0, 1 ], [ 2, 0 ], [ 11, 12 ], [ 9, 12 ], [ 9, 10 ], [ 9, 11 ],
    [ 3, 5 ], [ 8, 7 ], [ 5, 4 ], [ 0, 5 ], [ 6, 4 ], [ 6, 9 ], [ 7, 6 ]
]

const digraph: Digraph = generatorGraph(Digraph, 13, directedCyclicGraphVertex)

digraph.print('有向图: ', 'cornflowerBlue')

// & 有向图的可达性
class DirectedDFS {
    private marked: boolean[]
    private G: Digraph

    public constructor(G: Digraph) {
        this.marked = new Array<boolean>(G.getV())
        this.G = G
    }

    public connectedPath(sources: number | number[]): void {
        if (!this.G.getV() || this.G.getE() === 0) throw new Error('First instantiate the digraph and then call it!')

        if (this.isArray(sources)) (sources as number[]).forEach(v => !this.isMarked(v) && this.dfs(this.G, v))
        else this.dfs(this.G, sources as number)

        let r: number[] = []
        for (let v: number = 0; v < this.G.getV(); v++)
            if (this.isMarked(v)) r[r.length] = v

        console.log(
            `%c顶点${ typeof sources === 'number' ? sources : sources.join('、') }在图中可达的有向路径为:`, 
            'color: #FF99FF', `${ r.join(' ') }`
        )
    }

    private dfs(G: any, v: number): void {
        this.validateVertex(v)
        this.marked[v] = true
        G.getAdj(v).traverse((w: any) => !this.marked[w.item] && this.dfs(G, w.item))
    }

    public isMarked(v: number): boolean {
        return !!this.marked[v]
    }

    private isArray(arg: any): boolean {
        return typeof arg === 'object' && typeof arg.length === 'number' && Object.prototype.toString.call(arg) === '[object Array]'
    }

    private validateVertex(v: number): void | never {
        if (v < 0 || v > this.G.getV())
            throw new RangeError(`vertex ${ v } is not between 0 and ${ length - 1 }`)
    }
}

new DirectedDFS(digraph).connectedPath(2)

// ? 寻找有向环
class DirectedCycle {
    private marked: boolean[]
    private edgeTo: number[]
    private onStack: boolean[]
    private cycle: Stack | null = null
    private G: Digraph

    public constructor(G: Digraph) {
        const V: number = G.getV()
        this.edgeTo = new Array<number>(V)
        this.marked = new Array<boolean>(V).fill(false)
        this.onStack  = new Array<boolean>(V).fill(false)
        this.G = G
    }

    public findDirectedRings(): void {
        console.group('%c寻找有向图是否有环: ', 'color: cornflowerBlue')
        const V: number = this.G.getV()
        this.marked = new Array<boolean>(V)

        for (let v: number = 0; v < V; v++) {
            if (this.cycle) break
            if (!this.marked[v]) this.find(v)
        }

        console.log(this.cycle === null ? '有向无环图' : '有向有环图')

        if (this.hasCycle()) {
            let r: string[] = []
            r[r.length] = 'Directed cycle:'
            this.cycle?.traverse(v => r[r.length] = v)
            console.log(r.join(' '))
        } else console.log('No directed cycle.')
        console.groupEnd()
    }

    private find(v: number): void {
        this.onStack[v] = true
        this.marked[v] = true
        this.G.getAdj(v).traverse((w: any) => {
            let val: number = w.item
            if (typeof val === 'object') val = w.item.w
            if (this.hasCycle()) return
            else if (!this.marked[val]) {
                this.edgeTo[val] = v
                this.find(val)
            } else if (this.onStack[val]) {
                this.cycle = new Stack()
                for (let x = v; x !== val; x = this.edgeTo[x]) this.cycle.push(x)
                this.cycle.push(val)
                this.cycle.push(v)
            }
        })
        this.onStack[v] = false
    }

    public hasCycle(): boolean {
        return this.cycle !== null
    }
}

new DirectedCycle(digraph).findDirectedRings()

// & 深度优先搜索的顶点排序
class DepthFirstOrder {
    private marked: boolean[]
    private pre: Queue<number> = new Queue()
    private post: Queue<number> = new Queue()
    private reversePost: Stack = new Stack()

    public constructor(G: Digraph) {
        const V: number = G.getV()
        this.marked = new Array<boolean>(V)
        for (let v: number = 0; v < V; v++) {
            if (!this.marked[v]) this.dfs(G, v)
        }
    }

    private dfs(G: Digraph, v: number): void {
        this.pre.enqueue(v)
        this.marked[v] = true
        G.getAdj(v).traverse((e: any) => {
            let w: number
            if (typeof e.item === 'object') w = e.item.w
            else w = e.item
            if (!this.marked[w]) this.dfs(G, w)
        })
        this.post.enqueue(v)
        this.reversePost.push(v)
    }

    public getPre(): Queue<number> {
        return this.pre
    }

    public getPost(): Queue<number> {
        return this.post
    }

    public getReversePost(): Stack {
        return this.reversePost
    }
}

class SymbolDigraph {
    private st: Map<string, number> = new Map<string, number>()
    private keys: string[]
    private graph: Digraph

    public constructor(stream: string[], delimiter: string) {
        // % 构建映射 string -> number
        stream.forEach(value => value.split(delimiter).forEach(v => !this.st.has(v) && this.st.set(v, this.st.size)))

        // & 键集合
        this.keys = new Array<string>(this.st.size)

        // ? 创建反向索引 number -> string
        for (let key of this.st.keys()) this.keys[this.st.get(key)!] = key

        this.graph = new Digraph(this.st.size)

        // $ 构建图
        stream.forEach(value => {
            const values: string[] = value.split(delimiter)
            const v: number = this.st.get(values[0])!
            for (let i: number = 1; i < values.length; i++) {
                const w: number = this.st.get(values[i])!
                this.graph.addEdge(v, w)
            }
        })
    }

    public contains(s: string): boolean {
        return this.st.has(s)
    }

    public indexOf(s: string): number {
        return this.st.get(s)!
    }

    public nameOf(v: number): string {
        this.validateVertex(v)
        return this.keys[v]
    }

    public getDigraph(): Digraph {
        return this.graph
    }

    private validateVertex(v: number): void | never {
        const length: number = this.graph.getV()
        if (length < 0 || v > length)
            throw new RangeError(`vertex ${ v } is not between 0 and ${ length - 1 }`)
    }
}

class Topological {
    private order: Stack | null = null
    public constructor(G: any) {
        const cycleFinder: DirectedCycle = new DirectedCycle(G)
        cycleFinder.findDirectedRings()
        if (!cycleFinder.hasCycle()) {
            const dfs: DepthFirstOrder = new DepthFirstOrder(G)
            this.order = dfs.getReversePost()
        }
    }

    public getOrder(): Stack | null {
        return this.order
    }

    public isDAG(): boolean {
        return this.order !== null
    }

    public print(): void {
        console.group('%c拓扑排序: ', 'color: aqua')
        if (!this.order) throw new Error('The order is Null')
        const order: Stack = this.order
        if (order) while (!order.isEmpty()) console.log(symbolGraph.nameOf(order.pop()))
        console.groupEnd()
    }
}

const symbolGraph: SymbolDigraph = new SymbolDigraph(
    [
        'Algorithms/Theoretical CS/Databases/Scientific Computing',
        'Introduction to CS/Advanced Programming/Algorithms',
        'Advanced Programming/Scientific Computing',
        'Scientific Computing/Computational Biology',
        'Theoretical CS/Computational Biology/Artificial Intelligence',
        'Linear Algebra/Theoretical CS',
        'Calculus/Linear Algebra',
        'Artificial Intelligence/Neural Networks/Robotics/Machine Learning',
        'Machine Learning/Neural Networks'
    ],
    '/'
)

new Topological(symbolGraph.getDigraph()).print()

// ? 计算强连通分量的 Kosaraju 算法
class KosarajuSCC {
    private marked: boolean[]
    private id: number[]
    private count: number = 0
    private G: Digraph

    public constructor(G: Digraph) {
        const V: number = G.getV()
        this.marked = new Array<boolean>(V)
        this.id = new Array<number>(V)
        this.G = G
    }

    public init(): void {
        console.group('%c计算强连通分量的 Kosaraju 算法', 'color: yellow')
        const dfs: DepthFirstOrder = new DepthFirstOrder(this.G.reverse())
        dfs.getReversePost().traverse(v => {
            if (!this.marked[v]) {
                this.dfs(this.G, v)
                this.count++
            }
        })
        const m: number = this.getCount()

        console.log(`${ m } strong components`)

        const components: Queue<number>[] = new Array<Queue<number>>(m)

        for (let i: number = 0; i < m; i++) components[i] = new Queue()
        for (let v: number = 0; v < digraph.getV(); v++) components[this.getId(v)].enqueue(v)

        components.forEach(q => {
            let r: number[] = []
            q.traverse(v => r[r.length] = v)
            console.log(r.join(' '))
        })
        console.groupEnd()
    }

    private dfs(G: Digraph, v: number): void {
        this.marked[v] = true
        this.id[v] = this.count
        G.getAdj(v).traverse((w: any) => !this.marked[w.item] && this.dfs(G, w.item))
    }

    public stronglyConnected(v: number, w: number): boolean {
        return this.id[v] === this.id[w]
    }

    public getCount(): number {
        return this.count
    }

    public getId(v: number): number {
        return this.id[v]
    }
}

new KosarajuSCC(digraph).init()

const toFixed: (num: number, digits?: number) => string = (num: number, digits: number = 2): string => {
    if (digits < 1) digits = 1

    const origin: string = num + ''
    const [ integer, decimal ] = origin.split('.')

    if (decimal && digits === decimal.length) return origin

    let fillZero: string = ''
    for (let i: number = 0; i < digits; i++) fillZero += '0'

    if (decimal) return origin + fillZero.substring(0, digits - decimal.length)
    return integer + fillZero.substring(0, digits)
}

// ? 带权重的边的数据类型
interface CompareTo<T> {
    compareTo(E: T): number
}

class Edge implements CompareTo<Edge> {
    private readonly v: number
    private readonly w: number
    private readonly weight: number

    public constructor(v: number, w: number, weight: number) {
        this.v = v
        this.w = w
        this.weight = weight
    }

    public getWeight(): number {
        return this.weight
    }

    public either(): number {
        return this.v
    }

    public other(vertex: number): number | never {
        switch (vertex) {
            case this.v: return this.w
            case this.w: return this.v
            default: throw new Error('Inconsistent edge')
        }
    }

    public compareTo(that: Edge): number {
        return this.getWeight() < that.getWeight() ? -1 : this.getWeight() > that.getWeight() ? 1 : 0
    }

    public print(): string {
        const { v, w, weight } = this
        return `${ v }-${ w } ${ toFixed(weight, 5) }`
    }
}

// & 加权无向图的数据类型
class EdgeWeightedGraph {
    private readonly V: number
    private E: number
    private adj: Bag<Edge>[]

    public constructor(V: number) {
        this.V = V
        this.E = 0
        this.adj = new Array<Bag<Edge>>(V)
        for (let v: number = 0; v < V; v++) this.adj[v] = new Bag<Edge>()
    }

    public init() {
        console.group('%c加权无向图: ', 'color: purple')
        const data: number[][] = [
            [ 4, 5, 0.35 ], [ 4, 7, 0.37 ], [ 5, 7, 0.28 ], [ 0, 7, 0.16 ], [ 1, 5, 0.32 ], [ 0, 4, 0.38 ], [ 2, 3, 0.17 ], [ 1, 7, 0.19 ],
            [ 0, 2, 0.26 ], [ 1, 2, 0.36 ], [ 1, 3, 0.29 ], [ 2, 7, 0.34 ], [ 6, 2, 0.40 ], [ 3, 6, 0.52 ], [ 6, 0, 0.58 ], [ 6, 4, 0.93 ]
        ]

        data.forEach(([ v1, v2, v3 ]) => this.addEdge(new Edge(v1, v2, v3)))

        console.log(`${ this.V } vertex, ${ this.E } edges`)

        for (let v: number = 0; v < this.V; v++) {
            let r: string[] = []
            r[r.length] = `${ v }:`
            this.traverse(current => r[r.length] = ((current as any).item).print(), this.getAdj(v))
            console.log(r.join(' '))
        }
        console.groupEnd()
    }

    public getV(): number {
        return this.V
    }

    public getE(): number {
        return this.E
    }

    public addEdge(e: Edge): void {
        const v: number = e.either()
        const w: number = e.other(v)
        this.adj[v].add(e)
        this.adj[w].add(e)
        this.E++
    }

    public getAdj(v: number): Bag<Edge> {
        return this.adj[v]
    }

    public edges(): Bag<Edge> {
        const b: Bag<Edge> = new Bag<Edge>()
        for (let v: number = 0; v < this.V; v++) {
            const e: Bag<Edge> = this.getAdj(v)
            this.traverse(current => ((current as any).item.other(v) > v) && b.add((current as any).item), e)
        }
        return b
    }

    private traverse(callback: (e: Edge) => void, e: Bag<Edge>) {
        let current: any = e.first
        while (current) {
            callback(current)
            current = (current as any).next
        }
    }
}

new EdgeWeightedGraph(8).init()

// & 最小二叉堆
class MinPQ<T> {
    private heap: T[] = []
    private n: number = 0

    public constructor(values?: T[]) {
        if (Array.isArray(values)) {
            this.n = values.length
            for (let i: number = 0; i < this.n; i++) this.heap[ i + 1 ] = values[i]
            for (let k: number = Math.floor(this.n / 2); k >= 1; k--) this.sink(k)
        }
    }

    public insert(v: T): boolean {
        this.heap[++this.n] = v
        this.swim(this.n)
        return true
    }

    // & 取最后的父节点和最后节点进行比较，如果父节点大于左子节点(因为左子节点在二叉树中相对于右子节点是最小的)则进行交换，交换后位置从父节点位置开始.
    // ? 不断进行重复上述步骤，直到满足最小二叉堆性质停止
    public swim(k: number): void {
        while (k > 1 && this.greater(k / 2 | 0, k)) {
            this.exch(k, k / 2 | 0)
            k = k / 2 | 0
        }
    }

    // % 取最后一个父节点，然后和左右子节点进行比较，左右子节点需要取最小的那个，所以需要进行比较。左小定位到左(左 < 右)，右小定位到右(右 < 左)
    // $ 当不满足最小二叉堆性质时，需要进行交换(父节点和子节点(最小的那个子节点)交换)，交换完毕后定位到子节点的位置
    // * 不断的向下判断，直到满足最小二叉堆性质停止
    public sink(k: number): void {
        while (2 * k <= this.n) {
            let leftChild: number = 2 * k
            if (leftChild < this.n && this.greater(leftChild, leftChild + 1)) leftChild++
            if (!this.greater(k, leftChild)) break
            this.exch(k, leftChild)
            k = leftChild
        }
    }

    public delMin(): T {
        if (this.isEmpty()) throw new Error('Priority queue underflow')
        const min: T = this.heap[1]
        this.exch(1, this.n--)
        this.sink(1)
        this.heap[this.n + 1] = null as any
        return min
    }

    public getMin(): T {
        return this.heap[1]
    }

    public size(): number {
        return this.n
    }

    public isEmpty(): boolean {
        return this.n === 0
    }

    private greater(parentIndex: number, childIndex: number): boolean {
        const parent: T = this.heap[parentIndex]
        const child: T = this.heap[childIndex]
        if (typeof parent === 'number' && typeof child === 'number') return parent - child > 0
        else if (parent instanceof Edge && child instanceof Edge) return parent.getWeight() > child.getWeight()
        else if (parent instanceof BagNode && child instanceof BagNode) return parent.item.getWeight() > child.item.getWeight()
        return (parent as any).localeCompare((child as any)) > 0
    }

    private exch(parentIndex: number, childIndex: number): void {
        [ this.heap[parentIndex], this.heap[childIndex] ] = [ this.heap[childIndex], this.heap[parentIndex] ]
    }
}

// const str: string[] = ['P', 'Q', 'E', 'X', 'A', 'M', 'P', 'L', 'E']
// const nums: number[] = [ 10, 7, 2, 8, 1, 0, 4 ]
// const min: MinPQ<string> = new MinPQ(str)
// while (!min.isEmpty()) console.log(min.delMin())

// ? 最小生成树的Prim算法的延时实现(将无效的横切边先保留在优先队列中，等到要删除它们的时候再检查边的有效性)
class LazyPrimMST {
    private marked: boolean[]
    private mst: Queue<Edge> = new Queue<Edge>()
    private pq: MinPQ<Edge> = new MinPQ<Edge>()
    private weight: number = 0

    public constructor(G: EdgeWeightedGraph/*加权无向图 */) {
        const V: number = G.getV()
        this.marked = new Array<boolean>(V)
        for (let v: number = 0; v < V; v++)
            if (!this.marked[v]) this.prim(G, v)
    }

    public static init(): void {
        console.group('%cprim延时版本: ', 'color: green')
        const data: number[][] = [
            [ 4, 5, 0.35 ], [ 4, 7, 0.37 ], [ 5, 7, 0.28 ], [ 0, 7, 0.16 ], [ 1, 5, 0.32 ], [ 0, 4, 0.38 ], [ 2, 3, 0.17 ], [ 1, 7, 0.19 ],
            [ 0, 2, 0.26 ], [ 1, 2, 0.36 ], [ 1, 3, 0.29 ], [ 2, 7, 0.34 ], [ 6, 2, 0.40 ], [ 3, 6, 0.52 ], [ 6, 0, 0.58 ], [ 6, 4, 0.93 ]
        ]
        
        const edgeWeightedGraph: EdgeWeightedGraph = new EdgeWeightedGraph(8)
        data.forEach(([ v1, v2, v3 ]) => edgeWeightedGraph.addEdge(new Edge(v1, v2, v3)))

        const mst: LazyPrimMST = new LazyPrimMST(edgeWeightedGraph)
        mst.edges().traverse(e => console.log(e.print()))

        console.log(mst.getWeight())
        console.groupEnd()
    }

    private prim(G: EdgeWeightedGraph, s: number): void {
        this.scan(G, s)
        while (!this.pq.isEmpty()) {
            const e: Edge = this.pq.delMin()
            const v: number = e.either()
            const w: number = e.other(v)
            if (this.marked[v] && this.marked[w]) continue
            this.mst.enqueue(e)
            this.weight += e.getWeight()
            if (!this.marked[v]) this.scan(G, v)
            if (!this.marked[w]) this.scan(G, w)
        }
    }

    private scan(G: EdgeWeightedGraph, v: number): void {
        this.marked[v] = true
        G.getAdj(v).traverse(e => !this.marked[e.item.other(v)] && this.pq.insert(e.item))
    }

    public edges(): Queue<Edge> {
        return this.mst
    }

    public getWeight(): string {
        return toFixed(this.weight, 5)
    }
}

LazyPrimMST.init()

// & 普利姆算法的即时版本(即时处理失效的边)
class PrimMST {
    private edgeTo: (Edge | null)[] // % 距离树最近的边
    private distTo: number[]    // & 权重
    private marked: boolean[]   // ? 如果v在树中则为true
    private pq: IndexMinPQ<number>  // $ 有效的横切边

    public constructor(G: EdgeWeightedGraph) {
        const V: number = G.getV()
        this.edgeTo = new Array<Edge>(V)
        this.marked = new Array<boolean>(V)
        this.pq = new IndexMinPQ<number>(V)
        this.distTo = Array.apply(null, { length: V } as unknown[]).map(() => Number.POSITIVE_INFINITY)

        this.prim(G)
    }

    public static init(): void {
        console.group('%cprim即时版本: ', 'color: cornflowerBlue')
        const data: number[][] = [
            [ 4, 5, 0.35 ], [ 4, 7, 0.37 ], [ 5, 7, 0.28 ], [ 0, 7, 0.16 ], [ 1, 5, 0.32 ], [ 0, 4, 0.38 ], [ 2, 3, 0.17 ], [ 1, 7, 0.19 ],
            [ 0, 2, 0.26 ], [ 1, 2, 0.36 ], [ 1, 3, 0.29 ], [ 2, 7, 0.34 ], [ 6, 2, 0.40 ], [ 3, 6, 0.52 ], [ 6, 0, 0.58 ], [ 6, 4, 0.93 ]
        ]

        const edgeWeightedGraph: EdgeWeightedGraph = new EdgeWeightedGraph(8)
        data.forEach(([ v1, v2, v3 ]) => edgeWeightedGraph.addEdge(new Edge(v1, v2, v3)))

        const mst: PrimMST = new PrimMST(edgeWeightedGraph)
        mst.edges().traverse(e => console.log(e.print()))

        console.log(toFixed(mst.getWeight(), 5))
        console.groupEnd()
    }

    private prim(G: EdgeWeightedGraph): void {
        this.distTo[0] = 0  // ? 初始化顶点0的权重为
        this.pq.insert(0, this.distTo[0])   // - 将起始顶点0和起始权重0来初始化pq
        while (!this.pq.isEmpty()) this.scan(G, this.pq.delMin())   // = 将最新的顶点添加到最小生成树中
    }

    private scan(G: EdgeWeightedGraph, v: number): void {
        this.marked[v] = true   // & 将顶点v添加到最小生成树中, 更新数据
        G.getAdj(v).traverse(({ item: e }) => {
            const w: number = e.other(v)
            if (this.marked[w]) return  // % 舍弃无效的边
            if (e.getWeight() < this.distTo[w]) {
                this.distTo[w] = e.getWeight()
                this.edgeTo[w] = e  // = 更新连接w(其中 w 不在最小生成树中)和树的最佳边
                if (this.pq.contains(w)) this.pq.decreaseKey(w, this.distTo[w]) // * 如果有效的横切边数据里包含 w ，说明有更小的权重(if 判断), 则更新
                else this.pq.insert(w, this.distTo[w])  // ! 否则直接插入
            }
        })
    }

    public edges(): Queue<Edge> {
        const mst: Queue<Edge> = new Queue<Edge>()
        for (let v: number = 0; v < this.edgeTo.length; v++)
            if (!!this.edgeTo[v]) mst.enqueue(this.edgeTo[v]!)
        return mst
    }

    public getWeight(): number {
        let weight: number = 0
        this.edges().traverse(e => weight += e.getWeight())
        return weight
    }
}

PrimMST.init()

// ? union-find算法的实现(加权quick-union算法)
class WeightedQuickUnionUF {
    private parent: number[]
    private size: number[]
    private count: number

    public constructor(N: number) {
        this.count = N
        this.parent = new Array<number>(N)
        this.size = new Array<number>(N)
        for (let i: number = 0; i < N; i++) {
            this.parent[i] = i
            this.size[i] = 1
        }
    }

    public static init(): void {
        console.group('%cunion-find算法的实现(加权quick-union算法)', 'color: aqua')
        const uf: WeightedQuickUnionUF = new WeightedQuickUnionUF(10)
        const ufData: number[][] = [
            [ 4, 3 ], [ 3, 8 ], [ 6, 5 ], [ 9, 4 ], [ 2, 1 ], 
            [ 8, 9 ], [ 5, 0 ], [ 7, 2 ], [ 6, 1 ], [ 1, 0 ], [ 6, 7 ]
        ]

        ufData.forEach(([ p, q ]) => {
            if (uf.connected(p, q)) return
            uf.union(p, q)
            console.log(`${ p } ${ q }`)
        })

        console.log(`${ uf.getCount() } components`)
        console.groupEnd()
    }

    public getCount(): number {
        return this.count
    }

    public connected(p: number, q: number): boolean {
        return this.find(p) === this.find(q)
    }

    public find(p: number): number {
        while (p !== this.parent[p]) p = this.parent[p]
        return p
    }

    public union(p: number, q: number): void {
        const rootP: number = this.find(p)
        const rootQ: number = this.find(q)

        if (rootP === rootQ) return

        if (this.size[rootP] < this.size[rootQ]) {
            this.parent[rootP] = rootQ
            this.size[rootQ] += this.size[rootP]
        } else {
            this.parent[rootQ] = rootP
            this.size[rootP] += this.size[rootQ]
        }

        this.count--
    }
}

WeightedQuickUnionUF.init()

// ? Kruskal算法
class KruskalMST {
    private mst: Queue<Edge> = new Queue<Edge>()
    private weight: number = 0

    public constructor(G: EdgeWeightedGraph) {
        const pq: MinPQ<Edge> = new MinPQ<Edge>()
        G.edges().traverse(e => pq.insert(e.item))
        const uf: WeightedQuickUnionUF = new WeightedQuickUnionUF(G.getV())
        while (!pq.isEmpty() && this.mst.size() < G.getV() - 1) {
            const e = pq.delMin()
            const v: number = e!.either()
            const w: number = e!.other(v)
            if (uf.connected(v, w)) continue
            uf.union(v, w)
            this.mst.enqueue(e!)
            this.weight += e!.getWeight()
        }
    }

    public static init(): void {
        console.group('%cKruskal算法: ', 'color: orange')

        const data: number[][] = [
            [ 4, 5, 0.35 ], [ 4, 7, 0.37 ], [ 5, 7, 0.28 ], [ 0, 7, 0.16 ], [ 1, 5, 0.32 ], [ 0, 4, 0.38 ], [ 2, 3, 0.17 ], [ 1, 7, 0.19 ],
            [ 0, 2, 0.26 ], [ 1, 2, 0.36 ], [ 1, 3, 0.29 ], [ 2, 7, 0.34 ], [ 6, 2, 0.40 ], [ 3, 6, 0.52 ], [ 6, 0, 0.58 ], [ 6, 4, 0.93 ]
        ]
        
        const weightGraph: EdgeWeightedGraph = new EdgeWeightedGraph(8)
        data.forEach(([ v1, v2, v3 ]) => weightGraph.addEdge(new Edge(v1, v2, v3)))
        
        const mst: KruskalMST = new KruskalMST(weightGraph)
        mst.edges().traverse(e => console.log(e.print()))
        console.log(toFixed(mst.getWeight(), 5))

        console.groupEnd()
    }

    public edges(): Queue<Edge> {
        return this.mst
    }

    public getWeight(): number {
        return this.weight
    }
}

KruskalMST.init()

// ? 最短路径
// & 加权有向图的数据结构
// = 加权有向边的数据类型
class DirectedEdge<T> {
    private readonly v: T
    private readonly w: T
    private readonly weight: number

    public constructor(v: T, w: T, weight: number) {
        this.v = v
        this.w = w
        this.weight = weight
    }

    public from(): T {
        return this.v
    }

    public to(): T {
        return this.w
    }

    public getWeight(): number {
        return this.weight
    }

    public print(): string {
        const { v, w, weight } = this
        return `${ v }-${ w } ${ toFixed(weight, 5) }`
    }
}

// - 加权有向图的数据类型
class EdgeWeightedDigraph extends G {
    private readonly V: number
    private E: number
    private adj: Bag<DirectedEdge<number>>[]
    private indegree: number[]

    public constructor(V: number) {
        super()
        this.V = V
        this.E = 0
        this.adj = Array.apply(null, { length: V } as []).map(() => new Bag())
        this.indegree = new Array<number>(V).fill(0)
    }

    public init() {
        const data: number[][] = [
            [ 4, 5, 0.35 ], [ 5, 4, 0.35 ], [ 4, 7, 0.37 ], [ 5, 7, 0.28 ], [ 7, 5, 0.28 ], [ 5, 1, 0.32 ], [ 0, 4, 0.38 ], [ 0, 2, 0.26 ], 
            [ 7, 3, 0.39 ], [ 1, 3, 0.29 ], [ 2, 7, 0.34 ], [ 6, 2, 0.40 ], [ 3, 6, 0.52 ], [ 6, 0, 0.58 ], [ 6, 4, 0.93 ]
        ]
        
        data.forEach(([ v1, v2, v3 ]) => this.addEdge(new DirectedEdge(v1, v2, v3)))

        this.print('加权有向图: ', 'hotPink', e => e.item.print())
    }

    public addEdge(e: DirectedEdge<number>): void {
        const v: ReturnType<typeof e.from> = e.from()
        const w: ReturnType<typeof e.to> = e.to()

        ;(this as any).validateVertex(v)
        ;(this as any).validateVertex(w)

        this.adj[v].add(e)
        this.indegree[w]++
        this.E++
    }

    public getAdj(v: number): Bag<DirectedEdge<number>> {
        return this.adj[v]
    }

    public edges(): Bag<DirectedEdge<number>> {
        const bag: Bag<DirectedEdge<number>> = new Bag<DirectedEdge<number>>()

        for (let v: number = 0; v < this.V; v++)
            this.adj[v].traverse(e => bag.add(e))

        return bag
    }

    public getV(): number {
        return this.V
    }

    public getE(): number {
        return this.E
    }

    public getVertexIndegree(v: number): number {
        return this.indegree[v]
    }

    public getVertexOutDegree(v: number): number {
        return this.adj[v].size()
    }
}

new EdgeWeightedDigraph(8).init()

// ? 最短路径的Dijkstra算法
class DijkstraSP {
    private distTo: number[]
    private edgeTo: (null | DirectedEdge<number>)[]
    private pq: IndexMinPQ<number>

    public constructor(G: EdgeWeightedDigraph, s: number) {
        const V: number = G.getV()

        this.distTo = Array.apply(null, { length: V } as []).map(() => Number.POSITIVE_INFINITY)
        this.edgeTo = Array.apply(null, { length: V } as []).map(() => null)
        this.pq = new IndexMinPQ<number>(V)

        this.distTo[s] = 0
        this.pq.insert(s, this.distTo[s])

        while (!this.pq.isEmpty()) 
            G.getAdj(this.pq.delMin()).traverse(e => this.relax(e.item))
    }

    public relax(e: DirectedEdge<number>): void {
        const v: number = e.from()
        const w: number = e.to()
        if (this.distTo[w] > this.distTo[v] + e.getWeight()) {
            this.distTo[w] = this.distTo[v] + e.getWeight()
            this.edgeTo[w] = e
            if (this.pq.contains(w)) this.pq.decreaseKey(w, this.distTo[w])
            else this.pq.insert(w, this.distTo[w])
        }
    }

    public getDistTo(v: number): number {
        return this.distTo[v]
    }

    public hasPathTo(v: number): boolean {
        return this.distTo[v] < Number.POSITIVE_INFINITY
    }

    public pathTo(v: number): Stack | null {
        if (!this.hasPathTo(v)) return null
        const path: Stack = new Stack()
        for (let e: DirectedEdge<number> | null = this.edgeTo[v]; e !== null; e = this.edgeTo[e.from()]) 
            path.push(e)
        return path
    }

    public static printPath(): void {
        const edgeWeightedDigraph: EdgeWeightedDigraph = new EdgeWeightedDigraph(8)
        const datas: number[][] = [
            [ 4, 5, 0.35 ], [ 5, 4, 0.35 ], [ 4, 7, 0.37 ], [ 5, 7, 0.28 ], [ 7, 5, 0.28 ], [ 5, 1, 0.32 ], [ 0, 4, 0.38 ], [ 0, 2, 0.26 ], 
            [ 7, 3, 0.39 ], [ 1, 3, 0.29 ], [ 2, 7, 0.34 ], [ 6, 2, 0.40 ], [ 3, 6, 0.52 ], [ 6, 0, 0.58 ], [ 6, 4, 0.93 ]
        ]
        datas.forEach(([ v1, v2, v3 ]) => edgeWeightedDigraph.addEdge(new DirectedEdge(v1, v2, v3)))

        const sp: DijkstraSP = new DijkstraSP(edgeWeightedDigraph, 0)

        console.group('%c最短路径的Dijkstra算法', 'color: mediumPurple')
        for (let v: number = 0; v < edgeWeightedDigraph.getV(); v++) {
            if (sp.hasPathTo(v)) {
                const r: string[] = []
                r[r.length] = `0 to ${ v } (${ sp.distTo[v].toFixed(2) }): `
                sp.pathTo(v)?.traverse(e => r[r.length] = `${ e.from() }->${ e.to() } ${ toFixed(e.getWeight(), 5) }`)
                console.log(r.shift(), r.join(' '))
            } else console.log(`0 to ${ v } no path.`)
        }
        console.groupEnd()
    }
}

DijkstraSP.printPath()

// ? 无环加权有向图的最短路径算法(比Dijkstra算法快)
// & 算法思想: 利用拓扑排序将顶点进行排序，然后放松顶点以得到更短的路径(边)
class Acyclic {
    protected edgeTo: (DirectedEdge<number> | null)[]
    protected distTo: number[]

    public constructor(G: EdgeWeightedDigraph, s: number, callback: () => number) {
        const V: number = G.getV()
        this.edgeTo = Array.apply(null, { length: V } as []).map(() => null)
        this.distTo = Array.apply(null, { length: V } as []).map(() => callback())
        
        // % 将顶点距离初始化为0, 因为 s -> s 距离(权重)就是 0
        this.distTo[s] = 0

        // # 将顶点进行拓扑排序
        const topological: Topological = new Topological(G)

        // & 得到的拓扑排序结果进行判断是否需要顶点放松
        /**
         * $ distTo[v]是不会变化的，因为是按照拓扑顺序放松顶点，在v被放松之后算法不会再处理任何指向v的边
         * ? distTo[w]只会变小，任何放松操作都只会减小distTo[]中的元素的值
         * = 因此，在所有从s可达的顶点都被加入到树中后，最短路径的最优性条件成立
         */
        topological.getOrder()?.traverse(v => this.relax(G, v))
    }

    public printPath(s: number, title: string, edgeWeightedDigraph: EdgeWeightedDigraph): void {
        console.group(`%c${ title }`, 'color: hotPink')

        for (let v: number = 0; v < edgeWeightedDigraph.getV(); v++) {
            if (this.hasPathTo(v)) {
                const r: string[] = []
                r[r.length] = `${ s } to ${ v } (${ this.distTo[v].toFixed(2) }): `
                this.pathTo(v)?.traverse(e => r[r.length] = `${ e.from() }->${ e.to() } ${ toFixed(e.getWeight(), 5) }`)
                console.log(r.shift(), r.join(' '))
            } else console.log(`${ s } to ${ v } no path.`)
        }

        console.groupEnd()
    }

    public static initEdgeWeightedDigraph(): EdgeWeightedDigraph {
        const edgeWeightedDigraph: EdgeWeightedDigraph = new EdgeWeightedDigraph(8)
        const data: number[][] = [
            [ 5, 4, 0.35 ], [ 4, 7, 0.37 ], [ 5, 7, 0.28 ], [ 5, 1, 0.32 ], [ 4, 0, 0.38 ], [ 0, 2, 0.26 ], 
            [ 3, 7, 0.39 ], [ 1, 3, 0.29 ], [ 7, 2, 0.34 ], [ 6, 2, 0.40 ], [ 3, 6, 0.52 ], [ 6, 0, 0.58 ], [ 6, 4, 0.93 ]
        ]
    
        data.forEach(([ v1, v2, v3 ]) => edgeWeightedDigraph.addEdge(new DirectedEdge(v1, v2, v3)))
    
        return edgeWeightedDigraph
    }

    public relax(G: EdgeWeightedDigraph, v: number): void {
        G.getAdj(v).traverse(({ item: e }) => (this as any).isUpdate(v, e.to(), e) && this.update(v, e.to(), e))
    }

    private update<N extends number>(v: N, w: N, e: DirectedEdge<N>): void {
        this.distTo[w] = this.distTo[v] + e.getWeight()
        this.edgeTo[w] = e
    }

    public getDistTo(v: number): number {
        return this.distTo[v]
    }

    public hasPathTo(v: number): boolean {
        return this.distTo[v] < Number.POSITIVE_INFINITY
    }

    public pathTo(v: number): Stack | null {
        if (!this.hasPathTo(v)) return null
        const path: Stack = new Stack()
        for (let e: DirectedEdge<number> | null = this.edgeTo[v]; e !== null; e = this.edgeTo[e.from()]) 
            path.push(e)
        return path
    }
}

interface SP { isUpdate<N extends number>(v: N, w: N, e: DirectedEdge<N>): boolean }

class AcyclicSP extends Acyclic implements SP {
    public constructor(s: number) {
        const edgeWeightedDigraph: EdgeWeightedDigraph = Acyclic.initEdgeWeightedDigraph()
        super(edgeWeightedDigraph, s, () => Number.POSITIVE_INFINITY)
        super.printPath(s, '最短路径的AcyclicSP算法(比Dijkstra算法快，线性时间)', edgeWeightedDigraph)
    }

    public isUpdate<N extends number>(v: N, w: N, e: DirectedEdge<N>): boolean {
        return this.distTo[w] > this.distTo[v] + e.getWeight()
    }
}

type LP = SP

class AcyclicLP extends Acyclic implements LP {
    public constructor(s: number) {
        const edgeWeightedDigraph: EdgeWeightedDigraph = Acyclic.initEdgeWeightedDigraph()
        super(edgeWeightedDigraph, s, () => Number.NEGATIVE_INFINITY)
        super.printPath(s, '最长路径的AcyclicLP算法(比Dijkstra算法快，线性时间)', edgeWeightedDigraph)
    }

    public isUpdate<N extends number>(v: N, w: N, e: DirectedEdge<N>): boolean {
        return this.distTo[w] < this.distTo[v] + e.getWeight()
    }
}

new AcyclicSP(5)
new AcyclicLP(5)

// ? 基于队列的Bellman-Ford(贝尔曼-福特)算法
class EdgeWeightedDirectedCycle {
    private marked: boolean[]
    private edgeTo: (DirectedEdge<number> | null)[]
    private onStack: boolean[]
    private cycle: Stack | null = null

    public constructor(G: EdgeWeightedDigraph) {
        const V: number = G.getV()
        const initData: Function = this.initData(V)
        this.marked = initData(false)
        this.onStack = initData(false)
        this.edgeTo = initData(null)

        for (let v: number = 0; v < V; v++) 
            if (!this.marked[v]) this.dfs(G, v)
    }

    private dfs(G: EdgeWeightedDigraph, v: number): void {
        this.marked[v] = true
        this.onStack[v] = true
        G.getAdj(v).traverse(({ item: e }) => {
            const w: number = e.to()
            if (this.cycle !== null) return
            else if (!this.marked[w]) {
                this.edgeTo[w] = e
                this.dfs(G, w)
            } else if (this.onStack[w]) {
                this.cycle = new Stack()
                let f: DirectedEdge<number> = e
                while (f.from() !== w) {
                    this.cycle.push(f)
                    f = this.edgeTo[f.from()]!
                }
                this.cycle.push(f)
                return
            }
        })
        this.onStack[v] = false
    }

    public hasCycle(): boolean {
        return this.cycle !== null
    }

    public getCycle(): Stack | null {
        return this.cycle
    }

    private initData(V: number) {
        return (val: number | null | boolean) => Array.apply(null, { length: V } as []).map(() => val)
    }
}

class BellmanFordSP {
    private readonly distTo: number[]
    private readonly edgeTo: (DirectedEdge<number> | null)[]
    private readonly onQueue: boolean[]
    private queue: Queue<number>
    private cost: number = 0
    private cycle: Stack | null = null

    public constructor(G: EdgeWeightedDigraph, s: number) {
        const V: number = G.getV()
        const initData: Function = this.initData(V)
        this.distTo = initData(Number.POSITIVE_INFINITY)
        this.edgeTo = initData(null)
        this.onQueue = initData(false)
        this.queue = new Queue<number>()

        this.distTo[s] = 0
        this.queue.enqueue(s)
        this.onQueue[s] = true

        while (!this.queue.isEmpty() && !this.hasNegativeCycle()) {
            const v: number = this.queue.dequeue()
            this.onQueue[v] = false
            this.relax(G, v)
        }
    }

    public static init(s: number): void {
        console.group('%c基于队列的Bellman-Ford(贝尔曼-福特)算法', 'color: honeydew')
        const data: number[][] = [
            [ 4, 5, 0.35 ], [ 5, 4, 0.35 ], [ 4, 7, 0.37 ], [ 5, 7, 0.28 ], [ 7, 5, 0.28 ], [ 5, 1, 0.32 ], [ 0, 4, 0.38 ], 
            [ 0, 2, 0.26 ], [ 7, 3, 0.39 ], [ 1, 3, 0.29 ], [ 2, 7, 0.34 ], [ 6, 2, -1.20 ], [ 3, 6, 0.52 ], [ 6, 0, -1.40 ], [ 6, 4, -1.25 ], 
        ]
        const G: EdgeWeightedDigraph = new EdgeWeightedDigraph(8)
        data.forEach(([ v1, v2, v3 ]) => G.addEdge(new DirectedEdge<number>(v1, v2, v3)))
        const sp: BellmanFordSP = new BellmanFordSP(G, 0)
        if (sp.hasNegativeCycle()) sp.negativeCycle()!.traverse((e: DirectedEdge<number>) => console.log(e.print()))
        else {
            for (let v: number = 0; v < G.getV(); v++) {
                if (sp.hasPathTo(v)) {
                    const r: string[] = []
                    r[r.length] = `${ s } to ${ v } (${ sp.getDistTo(v).toFixed(2) })`
                    sp.pathTo(v)?.traverse((e: DirectedEdge<number>) => r[r.length] = e.print())
                    console.log(r.shift(), r.join(' '))
                } else console.log(`${ s } to ${ v } no path`)
            }
        }
        console.groupEnd()
    }

    private relax(G: EdgeWeightedDigraph, v: number): void {
        G.getAdj(v).traverse(({ item: directedEdge }) => {
            const w: number = directedEdge.to()
            if (this.distTo[w] > this.distTo[v] + directedEdge.getWeight()) {
                this.distTo[w] = this.distTo[v] + directedEdge.getWeight()
                this.edgeTo[w] = directedEdge
                if (!this.onQueue[w]) {
                    this.queue.enqueue(w)
                    this.onQueue[w] = true
                }
            }
            if (++this.cost % G.getV() === 0) {
                this.findNegativeCycle()
                if (this.hasNegativeCycle()) return
            }
        })
    }

    private hasNegativeCycle(): boolean {
        return this.cycle !== null
    }

    private negativeCycle(): Stack | null {
        return this.cycle
    }

    private findNegativeCycle(): void {
        const V: number = this.edgeTo.length
        const spt: EdgeWeightedDigraph = new EdgeWeightedDigraph(V)
        for (let v: number = 0; v < V; v++) 
            if (this.edgeTo[v])
                spt.addEdge(this.edgeTo[v]!)

        const finder: EdgeWeightedDirectedCycle = new EdgeWeightedDirectedCycle(spt)
        this.cycle = finder.getCycle()
    }

    public getDistTo(v: number): number {
        return this.distTo[v]
    }

    public pathTo(v: number): Stack | null {
        if (this.hasNegativeCycle()) throw new Error('Negative cost cycle exists.')
        if (!this.hasPathTo(v)) return null
        const path: Stack = new Stack()
        for (let e: DirectedEdge<number> | null = this.edgeTo[v]; e !== null; e = this.edgeTo[e.from()]) 
            path.push(e)
        return path
    }

    public hasPathTo(v: number): boolean {
        return this.distTo[v] < Number.POSITIVE_INFINITY
    }

    private initData(V: number) {
        return (val: number | null | boolean) => Array.apply(null, { length: V } as []).map(() => val)
    }
}

BellmanFordSP.init(0)

// ? 字符串排序
// & 低位优先的字符串排序
class LSD {
    public static sort(a: string[], w: number): string[] {
        const n: number = a.length
        const H: number = 122
        const L: number = 48
        const capacity: number = H - L + 1
        const aux: string[] = []

        for (let d: number = w - 1; d >= 0; d--) {
            const count: number[] = new Array<number>(capacity).fill(0)

            for (let i: number = 0; i < n; i++) count[a[i].charCodeAt(d) - L]++

            // # 统计数组从第二个元素开始，每一个元素都加上前面所有元素之和, 相加的目的就是为了让计数数组存储的元素值等于相应字符的最终排序位置
            for (let r: number = 0; r < capacity; r++) count[r + 1] += count[r]
            for (let i: number = n - 1; i >= 0; i--) aux[count[a[i].charCodeAt(d) - L]-- - 1] = a[i]

            // ! 进行回写(Note: 在上一步的循环中aux数组其实已经完成了排序，此时需要将排序的结果复制回原数组中)
            for (let i: number = 0; i < n; i++) a[i] = aux[i]
        }

        return a
    }
}

const a: string[] = [
    'bed', 'bug', 'dad', 'yes', 'zoo','now', 'for', 'tip', 'ilk', 'dim', 'tag', 'jot', 'sob', 'nob', 'sky',
    'hut', 'men', 'egg', 'few', 'jay','owl', 'joy', 'rap', 'gig', 'wee','was', 'wad', 'fee', 'tap', 'tar',
    'dug', 'jam', 'all', 'bad', 'yet'
]

console.group('%c低位优先的字符串排序', 'color: lightSkyBlue')
console.log(LSD.sort(a, a[0].length))
console.groupEnd()

// ? 高位优先的字符串排序
class MSD {
    // & 256 ASCLL码包含所有字符的值，原来的为128，扩展的ASCII增加了128个，总共为256个字符
    private static readonly R: number = 122
    private static readonly CUTOFF: number = 10

    public static sort(a: string[]): void {
        const len: number = a.length
        const aux: string[] = new Array<string>(len)
        MSD.innerSort(a, 0, len - 1, 0, aux)
    }

    private static innerSort<T extends number, A extends string[]>(a: A, low: T, high: T, charIndex: T, aux: A): void {
        if (high <= low + MSD.CUTOFF) {
            MSD.insertSort(a, low, high, charIndex)
            return
        }

        const count: number[] = new Array<number>(MSD.R + 2).fill(0)
        for (let i: number = low; i <= high; i++) count[MSD.charAt(a[i], charIndex) + 2]++
        for (let r: number = 0; r < MSD.R + 1; r++) count[r + 1] += count[r]
        for (let i: number = low; i <= high; i++) aux[count[MSD.charAt(a[i], charIndex) + 1]++] = a[i]
        for (let i: number = low; i <= high; i++) a[i] = aux[i - low]
        for (let r: number = 0; r < MSD.R; r++) {
            // ? 当 count[r] 和 count[r + 1] 值相同时 low + count[r + 1] - 1 是无效的，不会进行插入排序( low > high )
            if (count[r] - count[r + 1] === 0) continue
            MSD.innerSort(a, low + count[r], low + count[r + 1] - 1, charIndex + 1, aux)
        }
    }

    private static insertSort(a: string[], low: number, high: number, charIndex: number): void {
        for (let i: number = low; i <= high; i++) {
            for (let j = i; j > low && MSD.less(a[j], a[j - 1], charIndex); j--)
                MSD.exch(a, j, j - 1)
        }
    }

    private static less(a: string, b: string, charIndex: number): boolean {
        for (let i: number = charIndex; i < Math.min(a.length, b.length); i++) {
            if (a.charAt(i).localeCompare(b.charAt(i)) < 0) return true
            if (a.charAt(i).localeCompare(b.charAt(i)) > 0) return false
        }

        return a.length < b.length
    }

    private static exch(a: string[], low: number, high: number): void {
        [ a[low], a[high] ] = [ a[high], a[low] ]
    }

    private static charAt(s: string, charIndex: number): number {
        if (charIndex >= s.length) return -1
        return s.charCodeAt(charIndex)
    }
}

const highFirstArray: string[] = [
    'she', 'sells', 'seashells', 'by', 'the', 'sea', 'shore',
    'the', 'shells', 'she', 'sells', 'are', 'surely', 'seashells'
]

MSD.sort(highFirstArray)

console.group('%c高位优先的字符串排序', 'color: moccasin')
console.log(highFirstArray)
console.groupEnd()

// ? 单词查找树
class CharNode<V> {
    public val: V | null = null
    public next: CharNode<V>[] = []
}

class TrieST<V> {
    private static readonly ASCII_TOTAL_NUMBER: number = 256
    private root: CharNode<V> | null = null

    public getValue(key: string): V | null {
        const node: CharNode<V> | null = this.innerGetValue(this.root, key, 0)
        if (!node) return null
        return node.val
    }

    private innerGetValue<T extends CharNode<V> | null>(node: T, key: string, index: number): T {
        if (!node) return null as T
        if (index === key.length) return node
        const char: number = key.charAt(index).charCodeAt(0)
        return this.innerGetValue(node!.next[char] as T, key, index + 1)
    }

    public put(key: string, val: V): void {
        this.root = this.innerPut(this.root, key, val, 0)
    }

    private innerPut<T extends CharNode<V>>(node: T | null, key: string, val: V, index: number): T {
        if (!node) node = new CharNode() as T
        if (index === key.length) { // 在遇到空链接之前就到达了键的尾字符
            if (node.val !== val) node.val = val  // 将该节点的值进行更新
            return node
        }
        const char: number = key.charAt(index).charCodeAt(0)
        node.next[char] = this.innerPut(node.next[char] as T, key, val, index + 1)
        return node
    }

    public keys(): Queue<string> {
        return this.keysWithPrefix('')
    }

    public keysWithPrefix(pre: string): Queue<string> {
        const queue: Queue<string> = new Queue<string>()
        this.collect(this.innerGetValue(this.root, pre, 0), pre, queue)
        return queue
    }

    private collect(node: CharNode<V> | null, result: string, queue: Queue<string>): void {
        if (!node) return
        if (node.val !== null) queue.enqueue(result)
        for (let ascii: number = 0; ascii < TrieST.ASCII_TOTAL_NUMBER; ascii++)
            this.collect(node.next[ascii], result + String.fromCharCode(ascii), queue)
    }

    public keysThatMatch(pattern: string): Queue<string> {
        const queue: Queue<string> = new Queue<string>()
        this.keysPatternMatch(this.root, '', pattern, queue)
        return queue
    }

    private keysPatternMatch<T extends string>(node: CharNode<V> | null, pre: T, pattern: T, queue: Queue<T>): void {
        const len: number = pre.length
        if (!node) return
        if (len === pattern.length) {
            if (node.val !== null) queue.enqueue(pre)
            return
        }
        const char: T = pattern.charAt(len) as T
        for (let ascii: number = 0; ascii < TrieST.ASCII_TOTAL_NUMBER; ascii++) {
            if (char === '.' || char.charCodeAt(0) === ascii)
                this.keysPatternMatch(node.next[ascii], pre + String.fromCharCode(ascii), pattern, queue)
        }
    }

    public longestPrefixOf(s: string): string {
        return s.substring(0, this.search(this.root, s, 0, 0))
    }

    private search(node: CharNode<V> | null, s: string, index: number, length: number): number {
        if (!node) return length
        if (node.val !== null) length = index
        if (index === s.length) return length
        const charAscii: number = s.charAt(index).charCodeAt(0)
        return this.search(node.next[charAscii], s, index + 1, length)
    }

    public delete(key: string): void {
        this.root = this.innerDelete(this.root, key, 0)
    }

    private innerDelete<T extends CharNode<V> | null>(node: T, key: string, index: number): T {
        if (!node) return null as T
        if (index === key.length) node.val = null
        else {
            const char: number = key.charAt(index).charCodeAt(0)
            node.next[char] = this.innerDelete(node.next[char], key, index + 1)
        }
        if (node.val !== null) return node
        for (let c: number = 0; c < TrieST.ASCII_TOTAL_NUMBER; c++)
            if (node.next[c]) return node
        return null as T
    }
}

console.group('%c单词查找树', 'color: honeydew')

const trieST: TrieST<number> = new TrieST<number>()
const keyValueCollection: { key: string; val: number }[] = [
    { key: 'by', val: 2 }, { key: 'sea', val: 2 }, { key: 'sells', val: 1 },
    { key: 'she', val: 0 }, { key: 'shells', val: 3 }, { key: 'shore', val: 10 }, { key: 'the', val: 5 }
]
keyValueCollection.forEach(({ key, val }) => trieST.put(key, val))

console.log(`shells对应的值为: ${ trieST.getValue('shells') }`)
console.log(trieST)

const queueConvertArray = (queue: Queue<string>): string[] => Array.apply(null, { length: queue.size() } as []).map(() => queue.dequeue())

const wordAllQueue: Queue<string> = trieST.keys()
console.log('%c单词查找树的所有键: ', 'color: lightSlateBlue', queueConvertArray(wordAllQueue))

const wordPrefixAllQueue: Queue<string> = trieST.keysWithPrefix('s')
console.log('找出所有以s开头的键: ', queueConvertArray(wordPrefixAllQueue))

const keysPatternMatch: Queue<string> = trieST.keysThatMatch('s..')
console.log('通配符s..匹配: ', queueConvertArray(keysPatternMatch))

console.log('shellsort最长前缀: ', trieST.longestPrefixOf('shellsort'))

trieST.delete('shells')
console.info(trieST)

console.groupEnd()

// 三向单词查找树
type ThreeWayNodeInterface<T> = T | null
class ThreeWayNode<V> {
    public char: string = ''
    public left: ThreeWayNodeInterface<ThreeWayNode<V>> = null
    public mid: ThreeWayNodeInterface<ThreeWayNode<V>> = null
    public right: ThreeWayNodeInterface<ThreeWayNode<V>> = null
    public val: V | null = null
}

class TST<V> {
    private n: number = 0
    private root: ThreeWayNodeInterface<ThreeWayNode<V>> = null

    public getValue(key: string): V | null {
        const node: ThreeWayNodeInterface<ThreeWayNode<V>> = this.innerGetValue(this.root, key, 0)
        if (!node) return null
        return node.val
    }

    private innerGetValue(node: ThreeWayNodeInterface<ThreeWayNode<V>>, key: string, index: number): ThreeWayNodeInterface<ThreeWayNode<V>> {
        if (!node) return null
        const char: string = key.charAt(index)
        if (this.compareTo(char, node.char) < 0) return this.innerGetValue(node.left, key, index)
        else if (this.compareTo(char, node.char) > 0) return this.innerGetValue(node.right, key, index)
        else if (index < key.length - 1) return this.innerGetValue(node.mid, key, index + 1)
        else return node
    }

    public put(key: string, val: V): void {
        this.root = this.innerPut(this.root, key, val, 0)
    }

    private innerPut(node: ThreeWayNodeInterface<ThreeWayNode<V>>, key: string, val: V, index: number): ThreeWayNodeInterface<ThreeWayNode<V>> {
        const char: string = key.charAt(index)

        if (!node) {
            node = new ThreeWayNode<V>()
            node.char = char
        }

        if (this.compareTo(char, node.char) < 0)
            node.left = this.innerPut(node.left, key, val, index)
        else if (this.compareTo(char, node.char) > 0)
            node.right = this.innerPut(node.right, key, val, index)
        else if (index < key.length - 1)
            node.mid = this.innerPut(node.mid, key, val, index + 1)
        else
            node.val = val // 到达key的最后一个字符，则把值储存在最后一个字符中

        return node
    }

    public longestPrefixOf(query: string): string | null {
        if (!query.length) return null

        let index: number = 0
        let length: number = 0
        let node: ThreeWayNodeInterface<ThreeWayNode<V>> = this.root

        while (node && index < query.length) {
            const char: string = query.charAt(index)
            if (this.compareTo(char, node.char) < 0)
                node = node.left
            else if (this.compareTo(char, node.char) > 0)
                node = node.right
            else {
                index++
                if (node.val !== null) length = index
                node = node.mid
            }
        }

        return query.substring(0, length)
    }

    public keys(): Queue<string> {
        const queue: Queue<string> = new Queue<string>()
        this.collect(this.root, '', queue)
        return queue
    }

    private collect(node: ThreeWayNodeInterface<ThreeWayNode<V>>, result: string, queue: Queue<string>): void {
        if (!node) return

        // 检查三向查找树的左子树
        this.collect(node.left, result, queue)

        if (node.val !== null)
            queue.enqueue(result + node.char)    // 说明已经到了一个字符串的结束位置，需要把key加入到队列之中

        // 检查三向查找树的中子树
        this.collect(node.mid, result + node.char, queue)   // 只有在访问字符的下一个字符时，才算前进查找当前字符的下一个字符(前进方向: 中子树)

        // 检查三向查找树的右子树
        this.collect(node.right, result, queue)
    }

    public keysThatMatch(pattern: string): Queue<string> {
        const queue: Queue<string> = new Queue<string>()
        this.patternModelCollect(this.root, '', 0, pattern, queue)
        return queue
    }

    private patternModelCollect(
        node: ThreeWayNodeInterface<ThreeWayNode<V>>,
        prefix: string,
        index: number,
        pattern: string,
        queue: Queue<string>
    ): void {
        if (!node) return

        const char: string = pattern.charAt(index)
        if (char === '.' || this.compareTo(char, node.char) < 0)
            this.patternModelCollect(node.left, prefix, index, pattern, queue)

        if (char === '.' || this.compareTo(char, node.char) === 0) {
            if (index === pattern.length - 1 && node.val !== null)
                queue.enqueue(prefix + node.char)

            if (index < pattern.length - 1)
                this.patternModelCollect(node.mid, prefix + node.char, index + 1, pattern, queue)
        }

        if (char === '.' || this.compareTo(char, node.char) > 0)
            this.patternModelCollect(node.right, prefix, index, pattern, queue)
    }

    public keysWithPrefix(prefix: string): Queue<string> {
        const queue: Queue<string> = new Queue<string>()
        const node = this.innerGetValue(this.root, prefix, 0)

        if (!node) return queue
        if (node.val !== null) queue.enqueue(prefix)

        this.collect(node.mid, prefix, queue)
        return queue
    }

    private compareTo(a: string, b: string): number {
        return a.localeCompare(b)
    }
}

const threeWayTST: TST<number> = new TST<number>()
const threeWayTestData: { key: string; val: number }[] = [
    { key: 'she', val: 0 }, { key: 'sells', val: 1 }, { key: 'sea', val: 2 }, { key: 'shells', val: 3 }, { key: 'by', val: 4 },
    { key: 'the', val: 5 }, { key: 'shore', val: 7 }, { key: 'are', val: 8 }
]

console.group('%c三向单词查找树: ', 'color: darkTurquoise')

threeWayTestData.forEach(({ key, val }) => threeWayTST.put(key, val))
console.log('三向单词查找树: ', threeWayTST)
console.log('获取键shells的值: ', threeWayTST.getValue('shells'))
console.log('获取shellsort的最长前缀: ', threeWayTST.longestPrefixOf('shellsort'))
console.log('获取三向单词查找树中的所有键: ', queueConvertArray(threeWayTST.keys()))
console.log('匹配.he.l.模式的字符串: ', queueConvertArray(threeWayTST.keysThatMatch('.he.l.')))
console.log('获取以sh开头的所有字符串: ', queueConvertArray(threeWayTST.keysWithPrefix('sh')))

console.groupEnd()

// ? 反转字符串(变为逆序字符串. 不使用循环)
const reverseString = (str: string): string => {
    const len: number = str.length
    if (len <= 1) return str
    const a: string = str.substring(0, len / 2 | 0)
    const b: string = str.substring(len / 2 | 0, len)
    return reverseString(b) + reverseString(a)
}

console.group('%c逆序字符串where', 'color: orangeRed')
console.log(reverseString('where'))
console.groupEnd()

const mystery = (s: string, t: string): string => {
    const N = s.length
    if (N <= 1) return s + t
    const a: string = mystery(s.substring(0, N / 2 | 0), t.substring(0, N / 2 | 0))
    const b: string = mystery(s.substring(N / 2 | 0, N), t.substring(N / 2 | 0, N))
    return a + b
}

console.group('%c字符串 s 的每一个字符和 t的每一个字符组合', 'color: mediumPurple')
console.log(mystery('hello', 'world'))
console.groupEnd()

// & s 字符串是 t 字符串的子序列(顺序不一定挨着)
const subsequence = (s: string, t: string): boolean => {
    const sLen: number = s.length
    const tLen: number = t.length

    if (!s) return true

    let count: number = 0
    for (let i: number = 0; i < tLen; i++) {
        if (s[count] === t[i]) count++
        if (count === sLen) return true
    }

    return false
}

console.group('%cs 字符串是 t 字符串的子序列吗?', 'color: turquoise')
console.log(subsequence('accag', 'taagcccaaccgg'))
console.groupEnd()

const arr3 = [ 1, 2, 3, 3, 4, 4, 5, 5, 6, 1, 9, 3, 25, 4 ]
const getResult = <T extends number>(arr: T[]) => 
    arr.reduce((result: T[], current: number) => {
        !result[current] && (result[current] = current as T)
        return result
    }, []).filter(v => v !== undefined)

console.log(getResult(arr3))

type Func = { (...args: number[]): Func; sumOf(): number }

const AddBase: Function = (): Func => {
    const result: number[] = []

    const createResult: Func = (...args: number[]): Func => {
        result.push.apply(result, args)
        return createResult
    }

    const clearAllValue = (): number => result.length = 0
    const sum = (): number => result.reduce((initial, current) => initial += current, 0)

    createResult.sumOf = () => {
        const calcResult: number = sum()
        clearAllValue()
        return calcResult
    }

    return createResult
}

const Add = AddBase()

console.log(Add(1)(2)(3).sumOf())
console.log(Add(1, 2)(3)(4).sumOf())
console.log(Add(1, 2, 4, 5)(6, 7)(8, 9, 10, 11).sumOf())
console.log(Add(1, 2, 4, 5)(6, 7)(8, 9, 10, 11)(7)(10).sumOf())

const violenceSearch = <T extends string>(txt: T, pat: T): number => {
    const N: number = txt.length
    const M: number = pat.length

    let i: number
    let j: number

    for (i = 0, j = 0; i < N && j < M; i++) {
        if (txt[i] === pat[j]) j++
        else {
            i -= j
            j = 0
        }
    }

    if (j === M) return i - M
    return N
}

console.log(violenceSearch('AAAAAAAAAB', 'AAAAB'))

// KMP算法
class KMP {
    private pat: string
    private readonly dfa: Uint8ClampedArray[]
    private static readonly ASCII_TOTAL_NUMBER: number = 256

    public constructor(pat: string) {
        this.pat = pat
        const M: number = pat.length
        this.dfa = Array.apply(null, { length: KMP.ASCII_TOTAL_NUMBER } as []).map(() => new Uint8ClampedArray(M))

        this.dfa[pat[0].charCodeAt(0)][0] = 1
        for (let X: number = 0, j: number = 1; j < M; j++) {
            const charCode: number = pat[j].charCodeAt(0)
            for (let c: number = 0; c < KMP.ASCII_TOTAL_NUMBER; c++)
                this.dfa[c][j] = this.dfa[c][X]
            this.dfa[charCode][j] = j + 1
            X = this.dfa[charCode][X]
        }
    }

    public search(txt: string): number {
        let i: number, j: number, N: number = txt.length, M = this.pat.length
        for (i = 0, j = 0; i < N && j < M; i++) {
            j = this.dfa[txt[i].charCodeAt(0)][j]
            // 如果到达停止状态的话，表明已经匹配
            if (j === M) return i - M + 1
        }
        return -1
    }
}

console.group('%cKMP算法有限状态自动机版本', 'color: lavender')
const kmp: KMP = new KMP('rab')
console.log(kmp.search('abacadabrabracabracadabrabrabracad'))
console.groupEnd()

const getNext = (pattern: string): number[] => {
    const next: number[] = []
    let i: number = 0, j: number = -1
    next[0] = -1

    while (i < pattern.length) {
        if (j === -1 || pattern[i] === pattern[j]) next[++i] = ++j
        else j = next[j]
    }
    
    return next
}

const kmp1 = (txt: string, pattern: string): number => {
    const next: number[] = getNext(pattern)
    const txtLen: number = txt.length
    const patternLen: number = pattern.length
    let i: number = -1, j: number = 0

    while (i++ < txtLen && j < patternLen) {
        if ((j === -1 || txt[i] === pattern[j])) {
            if (++j === patternLen) return i - patternLen + 1
        }
        else j = next[j]
    }

    return -1
}

console.group('%cKMP标准算法', 'color: antiqueWhite')
console.log(kmp1('abacadabrabracabracadabrabrabracad', 'rab'))
console.groupEnd()

// Boyer-Moore字符串匹配算法
class BoyerMoore {
    private readonly right: Map<string, number> = new Map<string, number>()
    private readonly pat: string

    public constructor(pat: string) {
        this.pat = pat
        const M: number = pat.length
        for (let i: number = 0; i < M; i++)
            this.right.set(pat[i], i)
    }

    public search(txt: string): number {
        const N: number = txt.length
        const M: number = this.pat.length

        for (let i: number = 0, skip: number; i <= N - M; i += skip) {
            skip = 0
            for (let j: number = M - 1; j >= 0; j--) {
                if (txt[i + j] !== this.pat[j]) {
                    const val: number = this.right.get(txt[i + j])!
                    skip = j - (val ? val : -1)
                    if (skip < 1) skip = 1  // 保证主串指针最少移动一位
                    break
                }
            }
            if (skip === 0) return i
        }

        return -1
    }
}

console.group('%cBoyer-Moore字符串匹配算法', 'color: ivory')
const boyerMoore: BoyerMoore = new BoyerMoore('NEEDLE')
console.log(boyerMoore.search('FINDINAHAYSTACKNEEDLEINA'))
console.groupEnd()

// 好后缀
const generateBmGs = (pattern: string): { suffix: number[]; prefix: boolean[] } => {
    const M: number = pattern.length
    const suffix: number[] = new Array<number>(M).fill(-1)
    const prefix: boolean[] = new Array<boolean>(M).fill(false)

    for (let i: number = 0; i < M - 1; i++) {
        // 在模式串中两个指针指向的字符比较，如果相同，则移动指针(说明后缀在模式串中出现的次数为 >=2 ，为好后缀)
        let j: number = i
        let k: number = 0

        while (j >= 0 && pattern[j] === pattern[M - 1 - k]) 
            suffix[++k] = j--   // 代表好后缀的长度k在j的位置处(起始索引)

        if (j === -1)
            prefix[k] = true
    }

    return { prefix, suffix }
}

// 坏字符散列(求得在模式串中每一个字符中的位置)
const generateBmBc = (pattern: string): number[] => {
    const SIZE: number = 256
    const M: number = pattern.length
    const right: number[] = new Array<number>(SIZE).fill(-1)

    for (let i: number = 0; i < M; i++)
        right[pattern.charCodeAt(i)] = i

    return right
}

// 好后缀移动步数
const moveByBmGs = <T extends number>(j: T, M: T, suffix: T[], prefix: boolean[]): T => {
    const k: T = M - 1 - j as T
    if (suffix[k] !== -1) return j - suffix[k] + 1 as T
    for (let i: number = j + 2; i <= M - 1; i++)    // 在遇到坏字符时，在模式串里找好后缀(即: M - (j + 2))，如果找到了好后缀，则返回找到的索引
        if (prefix[M - i])
            return i as T

    return M
}

// Boyer-Moore字符串匹配算法(坏字符和好后缀原则版本)
const boyerMoore1 = (txt: string, pattern: string): number => {
    const N: number = txt.length
    const M: number = pattern.length

    if (M === 0) return 0
    const bmBc: number[] = generateBmBc(pattern)
    const { prefix, suffix } = generateBmGs(pattern)

    for (let i: number = 0, skip: number, j: number; i <= N - M; i += skip) {
        for (j = M - 1; j >= 0; j--)
            if (txt[i + j] !== pattern[j])
                break
        if (j < 0) return i
        // 如果存在好后缀的话，则移动步数取坏字符和好后缀的最大值
        skip = Math.max(j - bmBc[txt.charCodeAt(i + j)], j < M - 1 ? moveByBmGs(j, M, suffix, prefix) : 0)
    }

    return -1
}

console.group('%cBoyer-Moore字符串匹配算法(坏字符和好后缀原则版本)', 'color: #C1FFC1')
console.log(boyerMoore1('FINDINAHAYSTACKNEEDLEINA', 'NEEDLE'))
console.groupEnd()

// RabinKarp算法(RK算法)
class RabinKarp {
    private pattern: string
    private patternHash: number
    private M: number
    private static readonly q: number = 144451
    private static readonly RADIX: number = 256
    private RM: number

    public constructor(pattern: string) {
        this.pattern = pattern
        this.M = pattern.length
        this.RM = 1
        for (let i: number = 1; i <= this.M - 1; i++) 
            this.RM = (RabinKarp.RADIX * this.RM) % RabinKarp.q
        this.patternHash = this.hash(pattern, this.M)
    }

    private hash(key: string, M: number): number {
        let h: number = 0
        for (let i: number = 0; i < M; i++) 
            h = (h * RabinKarp.RADIX + this.toNumber(key[i])) % RabinKarp.q   
        return h
    }

    private checkMatch(txt: string, i: number): boolean {
        for (let j: number = 0; j < this.M; j++) 
            if (this.pattern[j] !== txt[i + j])
                return false
        return true
    }

    public search(txt: string): number {
        const N: number = txt.length
        if (N < this.M) return -1
        let txtHash: number = this.hash(txt, this.M)

        if (this.patternHash === txtHash && this.checkMatch(txt, 0))
            return 0

        for (let i: number = this.M; i < N; i++) {
            /**
             * 公式: 
             * 设模式串长度为 M (pattern.length)，Math.pow用 pow 表示，i 的起始位置为 M
             * 则ti表示txt.charAt(i)，那么文本txt中起始于位置i的含有M个字符的子字符串所对应的数为: 
             * xi = t(i + 0) * pow(radix, M - 1) + t(i + 1) * pow(radix, M - 2) + ... + t(i + M - 1) * pow(radix, 0)
             * 假设已知 h(xi) = xi % Q(最大素数)。将模式字符串右移一位即等价于将 xi 替换为:
             * x(i + 1) = (xi - ti * pow(radix, M - 1)) * radix + t(i + M)
             * 
             * 减去第一个数字，加上最后一个数字，再次检查是否匹配(加上RabinKarp.q是为了保证所有的数均为正，这样取余操作才能够得到预期的结果)
             * 两次取余操作是为了当数很大的时候，保证不溢出
             */
            txtHash = (txtHash + RabinKarp.q - this.RM * this.toNumber(txt[i - this.M]) % RabinKarp.q) % RabinKarp.q

            /**
             * 在文本中右移一位
             * 计算i位置 ~ this.M + i位置字符串的哈希值(每次移动只移动一位，但取的字符串长度为左闭右开区间 i ~ this.M + i，即: i < this.M + i )
             */
            txtHash = (txtHash * RabinKarp.RADIX + this.toNumber(txt[i])) % RabinKarp.q

            const offset: number = i - this.M + 1
            if (this.patternHash === txtHash && this.checkMatch(txt, offset))
                return offset
        }

        return -1
    }

    private toNumber(num: string, i: number = 0): number {
        return !isNaN(+num) ? +num : num[i].charCodeAt(0)
    }
}

console.group('%cRabinKarp算法(RK算法)', 'color: #FF6A6A')
const rk: RabinKarp = new RabinKarp('26535')
console.log(rk.search('3141592653589793'))
console.groupEnd()

// 事务
const MyTransaction: any = function () {}

Object.assign(MyTransaction.prototype, (Transaction.Mixin as any).__proto__, {
    getTransactionWrappers() {
        return [{
            initialize() {
                console.log('before method perform')
                return 'before method perform'
            },
            close() {
                console.log('after method perform')
                return 'after method perform'
            }
        }]
    }
})

const transaction = new MyTransaction()
const testMethod = () => console.log('test')

transaction.perform(testMethod)

const generatorReducer = <T extends Object>(prefix: string, state: T, ...props: string[]) => {

    if (
        !(props[0] as string in state) || 
        (Array.isArray(props) && !(props as string[]).every(prop => prop in state))
    ) throw new RangeError(`${ JSON.stringify(state) }不存在${ props }属性, 请检查所要设置的属性是否正确.`)

    return (action: { type: 'increment' | 'decrement', payload: any }, newState: T = { ...state }) => {
        switch (action.type) {
            case prefix + 'crement':
                const result: T = {} as typeof state
                const payloadIsArray: boolean = Array.isArray(action.payload)
                if (payloadIsArray) 
                    props.forEach((item, index) => {
                        const val: any = action.payload[index]
                        if (!val) return
                        ;(result as any)[item] = val
                    })
                else 
                    (result as any)[props[0]] = action.payload
                return { ...newState, ...result }
            default: return state
        }
    }
}

const increment = generatorReducer('in', { count: 1, name: 'FuLiu' }, 'count', 'name')
const decrement = generatorReducer('de', { data: 10 }, 'data')

console.log(increment({ type: 'increment', payload: [ 200 ] }))
console.log(decrement({ type: 'decrement', payload: -200 }))

enum OperateState {
    UNDO = 'UNDO',
    REDO = 'REDO'
}
type State<S extends string> = { past: S[], present: S, future: S[] }
const undoable = (reducer: <S extends string>(state: S, action: { type: S, text: string }) => State<S>) => {
    const initialState: State<string> = {
        past: [],
        present: reducer(undefined as any, {} as any) as any,
        future: []
    }
    return (state: typeof initialState = initialState, action: { type: string, text: string }) => {
        const { past, present, future } = state
        switch (action.type) {
            case OperateState.UNDO:
                const len: number = past.length - 1
                const previous: string = past[len]
                const newPast: string[] = past.slice(0, len)
                return {
                    past: newPast,
                    present: previous,
                    future: [ present, ...future ]
                }
            case OperateState.REDO:
                const next: string = future[0]
                const newFuture: string[] = future.slice(1)
                return {
                    past: [ ...past, present ],
                    present: next,
                    future: newFuture
                }
            default:
                const newPresent: any = reducer(present, action)
                if (newPresent === present) return state
                return {
                    past: [ ...past, present ],
                    present: newPresent,
                    future: []
                }
        }
    }
}

const todos = (state: string[] = [], action: { type: string, text: string }) => {
    switch (action.type) {
        case 'ADD_TODO': return [ ...state, action.text ]
        default: return state
    }
}
const undoableTodos = undoable(todos as any)

let state: State<string> = {
    past: [ '1', '2', '3', '4', '5' ],
    present: '6',
    future: [ '7', '8', '9', '10' ]
}

Array.apply(null, { length: 4 } as any).forEach((item, index) => {
    state = undoableTodos(state, { type: OperateState.UNDO, text: `${ (index + 20) * 2 }` })
    console.log(state)
})


