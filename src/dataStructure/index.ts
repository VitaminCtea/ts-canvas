import { Math2D } from "@/Math2D/index"

const isFloatingPointNumbersEqual: (a: number, b: number) => boolean = (a, b) => Math.abs(a - b) < Number.EPSILON

export class Vec2 {
    public values: Float32Array
    public static xAxis = new Vec2(1, 0)
    public static yAxis = new Vec2(0, 1)
    public static nXAxis = new Vec2(-1, 0)
    public static nYAxis = new Vec2(0, -1)

    public constructor(x: number = 0, y: number = 0) {
        this.values = new Float32Array([ x, y ])
    }

    public reset(x: number = 0, y: number = 0): Vec2 {
        this.values[0] = x
        this.values[1] = y
        return this
    }

    public equals(vector: Vec2): boolean {
        const [ currentVector0, currentVector1 ] = this.values
        const [ vector0, vector1 ] = vector.values
        if (isFloatingPointNumbersEqual(currentVector0, currentVector1) || isFloatingPointNumbersEqual(vector0, vector1)) return false
        return true
    }

    public toUnitVector(): number {
        const len: number = this.length
        if (Math2D.isEquals(len, 0)) {
            console.log('The length = 0')
            this.reset()
            return 0
        }
        if (Math2D.isEquals(len, 1)) {
            console.log('The length = 1')
            return 1.0
        }
        // 求出单位向量(len为this.values[0]和this.values[1]的模)
        this.values[0] /= len
        this.values[1] /= len
        return len
    }

    public getVectorAddition(right: Vec2): Vec2 {
        Vec2.sum(this, right, this)
        return this
    }

    public getVectorSubtraction(another: Vec2): Vec2 {
        Vec2.difference(this, another, this)
        return this
    }

    public getNegativeVector(): Vec2 {
        this.values[0] = -this.values[0]
        this.values[1] = -this.values[1]
        return this
    }

    public innerProduct(right: Vec2): number {
        return Vec2.dotProduct(this, right)
    }

    public static copy(src: Vec2, target: Vec2 | null = null): Vec2 {
        if (!target) target = new Vec2()
        target.values[0] = src.values[0]
        target.values[1] = src.values[1]
        return target
    }

    public static sum(left: Vec2, right: Vec2, result: Vec2 | null = null): Vec2 {
        if (result === null) result = new Vec2()
        result.values[0] = left.values[0] + right.values[0]
        result.values[1] = left.values[1] + right.values[1]
        return result
    }

    public static difference(end: Vec2, start: Vec2, result: Vec2 | null = null): Vec2 {
        if (result === null) result = new Vec2()
        result.values[0] = end.values[0] - start.values[0]
        result.values[1] = end.values[1] - start.values[1]
        return result
    }

    public static scale(direction: Vec2, scalar: number, result: Vec2 | null = null): Vec2 {
        if (result === null) result = new Vec2()
        result.values[0] = direction.values[0] * scalar
        result.values[1] = direction.values[1] * scalar
        return result
    }

    public static scaleAdd(start: Vec2, direction: Vec2, scalar: number, result: Vec2 | null = null): Vec2 {
        if (result === null) result = new Vec2()
        Vec2.scale(direction, scalar, result)
        return Vec2.sum(start, result, result)
    }

    public static dotProduct(left: Vec2, right: Vec2): number {
        return left.values[0] * right.values[0] + left.values[1] * right.values[1]
    }

    public static getAngle(a: Vec2, b: Vec2, isRadian: boolean = false): number {
        const dot: number = Vec2.dotProduct(a, b)
        let radian: number = Math.acos(dot / (a.length * b.length))
        if (!isRadian) radian = Math2D.toDegree(radian)
        return radian
    }

    public static getOrientation(from: Vec2, to: Vec2, isRadian: boolean = false): number {
        const diff: Vec2 = Vec2.difference(to, from)
        let radian: number = Math.atan2(diff.y, diff.x)
        if (!isRadian) radian = Math2D.toDegree(radian)
        return radian
    }

    public static crossProduct(left: Vec2, right: Vec2): number {
        return left.x * right.y - left.y * right.x
    }

    public static create(x: number = 0, y: number = 0): Vec2 {
        return new Vec2(x, y)
    }

    public toString(): string {
        return '[ ' + this.values[0] + ', ' + this.values[1] + ' ]'
    }

    public get x(): number {
        return this.values[0]
    }

    public set x(x: number) {
        this.values[0] = x
    }

    public get y(): number {
        return this.values[1]
    }

    public set y(y: number) {
        this.values[1] = y
    }

    public get squaredLength(): number {
        const x: number = this.values[0]
        const y: number = this.values[1]
        return x * x + y * y
    }

    public get length(): number {
        return Math.sqrt(this.squaredLength)
    }
}

export class Size {
    public values: Float32Array
    public constructor(width: number = 1, height: number = 1) {
        this.values = new Float32Array([ width, height ])
    }
    public set width(value: number) {
        this.values[0] = value
    }
    public get width() {
        return this.values[0]
    }
    public set height(value: number) {
        this.values[1] = value
    }
    public get height() {
        return this.values[1]
    }
    public static create(width: number = 1, height: number = 1): Size {
        return new Size(width, height)
    }
}

export class Rectangle {
    public origin: Vec2
    public size: Size
    public constructor(origin: Vec2 = Vec2.create(), size: Size = Size.create(1, 1)) {
        this.origin = origin
        this.size = size
    }
    public isEmpty() {
        return !(this.origin.values.length && this.size.values.length)
    }
    public static create(x: number, y: number = 0, width: number = 1, height: number = 1): Rectangle {
        return new Rectangle(Vec2.create(x, y), Size.create(width, height))
    }
}