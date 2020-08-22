import { CanvasKeyBoardEvent, CanvasMouseEvent } from "@/Event/CanvasEvent"
import { Timer, TimerCallback } from '@/Timer/index'
import { Vec2 } from '@/dataStructure/index'

export class Application implements EventListenerObject {
    protected isStart: boolean = false
    protected requestId: number = -1
    protected lastTime!: number
    protected startTime!: number
    protected canvas: HTMLCanvasElement
    protected isSupportMouseMove: boolean
    protected isMouseDown: boolean
    public timers: Timer[] = []
    private timeId: number = -1
    private _fps: number = 0

    public constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        this.registerEvent(this.canvas, ['mousedown', 'mouseup', 'mousemove'])

        this.registerEvent(window, ['keydown', 'keyup', 'keypress'])

        this.isMouseDown = false
        this.isSupportMouseMove = false
    }

    public start(): void {
        if (!this.isStart) {
            this.isStart = true
            this.requestId = -1
            this.lastTime = -1
            this.startTime = -1
            window.requestAnimationFrame(this.step.bind(this))
        }
    }

    public stop(): void {
        if (this.isStart) {
            window.cancelAnimationFrame(this.requestId)
            this.requestId = -1
            this.lastTime = -1
            this.startTime = -1
            this.isStart = false
        }
    }

    public isRunning(): boolean {
        return this.isStart
    }

    protected step(timeStamp: number): void {
        if (this.startTime === -1) this.startTime = timeStamp
        if (this.lastTime === -1) this.lastTime = timeStamp

        const elapsedMsec: number = timeStamp - this.startTime
        let intervalSec: number = timeStamp - this.lastTime

        // 防止分母为0
        if (intervalSec !== 0) this._fps = 1000 / intervalSec
        intervalSec /= 1000 // 转换为秒
        this.lastTime = timeStamp

        this.handleTimers(intervalSec)
        this.update(elapsedMsec, intervalSec)
        this.render()

        this.requestId = window.requestAnimationFrame(this.step.bind(this))
    }

    private registerEvent(el: HTMLCanvasElement | Window, events: string[]): void {
        events.forEach((event) => el.addEventListener(event, this, false))
    }

    private viewportToCanvasCoordinate(event: MouseEvent): Vec2 {
        if (this.canvas) {
            const rect: DOMRect = this.canvas.getBoundingClientRect()
            // if (event.type === 'mousedown') {
            //     console.log('boundingClientRect: ' + JSON.stringify(rect))
            //     console.log('clientX: ' + event.clientX + ', clientY: ' + event.clientY)
            // }
            if (event.target) {
                let borderLeft: number = 0
                let borderTop: number = 0
                let paddingL: number = 0
                let paddingT: number = 0

                const { borderLeftWidth, borderTopWidth, paddingLeft, paddingTop } = window.getComputedStyle(event.target as HTMLElement, null)
                if (borderLeftWidth !== null) borderLeft = parseInt(borderLeftWidth, 10)
                if (borderTopWidth !== null) borderTop = parseInt(borderTopWidth, 10)
                if (paddingLeft !== null) paddingL = parseInt(paddingLeft, 10)
                if (paddingTop !== null) paddingT = parseInt(paddingTop, 10)

                const x: number = event.clientX - rect.left - borderLeft - paddingL
                const y: number = event.clientY - rect.top - borderTop - paddingT
                const position: Vec2 = Vec2.create(x, y)

                // if (event.type === 'mousedown') {
                //     console.log('borderLeftWidth: ' + borderLeft + ', borderTopWidth: ' + borderTop)
                //     console.log('paddingLeft: ' + paddingL + ', paddingTop: ' + paddingT)
                //     console.log('变换后的canvasPosition: ' + position.toString())
                // }
                return position
            }
        }
        throw new Error('canvas为null...')
    }

    private toCanvasMouseEvent(evt: Event): CanvasMouseEvent {
        const event: MouseEvent = evt as MouseEvent
        const mousePosition: Vec2 = this.viewportToCanvasCoordinate(event)
        const { button, altKey, ctrlKey, shiftKey } = event
        return new CanvasMouseEvent(mousePosition, button, altKey, ctrlKey, shiftKey)
    }

    private toCanvasKeyBoardEvent(evt: Event): CanvasKeyBoardEvent {
        const event: KeyboardEvent = evt as KeyboardEvent
        const { key, keyCode, repeat, altKey, ctrlKey, shiftKey } = event
        return new CanvasKeyBoardEvent(key, keyCode, repeat, altKey, ctrlKey, shiftKey)
    }

    public handleEvent(evt: Event): void {
        switch(evt.type) {
            case 'mousedown':
                this.isMouseDown = true
                this.dispatchMouseDown(this.toCanvasMouseEvent(evt))
                break
            case 'mouseup':
                this.isMouseDown = false
                this.dispatchMouseUp(this.toCanvasMouseEvent(evt))
                break
            case 'mousemove':
                if (this.isSupportMouseMove) this.dispatchMouseMove(this.toCanvasMouseEvent(evt))
                if (this.isMouseDown) this.dispatchMouseDrag(this.toCanvasMouseEvent(evt))
                break
            case 'keypress':
                this.dispatchKeyPress(this.toCanvasKeyBoardEvent(evt))
                break
            case 'keydown':
                this.dispatchKeyDown(this.toCanvasKeyBoardEvent(evt))
                break
            case 'keyup':
                this.dispatchKeyUp(this.toCanvasKeyBoardEvent(evt))
                break
        }
    }

    public addTimer(callback: TimerCallback, timeout: number = 1.0, onlyOnce: boolean = false, data: any = undefined): number {
        for (let i = 0; i < this.timers.length; i++) {
            const timer: Timer = this.timers[i]
            if (!timer.enabled) {
                timer.callback = callback
                timer.callbackData = data
                timer.timeout = timeout
                timer.countdown = timeout
                timer.enabled = true
                timer.onlyOnce = onlyOnce
                return timer.id
            }
        }
        const timer: Timer = new Timer(callback)
        timer.callbackData = data
        timer.timeout = timeout
        timer.countdown = timeout
        timer.enabled = true
        timer.id = ++this.timeId
        timer.onlyOnce = onlyOnce
        this.timers.push(timer)
        return timer.id
    }

    public removeTimer(id: number): boolean {
        return this.timers.some(timer => timer.id === id && (timer.enabled = false))
    }

    private handleTimers(intervalSec: number): void {
        this.timers.forEach(timer => {
            if (!timer.enabled) return
            timer.countdown -= intervalSec
            if (timer.countdown < 0.0) {
                timer.callback(timer.id, timer.callbackData)
                if (!timer.onlyOnce) timer.countdown = timer.timeout
                else this.removeTimer(timer.id)
            }
        })
    }

    public get fps(): number {
        return this._fps
    }

    public update(elapsedMsec: number, intervalSec: number): void {}
    public render(): void {}
    protected dispatchMouseDown(canvasMouseEvent: CanvasMouseEvent): void {}
    protected dispatchMouseUp(canvasMouseEvent: CanvasMouseEvent): void {}
    protected dispatchMouseMove(canvasMouseEvent: CanvasMouseEvent): void {}
    protected dispatchMouseDrag(canvasMouseEvent: CanvasMouseEvent): void {}
    protected dispatchKeyPress(canvasKeyBoardEvent: CanvasKeyBoardEvent): void {}
    protected dispatchKeyDown(canvasKeyBoardEvent: CanvasKeyBoardEvent): void {}
    protected dispatchKeyUp(canvasKeyBoardEvent: CanvasKeyBoardEvent): void {}
}