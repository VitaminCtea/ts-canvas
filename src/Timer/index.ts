export type TimerCallback = (id: number, data: any) => void

export class Timer {
    public id: number = -1
    public enabled: boolean = false
    public callback: TimerCallback
    public callbackData: any = undefined
    public countdown: number = 0
    public timeout: number = 0
    public onlyOnce: boolean = false
    public constructor(callback: TimerCallback) {
        this.callback = callback
    }
}