import { addClass } from "@/util/index"
import { Color } from "../color"
import { Observer } from '../Observer'

type Keys = 'hue' | 'saturation' | 'light' | 'red' | 'green' | 'blue' | 'alpha' | 'hexa'
type Mapping = {
    [K in Keys]: { value: number | string, inputArea: InputArea }
}

export class InputArea {
    public node: HTMLElement
    public observer: Observer = new Observer()

    public constructor(node: HTMLElement) {
        this.node = node
    }

    public createInputArea(title: string, topic: string, change: (e: Event) => void) {
        const wrapper: HTMLDivElement = document.createElement('div')
        const span: HTMLSpanElement = document.createElement('span')
        const input: HTMLInputElement = document.createElement('input')

        addClass(wrapper, 'input-wrapper')
        addClass(span, 'name')
        input.type = 'text'

        this.initInput(topic, input)

        span.textContent = title
        wrapper.setAttribute('data-topic', topic)

        wrapper.appendChild(span)
        wrapper.appendChild(input)
        this.node.appendChild(wrapper)

        input.addEventListener('change', change)
        input.addEventListener('click', () => {
            input.select()
        })

        this.observer.listen(topic, function (value: string) {
            input.value = value
        })
    }

    public triggerInputUpdate(color: Color) {
        Object.entries(this.createMapping(color)).forEach(([ key, value ]) => {
            this.observer.trigger(key, value)
        })
    }

    public createMapping(color: Color) {
        const { hue, sat, value, light, r, g, b, alpha } = color
        const values: any[] = [ hue, sat, light, value, r, g, b, color.getHex(), alpha ]
        const keys: string[] = [ 'hue', 'saturation', 'light', 'value', 'red', 'green', 'blue', 'hex', 'alpha' ]

        return keys.reduce((result: any, key: string, index: number) => {
            result[key] = values[index]
            return result
        }, Object.create(null)) as Mapping
    }

    public setInput(input: HTMLInputElement, maxValue: string, isHex: boolean = false, minLength: string = '1', maxLength: string = '3') {
        input.setAttribute('minLength', minLength)
        input.setAttribute('maxLength', maxLength)
        if (!isHex) {
            input.setAttribute('max', maxValue)
            input.setAttribute('min', '0')
        }
    }

    public initInput(topic: string, input: HTMLInputElement) {
        switch (topic) {
            case 'hue': 
                this.setInput(input, '360')
                break
            case 'saturation':
            case 'light':
            case 'value':
                this.setInput(input, '100')
                break
            case 'red':
            case 'green':
            case 'blue':
                this.setInput(input, '255')
                break
            case 'alpha':
                this.setInput(input, '1', false, '1', '4')
                break
            case 'hex':
                this.setInput(input, '', true, '3', '9')
                break
        }
    }
}