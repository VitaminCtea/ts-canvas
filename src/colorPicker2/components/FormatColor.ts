import { addClass, removeClass } from "@/util/index"
import { Observer } from "@/util/index"

enum CopyText {
    COPY_DEFAULT_TEXT = '复制颜色',
    COPY_SUCCESS_TEXT = '复制成功!'
}

export class FormatColor {
    public node: HTMLElement
    public observer: Observer = new Observer()
    public input: HTMLInputElement | null = null
    public callback: (color: string) => void
    public confirm: HTMLSpanElement | null = null
    public chooseFormatColor: HTMLSpanElement | null = null
    public cancel: HTMLSpanElement | null = null

    constructor(node: HTMLElement, callback: (color: string) => void) {
        this.node = node
        this.callback = callback
        this.init()
    }

    public init() {
        const container: HTMLDivElement = this.createDom('div', 'show-color-value__container') as HTMLDivElement
        const input: HTMLInputElement = this.createDom('input', 'show-color__value') as HTMLInputElement
        const button: HTMLDivElement = this.createDom('div', 'show-color-button__container') as HTMLDivElement
        const cancel: HTMLSpanElement = this.createDom('span', 'show-color-button__cancel') as HTMLSpanElement
        const confirm: HTMLSpanElement = this.createDom('span', 'show-color-button__confirm') as HTMLSpanElement
        const showColor: HTMLDivElement = this.createDom('div', 'show-color-left__container') as HTMLDivElement

        const showColorCopy: HTMLDivElement = this.createDom('div', 'show-color__copy') as HTMLDivElement
        const copyFormatColor: HTMLSpanElement = this.createDom('span', 'show-color-copy__format') as HTMLSpanElement

        input.disabled = true

        this.input = input
        this.cancel = cancel
        this.confirm = confirm
        this.chooseFormatColor = copyFormatColor

        // = 禁止选择文本
        input.addEventListener('select', () => {
            window.getSelection()!.removeAllRanges() 
            return false
        })

        this.observer.listen('update', (value: string) => this.input!.value = value)
        this.observer.listen('executeCallback', this.callback.bind(this))

        cancel.textContent = '清空'
        confirm.textContent = '确认'
        copyFormatColor.textContent = CopyText.COPY_DEFAULT_TEXT
        const SHOW_COLOR_COPY_SUCCESS: string = 'show-color-copy__success'
        const TIME: number = 2000

        // ? 复制成功后要间隔 "2s" 才可以再进行复制
        const click = () => {
            const textarea: HTMLTextAreaElement = document.createElement('textarea')
            document.body.appendChild(textarea)
            textarea.value = input.value
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            copyFormatColor.textContent = CopyText.COPY_SUCCESS_TEXT
            addClass(copyFormatColor, SHOW_COLOR_COPY_SUCCESS)
            copyFormatColor.removeEventListener('click', click)
            setTimeout(() => {
                removeClass(copyFormatColor, SHOW_COLOR_COPY_SUCCESS)
                copyFormatColor.textContent = CopyText.COPY_DEFAULT_TEXT
                copyFormatColor.addEventListener('click', click)
            }, TIME)
        }

        copyFormatColor.addEventListener('click', click)

        input.setAttribute('oncopy', 'return false;')

        button.appendChild(cancel)
        button.appendChild(confirm)

        showColorCopy.appendChild(copyFormatColor)
        showColor.appendChild(input)
        showColor.appendChild(showColorCopy)

        container.appendChild(showColor)
        container.appendChild(button)

        this.node.appendChild(container)
    }

    public createDom(tag: string, className: string) {
        const container: HTMLElement = document.createElement(tag)
        addClass(container, className)
        return container
    }
}