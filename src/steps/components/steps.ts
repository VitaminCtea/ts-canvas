import { Step, Alignment } from './step'

enum ProcessStatus { WAIT = 'wait', PROCESS = 'process', SUCCESS = 'success', FINISH = 'finish' }

type Content = { text: string, title: string, description: string }[]

type Options = { 
    el: HTMLElement
    content: Content
    successColor?: string
    stepSpace?: number | string
    fixedStep?: { enabled: boolean, specifySteps?: number | never } | null
    alignCenter?: boolean
    descriptionAlignment?: Alignment | Alignment[]
    button?: HTMLElement | null
}

export class Steps {
    public currentStatus: Step | null = null
    public steps: Step[] = []
    public content: Content
    public el: HTMLElement
    public nextStepButton: HTMLButtonElement | null = null
    public active: number = 1
    public successColor: string = ''
    public stepSpace: number | string
    public fixedStep: Options['fixedStep']
    public alignCenter: Options['alignCenter']
    public descriptionAlignment: Options['descriptionAlignment'] = 'center'
    public button: Options['button'] = null

    private index: number = 0
    private count: number = 1

    constructor(options: Options) {
        let { el, content, successColor, stepSpace = '10%', fixedStep, alignCenter = false, descriptionAlignment, button } = options

        this.el = el
        this.content = content

        if (successColor) this.successColor = this.getColorFormat(successColor)

        this.stepSpace = stepSpace

        if (fixedStep) {
            this.fixedStep = fixedStep
            this.active = this.getFixedStep(fixedStep?.specifySteps!)
        }

        this.alignCenter = alignCenter
        if (descriptionAlignment) this.descriptionAlignment = descriptionAlignment

        this.button = button
        this.init()
    }

    public init() {
        const contentLength: number = this.content.length
        const fragment: DocumentFragment = document.createDocumentFragment()

        if (contentLength < 2) throw new RangeError('Content array length must be less than 2')

        this.content.forEach((content, index) => {
            const step: Step = new Step()
            const { title, text: iconText, description: desc } = content
            const descriptionAlignment: Alignment = 
                (this.isArray(this.descriptionAlignment) ? this.descriptionAlignment![index] : this.descriptionAlignment!) as Alignment
            step.alignCenter = this.alignCenter!
            if (index === 0) step.setProcessStatus(ProcessStatus.PROCESS)
            fragment.appendChild(
                step.createDom({
                    isLastStep: index === contentLength - 1,
                    stepSpace: this.stepSpace,
                    title,
                    iconText,
                    desc,
                    descriptionAlignment
                })
            )
            this.steps[this.steps.length] = step
        })

        this.currentStatus = this.steps[0]

        const stepContainer: HTMLDivElement = this.currentStatus!.createElement('div', 'step-container') as HTMLDivElement
        const stepContent: HTMLDivElement = this.currentStatus!.createElement('div', 'step-content') as HTMLDivElement

        stepContent.appendChild(fragment)
        stepContainer.appendChild(stepContent)

        let nextStepButton: HTMLElement

        if (!this.fixedStep?.enabled) {
            if (!this.button) {
                nextStepButton = this.currentStatus!.createElement('button', 'step-next-step__button') as HTMLButtonElement
                nextStepButton.textContent = '下一步'
            } else nextStepButton = this.button

            this.setActive(1)

            this.nextStepButton = nextStepButton as HTMLButtonElement
            this.registerClickEvent(this.nextStepButton, 'click', this.stepClick.bind(this))
            stepContainer.appendChild(nextStepButton)
        } else {
            this.setFixedStep()
        }

        this.el.appendChild(stepContainer)

        let stepRule: CSSStyleSheet
        const stylesheets: StyleSheetList = document.styleSheets
        for (let i: number = 0; i < stylesheets.length; i++) {
            const rules: any = stylesheets[i].cssRules
            if (rules[0].selectorText.indexOf('step') !== -1) {
                stepRule = stylesheets[i]
                break
            }
        }

        if (this.successColor && stepRule!) {
            Array.from(stepRule!.cssRules).forEach((rule: any) => {
                const cssText: string = rule.cssText
                if (cssText.indexOf('is-success') !== -1) {
                    rule.style.color = this.successColor
                    rule.style.borderColor = this.successColor
                }

                if (cssText.indexOf('is-line') !== -1) rule.style.backgroundColor = this.successColor

                const splitSelector: string[] = rule.selectorText.split(' ')
                if (splitSelector.includes('.step-icon')) rule.style.borderColor = this.successColor
            })
        }
    }

    public getColorFormat(color: string) {
        color = color.replace(/#/, '')
        if ([ 'fff', '000', '303133', 'c0c4cc' ].includes(color)) 
            throw new RangeError(
                'The set successful color cannot be one of "#fff", "#000", "#303133", "#c0c4cc", because they are the original primary color or cannot be set'
            )

        if (this.isHex(color)) {
            if (![ 3, 6, 8 ].includes(color.length)) 
                throw new TypeError('The hexadecimal digit is not correct. It can only be 3, 6, 8')
            return '#' + color
        }

        const regExp: RegExp = /^(hsl|hsv|rgba|rgb)\(([\s\S]+)\)$/
        const match: RegExpExecArray | null = regExp.exec(color)
        const splitColorArray: string[] = match ? match[2].split(/,\s*/) : []

        if (
            this.isRGBA(color, splitColorArray) || 
            this.isHSL(color, splitColorArray) || 
            this.isHSV(color, splitColorArray)
        ) return `${ match![1] }(${ match![2] })`

        throw new TypeError('The color format is incorrect or the color value exceeds the maximum value')
    }

    public isHex(color: string) {
        for (let i: number = 0; i < color.length; i++) {
            if (!/[A-Fa-f0-9]/.test(color[i])) return false
        }
        return true
    }

    public isRGBA(color: string, splitColorArray: string[]) {
        const length: number = splitColorArray.length
        let isValidRangeVal: boolean

        if (length === 3 || length === 4) isValidRangeVal = this.isRangeValue(+splitColorArray[length], 1)
        else isValidRangeVal = false

        return this.isValidColor(splitColorArray, color, name) && 
            splitColorArray.every(item => this.isRangeValue(+item, 255)) && 
            isValidRangeVal
    }

    public isHSL(color: string, splitColorArray: string[]) {
        return this.isHSX(color, 'hsl', splitColorArray)
    }

    public isHSV(color: string, splitColorArray: string[]) {
        return this.isHSX(color, 'hsv', splitColorArray)
    }

    public isHSX(color: string, name: string, splitColorArray: string[]) {
        return this.isValidColor(splitColorArray, color, name) && 
            this.isRangeValue(+splitColorArray[0], 360) && 
            splitColorArray.slice(1).every(item => 
                item.lastIndexOf('%') !== -1 && this.isRangeValue(+item.substring(0, item.indexOf('%'))[0], 100)
            )
    }

    public isValidColor(splitColorArray: string[], color: string, name: string) {
        return color.startsWith(name) && splitColorArray.length >= 3
    }

    public isRangeValue(val: number, high: number, low: number = 0) {
        return val >= low && val <= high
    }

    public registerClickEvent(el: HTMLElement, eventName: string, callback: (e: Event) => void) {
        el.addEventListener(eventName, callback, false)
    }

    public stepClick() {
        if (this.active > this.content.length) {
            this.steps.forEach(step => step.reset())
            this.currentStatus = this.steps[0]
            this.currentStatus.setProcessStatus(ProcessStatus.PROCESS)
            this.currentStatus.resetClassName()
            this.active = 1
            this.count = 1
            this.index = 0
            return
        }

        if (this.active > this.content.length - 1) {
            const lastStep: Step = this.steps[this.content.length - 1]
            lastStep.setProcessStatus(ProcessStatus.SUCCESS)
            lastStep.setFinishStatus(ProcessStatus.FINISH)
            lastStep.updateStatus()
            lastStep.updateProcessLine()
            this.steps[this.content.length - 2].updateProcessLine()
        }

        if (this.active < this.content.length) {
            const currentStep: Step = this.steps[this.active]
            const previousStep: Step = this.steps[this.active - 1]
            
            if (currentStep.processStatus === ProcessStatus.WAIT) currentStep.setProcessStatus(ProcessStatus.PROCESS)
            if (currentStep.processStatus === ProcessStatus.PROCESS && (this.count - 2 >= 0)) this.steps[this.index++].updateProcessLine()

            currentStep.updateStatus()
            previousStep.setProcessStatus(ProcessStatus.SUCCESS)
            previousStep.updateStatus()
        }

        this.active++
        this.count++
    }

    public setFixedStep() {
        const currentStep: Step = this.steps[this.active]

        if (currentStep.processStatus === ProcessStatus.WAIT) currentStep.setProcessStatus(ProcessStatus.PROCESS)

        currentStep.updateStatus()

        // ? 更新状态
        let index: number
        let lineIndex: number

        if (this.active === this.content.length - 1) index = lineIndex = this.active
        else {
            index = this.active - 1
            lineIndex = this.active - 2
        }

        while (index > -1) {
            const step: Step = this.steps[index]
            step.setProcessStatus(ProcessStatus.SUCCESS)
            step.updateStatus(true)
            index--
        } 

        // = 更新线

        while (lineIndex > -1) {
            this.steps[lineIndex].updateProcessLine()
            lineIndex--
        }
    }

    public getFixedStep(specifySteps: number) {
        if (specifySteps == null) return this.active
        if (typeof specifySteps === 'string') {
            specifySteps = parseInt(specifySteps, 10)
            if (isNaN(specifySteps)) throw new TypeError('The specififsteps parameter cannot be converted to a valid number')
        }
        return Math.max(Math.min(this.content.length - 1, specifySteps), 0)
    }

    public setActive(newActive: number) {
        if (newActive === this.active) return
        this.active = newActive
    }

    public isArray(val: any) {
        return typeof val === 'object' && typeof val.length === 'number' && Object.prototype.toString.call(val) === '[object Array]'
    }
}