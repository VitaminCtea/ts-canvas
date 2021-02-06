class Mixin {
    private transactionWrappers: any
    private _isInTransaction: boolean = false
    private getTransactionWrappers: null | (() => any) = null
    private wrapperInitData: any[] | null = null

    reinitializeTransaction() {
        this.transactionWrappers = this.getTransactionWrappers!()
        if (this.wrapperInitData) this.wrapperInitData.length = 0
        else this.wrapperInitData = []
        this._isInTransaction = false
    }

    isInTransaction() {
        return !!this._isInTransaction
    }

    perform<T extends any>(method: (a: T, b: T, c: T, d: T, e: T, f: T) => T, scope: T, a: T, b: T, c: T, d: T, e: T, f: T) {
        this.reinitializeTransaction()  // 重启事务
        let errorThrown: any
        let ret: any
        try {
            this._isInTransaction = true
            errorThrown = true
            this.initializeAll(0)
            ret = method.call(scope, a, b, c, d, e, f)
            errorThrown = false
        } finally {
            try {
                if (errorThrown) {
                    try {
                        this.closeAll(0)
                    } catch (e) {}
                } else this.closeAll(0)
            } finally {
                this._isInTransaction = false
            }
        }
        return ret
    }

    initializeAll(startIndex: number) {
        this.traverseTransactionWrappers(startIndex, (wrapper, index) => {
            try {
                this.wrapperInitData![index] = Transaction.OBSERVED_ERROR
                this.wrapperInitData![index] = wrapper.initialize ? wrapper.initialize.call(this) : null
            } finally {
                if (this.wrapperInitData![index] === Transaction.OBSERVED_ERROR) {
                    try {
                        this.initializeAll(index + 1)
                    } catch (e) {}
                }
            }
        })
    }

    closeAll(startIndex: number) {
        this.traverseTransactionWrappers(startIndex, (wrapper, index) => {
            const initData = this.wrapperInitData![index]
            let errorThrown
            try {
                errorThrown = true
                if (initData !== Transaction.OBSERVED_ERROR && wrapper.close) wrapper.close.call(this, initData)
                errorThrown = false
            } finally {
                if (errorThrown) {
                    try {
                        this.closeAll(index + 1)
                    } catch (e) {}
                }
            }
        })
        this.wrapperInitData!.length = 0
    }

    traverseTransactionWrappers(startIndex: number, callback: (arg: any, index: number) => void) {
        const transactionWrappers: any[] = this.transactionWrappers
        for (let i = startIndex; i < transactionWrappers.length; i++) callback(transactionWrappers[i], i)
    }
}

const Transaction = {
    Mixin: new Mixin(),
    OBSERVED_ERROR: {}
}

export {
    Transaction
}