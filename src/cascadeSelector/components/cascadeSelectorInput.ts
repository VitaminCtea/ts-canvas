import { addClass, event, Observer } from '@/util/index'

type Expanded = 'false' | 'true'

export class CascadeSelectorInput {
    public observer: Observer = new Observer()
    public el: HTMLElement
    public placeholder: string
    public input: HTMLInputElement | null = null
    public mouseDownHandler: Function | null = null

    public constructor(el: HTMLElement, placeholder: string) {
        this.el = el
        this.placeholder = placeholder
        this.init()
    }

    public init() {
        const input: HTMLInputElement = document.createElement('input') as HTMLInputElement

        this.input = input

        input.type = 'text'
        input.placeholder = this.placeholder
        input.readOnly = true
        input.autocomplete = 'off'

        input.setAttribute('aria-readonly', 'true')

        addClass(input, 'cascadeSelector-input__inner')

        /** 
         * & 解决文本框设置的text-overflow: ellipsis失效的问题
         * ? bug再现: 
         * = 当选择完级联面板内的所有文本时，input框的value值总体宽度超出input宽度时，是正常显示省略号的。
         * % 接下来如果再点击input框，就会出现text-overflow: ellipsis失效，导致input框内的value值后面没有省略号，使得完全展现。
         * $ 鼠标点击事件触发的顺序: mousedown -> mouseup -> click -> mousedown -> mouseup -> click -> dblclick
         * # 可以看到mousedown事件是先于click事件的，mousedown事件对于input不知道会产生什么默认的意外行为
         * ! 解决办法是利用preventDefault方法阻止一下默认行为就可以了
        */
        event.on(input, 'mousedown', this.mouseDownHandler = (e: MouseEvent) => e.cancelable && e.preventDefault())

        this.observer.listen('selectComplete', (value: string) => input.value = value)

        this.observer.listen('clearValue', () => input.value = '')

        this.el.appendChild(input)
    }

    public destroy() {
        event.off(this.input!, 'mousedown', this.mouseDownHandler!)
    }
}