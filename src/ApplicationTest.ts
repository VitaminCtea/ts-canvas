import { CanvasKeyBoardEvent, CanvasMouseEvent } from '@/Event/CanvasEvent'
import { Canvas2DApplication, FontType, TextAlign, TextBaseline } from '@/CanvasContext/index'
import { Rectangle, Size, Vec2 } from '@/dataStructure/index'
import { colors } from '@/colors/index'
import { ELayout } from '@/enum/index'
import { Math2D } from './Math2D/index'

type FontOptions = {
    fontSize: string
    fontFamily?: string
}

export class ApplicationTest extends Canvas2DApplication {
    private lineDashOffset: number = 0
    private mouseX: number = 0
    private mouseY: number = 0
    private centerX: number = this.canvas.width >>> 1
    private centerY: number = this.canvas.height >>> 1
    public lineStart: Vec2 = Vec2.create(150, 150)  // 线段起点
    public lineEnd: Vec2 = Vec2.create(this.centerX, this.centerY)  // 线段终点
    public closePoint: Vec2 = Vec2.create() // 输出参数, 预先内存分配, 可以重用
    private isRangePoint: boolean = false   // 鼠标位置是否在线段的起点和终点范围内

    constructor(canvas: HTMLCanvasElement) {
        super(canvas)
        // this.addTimer(this.timeCallback.bind(this), 0.021)
        // const image: HTMLImageElement = new Image()
        // image.onload = () => {
        //     this.drawImage(image, EImageFillType.REPEAT_X, Rectangle.create(0, 0, this.canvas.width, this.canvas.height), Rectangle.create(0, 0, image.width, image.height))
        // }
        // image.src = './yasuo.jpg'
        // this.drawColorCanvas()
        // this.testChangePartCanvasImageData()
        this.isSupportMouseMove = true
    }

    // @Override
    protected dispatchKeyDown(evt: CanvasKeyBoardEvent): void {
        console.log('key: ' + evt.key + ' is down')
    }

    // @Override
    protected dispatchMouseDown(evt: CanvasMouseEvent): void {
        // console.log('canvasPosition: ' + evt.canvasPosition)
    }

    // @Override
    protected dispatchMouseMove(evt: CanvasMouseEvent): void {
        this.mouseX = evt.canvasPosition.x
        this.mouseY = evt.canvasPosition.y
        this.isRangePoint = Math2D.projectPointOnLineSegment(
            Vec2.create(evt.canvasPosition.x, evt.canvasPosition.y), 
            this.lineStart, 
            this.lineEnd,
            this.closePoint
        )
    }

    // @Override
    public update(elapsedMsec: number, intervalSec: number): void {
        // console.log('elapsedMsec: ' + elapsedMsec + ' intervalSec: ' + intervalSec)
    }

    // @Override
    public render() {
        this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.strokeGrid()
        // this.drawMouseLineHitTest()
        // this.drawCoordInfo('[ ' + this.mouseX.toFixed(2) + ', ' + this.mouseY.toFixed(2) + ' ]', this.mouseX, this.mouseY)
        this.drawCanvasCoordCenter()
        // this.doTransform(20)
        // this.doTransform(0)
        // this.doTransform(-20)
        // this.testFillLocalRectWithTitle()
        this.drawMouseLineProjection()
        // this.drawCoordInfo('[ ' + this.mouseX + ', ' + this.mouseY + ' ]', this.mouseX, this.mouseY)
    }

    public drawText(text: string, fontOptions: FontOptions = { fontSize: '55px', fontFamily: 'Inconsolata' }) {
        this.context2D.save()
        this.context2D.textBaseline = 'middle'
        this.context2D.textAlign = 'center'
        this.context2D.font = Object.values(fontOptions).join(' ')

        const { width, height } = this.context2D.canvas
        const centerX: number = this.getHalf(width)
        const centerY: number = this.getHalf(height)

        const gradient: CanvasGradient = this.context2D.createLinearGradient(centerX, centerY, width, height)
        gradient.addColorStop(0, "magenta")
        gradient.addColorStop(0.5, "blue")
        gradient.addColorStop(1.0, "red")

        this.context2D.strokeStyle = gradient
        this.context2D.lineWidth = 2

        this.context2D.strokeText(text, centerX, centerY)
        this.context2D.restore()
    }

    public drawColorCanvas(): void {
        const colorCanvas: HTMLCanvasElement = this.getColorCanvas()
        const centerX: number = (this.centerX) - (colorCanvas.width >>> 1)
        const centerY: number = (this.centerY) - (colorCanvas.height >>> 1)
        this.drawImage(colorCanvas, Rectangle.create(centerX, centerY, colorCanvas.width, colorCanvas.height))
    }

    public getColorCanvas(amount: number = 96): HTMLCanvasElement {
        const step: number = 4
        const canvas: HTMLCanvasElement = document.createElement('canvas')
        canvas.width = amount * step
        canvas.height = amount * step
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D
        for (let i: number = 0; i < step; i++) {
            for (let j: number = 0; j < step; j++) {
                const index: number = step * i + j
                ctx.save()
                ctx.fillStyle = colors[index]
                ctx.fillRect(i * amount, j * amount, amount, amount)
                ctx.restore()
            }
        }
        return canvas
    }

    public testChangePartCanvasImageData(rRow: number = 2, rColumn: number = 0, cRow: number = 1, cColumn: number = 0, size: number = 48): void {
        const colorCanvas: HTMLCanvasElement = this.getColorCanvas(size)
        const context: CanvasRenderingContext2D = colorCanvas.getContext('2d') as CanvasRenderingContext2D
        this.drawImage(colorCanvas, Rectangle.create(0, 0, colorCanvas.width, colorCanvas.height))
        const imageData: ImageData = context.getImageData(size * cColumn, size * cRow, size, size)
        const data: Uint8ClampedArray = imageData.data

        for (let i: number = 0; i < imageData.width; i++) {
            for (let j: number = 0; j < imageData.height; j++) {
                for (let k: number = 0; k < 4; k++) {
                    const index: number = (i * imageData.height + j) * 4 + k
                    if (index % 4 !== 3) data[index] = 255 - data[index]
                }
            }
        }
        context.putImageData(imageData, size * cColumn, size * cRow, 0, 0, size, size)
        this.drawImage(colorCanvas, Rectangle.create(100, 100, colorCanvas.width, colorCanvas.height))
    }

    public updateLineDashOffset(): void {
        this.lineDashOffset++
        if (this.lineDashOffset > 10000) this.lineDashOffset = 0
    }

    public timeCallback(id: number, data: any): void {
        this.context2D.clearRect(0, 0, this.context2D.canvas.width, this.context2D.canvas.height)
        this.drawText('Hello TypeScript')
        this.drawRect(100, 200, this.canvas.width - 200, this.canvas.height - 400)
        this.drawAntLine([10, 5], true)
        this.updateLineDashOffset()
        this.strokeGrid()
    }

    public drawRect(x: number, y: number, width: number, height: number) {
        this.context2D.save()
        this.context2D.fillStyle = 'transparent'
        this.context2D.beginPath()
        this.context2D.moveTo(x, y)
        this.context2D.lineTo(x + width, y)
        this.context2D.lineTo(x + width, y + height)
        this.context2D.lineTo(x, y + height)
        this.context2D.closePath()
        this.context2D.fill()
        this.context2D.restore()
    }

    public createLinearGradient(): CanvasGradient {
        const linearGradient: CanvasGradient = this.context2D.createLinearGradient(100, 200, this.canvas.width - 200, this.canvas.height - 400)
        const colors: string[] = ['red', 'purple', 'olive', 'blue', 'cadetBlue', 'orange']
        let index: number = 0
        for (let i = 0; i < 11; i++) {
            if ((i & 1) === 0) {
                linearGradient.addColorStop(i / 10, colors[index])
                index++
            }
        }
        return linearGradient
    }

    public drawAntLine(antLines: number[], isClockwiseSense: boolean) {
        this.context2D.save()
        this.context2D.lineWidth = 2
        this.context2D.strokeStyle = this.createLinearGradient()
        this.context2D.setLineDash(antLines)
        this.context2D.lineDashOffset = isClockwiseSense ? -this.lineDashOffset : this.lineDashOffset
        this.context2D.stroke()
        this.context2D.restore()
    }

    public drawCanvasCoordCenter(): void {
        const halfWidth: number = this.centerX
        const halfHeight: number = this.centerY
        this.context2D.save()
        this.context2D.lineWidth = 2
        this.context2D.strokeStyle = 'rgba(255, 0, 0, 0.5)'
        this.strokeLine(0, halfHeight, this.canvas.width, halfHeight)
        this.context2D.strokeStyle = 'rgba(0, 0, 255, 0.5)'
        this.strokeLine(halfWidth, 0, halfWidth, this.canvas.height)
        this.context2D.restore()
        this.fillCircle(halfWidth, halfHeight, 5, 'rgba(0, 0, 0, 0.5)')
    }

    public drawCoordInfo(info: string, x: number, y: number, textAlign: TextAlign = 'center', baseLine: TextBaseline = 'bottom'): void {
        this.fillText(info, x, y, 'black', textAlign, baseLine)
    }

    public fillRectWithTitle(
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        title: string = '', 
        layout: ELayout = ELayout.CENTER_MIDDLE, 
        color: string = 'grey', 
        showCoord: boolean = true
    ): void 
    {
        this.drawRectWithTitle(x, y, width, height, false, title, layout, color, showCoord)
    }

    public calcLocalTextRectangle(layout: ELayout, text: string, parentWidth: number, parentHeight: number): Rectangle {
        const s: Size = this.calcTextSize(text)
        const o: Vec2 = Vec2.create()
        const setSize: (x: number, y: number) => void = this.setSize(o)
        const left: number = 0
        const top: number = 0
        const right: number = parentWidth - s.width
        const bottom: number = parentHeight - s.height
        const center: number = right >>> 1
        const middle: number = bottom >>> 1

        switch(layout) {
            case ELayout.LEFT_TOP: setSize(left, top); break
            case ELayout.RIGHT_TOP: setSize(right, top); break
            case ELayout.RIGHT_BOTTOM: setSize(right, bottom); break
            case ELayout.LEFT_BOTTOM: setSize(left, bottom); break
            case ELayout.CENTER_MIDDLE: setSize(center, middle); break
            case ELayout.CENTER_TOP: setSize(center, top); break
            case ELayout.RIGHT_MIDDLE: setSize(right, middle); break
            case ELayout.CENTER_BOTTOM: setSize(center, bottom); break
            case ELayout.LEFT_MIDDLE: setSize(left, middle); break
        }

        return new Rectangle(o, s)
    }

    public calcTextSize(text: string, char: string = 'W', scale: number = 0.5): Size {
        const size: Size = Size.create()
        size.width = this.context2D.measureText(text).width
        const w: number = this.context2D.measureText(char).width
        size.height = w + w * scale
        return size
    }

    public setSize(o: Vec2): (x: number, y: number) => void {
        return (x: number, y: number) => {
            o.x = x
            o.y = y
        }
    }

    public strokeRect(x: number, y: number, width: number, height: number, color: string): void {
        this.context2D.save()
        this.context2D.strokeStyle = color
        this.context2D.strokeRect(x, y, width, height)
        this.context2D.restore()
    }

    public doTransform(degree: number, rotateFirst: boolean = true): void {
        const radians: number = Math2D.toRadian(degree)
        const centerX: number = this.centerX
        const centerY: number = this.centerY

        this.setRotateTranslate(rotateFirst, radians, `${ degree }度旋转`)
        this.setRotateTranslate(rotateFirst, -radians, `-${ degree }度旋转`)

        const radius: number = Math2D.distance(0, 0, centerX, centerY)
        this.strokeCircle(0, 0, radius, 'black')
    }

    public setRotateTranslate(isFirstRotate: boolean, radians: number, text: string): void {
        this.context2D.save()
        if (isFirstRotate) {
            this.context2D.rotate(radians)
            this.context2D.translate(this.centerX, this.centerY)
        } else {
            this.context2D.translate(this.centerX, this.centerY)
            this.context2D.rotate(radians)
        }
        this.fillRectWithTitle(0, 0, 100, 60, text)
        this.context2D.restore()
    }

    public strokeCircle(x: number, y: number, radius: number, color: string): void {
        this.context2D.save()
        this.context2D.strokeStyle = color
        this.context2D.beginPath()
        this.context2D.arc(x, y, radius, 0, Math.PI * 2)
        this.context2D.stroke()
        this.context2D.restore()
    }

    public fillLocalRectWithTitle(
        width: number, 
        height: number, 
        title: string = '', 
        referencePt: ELayout = ELayout.CENTER_MIDDLE,
        layout: ELayout = ELayout.CENTER_MIDDLE,
        color: string = 'grey', 
        showCoord: boolean = true
    ): void 
    {
        let x: number = 0
        let y: number = 0

        if (referencePt !== 0) {
            switch(referencePt) {
                case ELayout.LEFT_MIDDLE: y = -height >> 1; break
                case ELayout.LEFT_BOTTOM: y = -height; break
                case ELayout.RIGHT_TOP: x = -width; break
                case ELayout.RIGHT_MIDDLE: x = -width; y = -height >> 1; break
                case ELayout.RIGHT_BOTTOM: x = -width; y = -height; break
                case ELayout.CENTER_TOP: x = -width >> 1; break
                case ELayout.CENTER_MIDDLE: x = -width >> 1; y = -height >> 1; break
                case ELayout.CENTER_BOTTOM: x = -width >> 1; y = -height; break
            }
        }

        this.drawRectWithTitle(x, y, width, height, true, title, layout, color, showCoord)
    }

    public rotateTranslate(degree: number, layout: ELayout = ELayout.LEFT_TOP, width: number = 40, height: number = 20): void {
        const radians: number = Math2D.toRadian(degree)
        this.context2D.save()
        this.context2D.rotate(radians)
        this.context2D.translate(this.centerX, this.centerY)
        this.fillLocalRectWithTitle(width, height, '', layout)
        this.context2D.restore()
    }

    public testFillLocalRectWithTitle(): void {
        this.rotateTranslate(0, ELayout.LEFT_TOP)

        this.rotateTranslate(10, ELayout.LEFT_MIDDLE)
        this.rotateTranslate(20, ELayout.LEFT_BOTTOM)
        this.rotateTranslate(30, ELayout.CENTER_TOP)
        this.rotateTranslate(40, ELayout.CENTER_MIDDLE)

        this.rotateTranslate(-10, ELayout.CENTER_BOTTOM)
        this.rotateTranslate(-20, ELayout.RIGHT_TOP)
        this.rotateTranslate(-30, ELayout.RIGHT_MIDDLE)
        this.rotateTranslate(-40, ELayout.RIGHT_BOTTOM)

        const radius: number = Math2D.distance(0, 0, this.centerX, this.centerY)
        this.strokeCircle(0, 0, radius, 'black')
    }

    public drawVector(
        len: number, 
        arrowLen: number = 10, 
        beginText: string = '', 
        endText: string = '', 
        lineWidth: number = 1, 
        isLineDash: boolean = false, 
        isShowInfo: boolean = true, 
        isAlpha: boolean = false
    ): void 
    {
        len < 0 && (arrowLen = -arrowLen)
        this.context2D.save()
        this.context2D.lineWidth = lineWidth

        isLineDash && this.context2D.setLineDash([2, 2])
        lineWidth > 1 ? this.fillCircle(0, 0, 5) : this.fillCircle(0, 0, 3) // 绘制起点圆点

        // 绘制向量和箭头
        this.context2D.save()

        isAlpha && (this.context2D.strokeStyle = 'rgba(0, 0, 0, 0.3)')

        // 绘制长度为len的线段表示向量
        this.strokeLine(0, 0, len, 0)

        // 绘制箭头上半部分
        this.context2D.save()
        this.strokeLine(len, 0, len - arrowLen, arrowLen)
        this.context2D.restore()

        // 绘制箭头下半部分
        this.context2D.save()
        this.strokeLine(len, 0, len - arrowLen, -arrowLen)
        this.context2D.restore()

        this.context2D.restore()

        // 绘制起点和终点坐标信息
        const FONT: FontType = '15px sans-serif'
        if (beginText !== undefined && beginText.length !== 0) {
            len > 0 ? 
                this.fillText(beginText, 0, 0, 'black', 'right', 'bottom', FONT) : 
                this.fillText(beginText, 0, 0, 'black', 'left', 'bottom', FONT)
        }
        len = parseFloat(len.toFixed(2))
        if (beginText !== undefined && endText.length !== 0) {
            len > 0 ? 
                this.fillText(endText, len, 0, 'black', 'left', 'bottom', FONT) : 
                this.fillText(endText, len, 0, 'black', 'right', 'bottom', FONT)
        }

        // 绘制向量的长度信息
        isShowInfo && this.fillText(Math.abs(len).toString(), len >> 1, 0, 'black', 'center', 'bottom', FONT)

        this.context2D.restore()
    }

    // 返回当前向量与X正方向的夹角, 以弧度表示
    public drawVectorFromLine(
        start: Vec2,
        end: Vec2, 
        arrowLen: number = 10, 
        beginText: string = '', 
        endText: string = '', 
        lineWidth: number = 1, 
        isLineDash: boolean = false, 
        isShowInfo: boolean = false, 
        isAlpha: boolean = false
    ): number 
    {
        // 获取从start - end形成的向量与X轴正方向[0, 1]之间以弧度表示的夹角
        const angle: number = Vec2.getOrientation(start, end, true)
        const diff: Vec2 = Vec2.difference(end, start)  // 计算出向量之间的差
        const len: number = diff.length // 计算出向量的大小
        this.context2D.save()
        this.context2D.translate(start.x, start.y)  // 局部坐标系原点变换到start
        this.context2D.rotate(angle)    // 局部坐标系旋转angle弧度
        this.drawVector(len, arrowLen, beginText, endText, lineWidth, isLineDash, isShowInfo, isAlpha)
        this.context2D.restore()
        return angle
    }

    public drawMouseLineProjection(): void {
        // 鼠标位置在线段范围外的绘制效果
        if (!this.isRangePoint) {
            this.drawVectorFromLine(this.lineStart, this.lineEnd, 10, this.lineStart.toString(), this.lineEnd.toString(), 1, false, true)
            return
        }

        // 鼠标位置在线段范围内
        let angle: number = 0
        let mousePt: Vec2 = Vec2.create(this.mouseX, this.mouseY)

        this.context2D.save()
        // 绘制向量
        angle = this.drawVectorFromLine(this.lineStart, this.lineEnd, 10, this.lineStart.toString(), this.lineEnd.toString(), 3, false, true)
        this.fillCircle(this.closePoint.x, this.closePoint.y, 5)    // 绘制在向量移动的圆点(投影点)
        this.drawVectorFromLine(this.lineStart, mousePt, 10, '', '', 1, true, true, false)  // 绘制线段起点到鼠标点向量
        this.drawVectorFromLine(mousePt, this.closePoint, 10, '', '', 1, true, true, false) // 绘制鼠标点到投影点的线段
        this.context2D.restore()

        // 绘制投影点的坐标信息(相对左上角的表示)
        this.context2D.save()
        this.context2D.translate(this.closePoint.x, this.closePoint.y)
        this.context2D.rotate(angle)
        this.drawCoordInfo('[ ' + (this.closePoint.x).toFixed(2) + ', ' + (this.closePoint.y).toFixed(2) + ' ]', 0, 0, 'center', 'top')
        this.context2D.restore()

        // 计算出线段与鼠标之间的夹角, 以弧度表示
        angle = Vec2.getAngle(Vec2.difference(this.lineEnd, this.lineStart), Vec2.difference(mousePt, this.lineStart))
        this.drawCoordInfo(angle.toFixed(2), this.lineStart.x, this.lineStart.y + 10, 'center', 'top')  // 绘制出夹角信息
    }

    // 碰撞检测(线段)
    public drawMouseLineHitTest(): void {
        if (!this.isRangePoint) {
            this.drawVectorFromLine(this.lineStart, this.lineEnd, 10, this.lineStart.toString(), this.lineEnd.toString(), 1, false, true)
            return
        }
        this.context2D.save()
        this.drawVectorFromLine(this.lineStart, this.lineEnd, 10, this.lineStart.toString(), this.lineEnd.toString(), 3, false, true)
        this.fillCircle(this.closePoint.x, this.closePoint.y, 5)
        this.context2D.restore()
    }

    public drawRectWithTitle(
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        isTranslate: boolean = false,
        title: string = '', 
        layout: ELayout = ELayout.CENTER_MIDDLE, 
        color: string = 'grey', 
        showCoord: boolean = true
    ): void 
    {
        this.context2D.save()
        this.context2D.fillStyle = color
        this.context2D.beginPath()
        this.context2D.rect(x, y, width, height)
        this.context2D.fill()
        if (title.length !== 0) {
            const rect: Rectangle = this.calcLocalTextRectangle(layout, title, width, height)
            const { x: rectX, y: rectY } = rect.origin
            const { width: rectWidth, height: rectHeight } = rect.size

            this.fillText(title, x + rectX, y + rectY, 'white', 'left', 'top', '10px sans-serif')
            this.strokeRect(x + rectX, y + rectY, rectWidth, rectHeight, 'rgba(0, 0, 0, 0.5)')
            this.fillCircle(x + rectX, y + rectY, 2)
        }
        if (showCoord) {
            x = isTranslate ? 0 : x
            y = isTranslate ? 0 : y
            this.strokeCoordinateAxis(x, y, width + 20, height + 20)
            this.fillCircle(x, y, 3)
        }
        this.context2D.restore()
    }

    public getHalf(num: number) {
        return num >>> 1
    }
}