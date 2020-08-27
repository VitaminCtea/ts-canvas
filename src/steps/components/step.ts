import { addClass, removeClass } from "@/util/index"

export type Alignment = 'left' | 'center' | 'right' | 'justify'

type Status = 'wait' | 'process' | 'finish' | 'error' | 'success'

type StepInterface = {
    processStatus?: Status
    finishStatus?: Status
    alignCenter?: boolean
    descriptionAlignment?: Alignment
}

enum ClassName {
    IS_WAIT = 'is-wait',
    IS_PROCESS = 'is-process',
    IS_SUCCESS = 'is-success',
    IS_FINISH = 'is-finish',
    IS_LINE = 'is-line',
    IS_FLEX = 'is-flex'
}

enum StepItemWidth {
    FLEX_BASIS = '50%',
    MAX_WIDTH = '33.3333%',
    FLEX_ALIGN_CENTER = '25%'
}

type CreateDomArgs = { 
    isLastStep: boolean
    title: number | string
    iconText: string
    desc: string
    stepSpace: number | string
    descriptionAlignment: StepInterface['descriptionAlignment']
}

export class Step {
    public processStatus: StepInterface['processStatus'] = 'wait'
    public finishStatus: StepInterface['finishStatus'] = 'wait'
    public alignCenter: StepInterface['alignCenter'] = false

    public stepLine: HTMLDivElement | null = null
    public stepText: HTMLSpanElement | null = null
    public stepHead: HTMLDivElement | null = null
    public stepTitle: HTMLDivElement | null = null
    public stepDescription: HTMLDivElement | null = null
    public stepIconElement: HTMLSpanElement | null = null
    public stepTextContainer: HTMLDivElement | null = null
    public stepItem: HTMLDivElement | null = null
    public stepLineContainer: HTMLDivElement | null = null

    public createDom({ isLastStep, title, iconText, desc, stepSpace, descriptionAlignment }: CreateDomArgs) {
        const stepItem: HTMLDivElement = this.createElement('div', 'step-item') as HTMLDivElement
        const stepHead: HTMLDivElement = this.createElement('div', 'step-content-head__container') as HTMLDivElement
        const stepLineContainer: HTMLDivElement = this.createElement('div', 'step-line__container') as HTMLDivElement
        const stepLine: HTMLDivElement = this.createElement('div', 'step-line') as HTMLDivElement
        const stepTextContainer: HTMLDivElement = this.createElement('div', 'step-text__container') as HTMLDivElement
        const stepText: HTMLSpanElement = this.createElement('span', 'step-text') as HTMLSpanElement

        const stepShowContent: HTMLDivElement = this.createElement('div', 'step-content__main') as HTMLDivElement
        const stepTitle: HTMLDivElement = this.createElement('div', 'step-content-main__title') as HTMLDivElement
        const stepDescription: HTMLDivElement = this.createElement('div', 'step-content-main__description') as HTMLDivElement

        this.stepItem = stepItem
        this.stepLine = stepLine
        this.stepText = stepText
        this.stepHead = stepHead
        this.stepLineContainer = stepLineContainer
        this.stepTitle = stepTitle
        this.stepDescription = stepDescription
        this.stepTextContainer = stepTextContainer
        this.stepIconElement = this.createElement('span', 'step-icon') as HTMLSpanElement

        this.stepText!.style.transition = 'all .2s'

        this.addAppointElementClassName()

        stepTitle.textContent = `${ title }`
        stepText.textContent = `${ iconText }`
        stepDescription.textContent = `${ desc }`

        stepShowContent.appendChild(stepTitle)
        stepShowContent.appendChild(stepDescription)

        const setElementPadding: (suffix: string) => void = this.setElementPadding(stepDescription, stepSpace)

        if (!isLastStep) {
            stepLineContainer.appendChild(stepLine)
            stepHead.appendChild(stepLineContainer)
            setElementPadding('right')
        } else {
            if (!this.alignCenter) {
                stepItem.style.flexBasis = StepItemWidth.FLEX_BASIS
                stepItem.style.maxWidth = StepItemWidth.MAX_WIDTH
                addClass(stepItem, ClassName.IS_FLEX)
            }
        }

        if (this.alignCenter) this.setElementCenterStyle(descriptionAlignment, setElementPadding)

        stepTextContainer.appendChild(stepText)
        stepHead.appendChild(stepTextContainer)

        stepItem.appendChild(stepHead)
        stepItem.appendChild(stepShowContent)

        return stepItem
    }

    public setElementCenterStyle(descriptionDirection: StepInterface['descriptionAlignment'], setElementPadding: (suffix: string) => void) {
        this.stepItem!.style.flexBasis = StepItemWidth.FLEX_ALIGN_CENTER
        addClass(this.stepLineContainer!, 'is-center')
        this.setElementCenter(this.stepTextContainer!)
        this.stepTitle!.style.textAlign = 'center'
        this.stepDescription!.style.textAlign = descriptionDirection!
        setElementPadding('')
    }

    public setElementPadding(el: HTMLElement, val: number | string) {
        return (suffix: string) => {
            if (suffix) suffix = suffix.charAt(0).toUpperCase() + suffix.substring(1)
            ;(el.style as any)[`padding${ suffix }`] = `0 ${ typeof val === 'number' ? val + 'px' : typeof val === 'string' ? val : '' }`
        }
    }

    public setElementCenter(el: HTMLElement) {
        el.style.left = '50%'
        el.style.transform = 'translateX(-50%)'
    }

    public addAppointElementClassName(callback?: (el: HTMLElement) => void) {
        [ this.stepHead!, this.stepTitle!, this.stepDescription! ].forEach(el => {
            if (callback) callback(el)
            addClass(el, `is-${ this.processStatus }`)
        })
    }

    public createElement(tag: string, className: string) {
        const el: HTMLElement = document.createElement(tag)
        if (this.isClassName(className)) addClass(el, className)
        return el
    }

    public isClassName(className: string) {
        return typeof className === 'string' && className.length > 0
    }

    public updateProcessLine() {
        addClass(this.stepLine!, ClassName.IS_LINE)
        this.setLineWidth(100)
    }

    public replaceElement() {
        let transitionFlag: boolean = true
        this.stepText!.addEventListener('transitionend', (e: any) => {
            if (e.target === e.currentTarget && transitionFlag) {   // ? Note: 只监听自身并且如果里面有子元素还会监听子元素的transitionend事件
                transitionFlag = false
                this.replaceChild(this.stepIconElement!, this.stepText!)
            }
        })
    }

    public updateStatus(isFixedStep: boolean = false) {
        if (this.processStatus === 'success') {
            this.setStepTextOpacity(0)
            if (!isFixedStep) this.replaceElement()
            else this.replaceChild(this.stepIconElement!, this.stepText!)
        }
        this.addAppointElementClassName(el => this.removeElementClassName(el, [ ClassName.IS_WAIT, ClassName.IS_PROCESS ]))
    }

    public resetClassName() {
        this.addAppointElementClassName((el) => 
            this.removeElementClassName(el, [ ClassName.IS_WAIT, ClassName.IS_SUCCESS, ClassName.IS_PROCESS, ClassName.IS_FINISH ])
        )
    }

    public removeElementClassName(el: HTMLElement, classNames: ClassName[]) {
        classNames.forEach(className => removeClass(el, className))
    }

    public reset() {
        this.setProcessStatus('wait')
        this.setLineWidth(0)
        this.replaceChild(this.stepText!, this.stepIconElement!)
        this.setStepTextOpacity(1)
        this.resetClassName()
    }

    public setLineWidth(width: number) {
        this.stepLine!.style.width = this.getRangeValue(width, 0, 100, '%')
    }

    public setStepTextOpacity(opacity: number) {
        this.stepText!.style.opacity = this.getRangeValue(opacity, 0, 1, '')
    }

    public getRangeValue(val: number, min: number, max: number, suffix: string) {
        return Math.max(Math.min(max, val), min) + suffix
    }

    public replaceChild(newNode: HTMLElement, oldNode: HTMLElement) {
        this.stepTextContainer!.replaceChild(newNode, oldNode)
    }

    public setProcessStatus(newStatus: Status) {
        this.setStatus('processStatus', newStatus)
    }

    public setFinishStatus(newStatus: Status) {
        this.setStatus('finishStatus', newStatus)
    }

    public setStatus(attr: keyof Step, newStatus: Status) {
        if (newStatus === this[attr]) return
        (this as any)[attr] = newStatus
    }
}