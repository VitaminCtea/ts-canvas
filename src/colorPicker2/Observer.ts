export class Observer {
    public subscribers: { [ PropName: string ]: Function[] } = {}

    public listen(registerName: string, fn: Function) {
        if (!this.subscribers[registerName]) {
            this.subscribers[registerName] = []
        }
        const length: number = this.subscribers[registerName].length
        this.subscribers[registerName][length] = fn
    }

    public trigger(...args: any[]) {
        const key: string = args.shift()
        const fns: Function[] = this.subscribers[key]

        if (!fns || fns.length === 0) return false

        fns.forEach(fn => fn.apply(this, args))
    }

    public remove(key: string, fn: Function) {
        const fns: Function[] = this.subscribers[key]
        if (!fns || fns.length === 0) return false
        if (!fn) {
            fns && (fns.length = 0)
            return
        }
        const index: number = fns.indexOf(fn)
        if (index !== -1) fns.splice(index, 1)
    }
}