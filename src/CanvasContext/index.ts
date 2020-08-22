import { Application } from "@/Application/index"
import { Rectangle } from "@/dataStructure/index"
import { EImageFillType } from '@/enum/index'

interface Canvas2DContextAttributes {
    alpha?: boolean
}

export type TextAlign = 'start' | 'left' | 'center' | 'right' | 'end'

export type TextBaseline = 'alphabetic' | 'hanging' | 'top' | 'middle' | 'bottom'

export type FontType = '10px sans-serif' | '15px sans-serif' | '20px sans-serif' | '25px sans-serif'

export class Canvas2DApplication extends Application {
    public context2D: CanvasRenderingContext2D
    public constructor(canvas: HTMLCanvasElement, contextAttributes?: Canvas2DContextAttributes) {
        super(canvas)
        this.context2D = this.canvas.getContext('2d', contextAttributes) as CanvasRenderingContext2D
    }
    public fillCircle(x: number, y: number, radius: number, fillStyle: string | CanvasGradient | CanvasPattern = 'red'): void {
        if (this.context2D !== null) {
            this.context2D.save()
            this.context2D.fillStyle = fillStyle
            this.context2D.beginPath()
            this.context2D.arc(x, y, radius, 0, Math.PI * 2)
            this.context2D.fill()
            this.context2D.restore()
        }
    }
    public strokeLine(x0: number, y0: number, x1: number, y1: number): void {
        if (this.context2D !== null) {
            this.context2D.beginPath()
            this.context2D.moveTo(x0, y0)
            this.context2D.lineTo(x1, y1)
            this.context2D.stroke()
        }
    }
    public strokeCoordinateAxis(originX: number, originY: number, width: number, height: number): void {
        if (this.context2D !== null) {
            this.context2D.save()

            this.context2D.strokeStyle = 'red'
            this.strokeLine(originX, originY, originX + width, originY)

            this.context2D.strokeStyle = 'blue'
            this.strokeLine(originX, originY, originX, originY + height)

            this.context2D.restore()
        }
    }
    public strokeGrid(color: string = 'grey', space: number = 10): void {
        if (this.context2D !== null) {
            this.context2D.save()

            this.context2D.strokeStyle = color
            this.context2D.lineWidth = 0.5

            for (let i: number = space + 0.5; i < this.canvas.width; i += space) {
                this.strokeLine(i, 0, i, this.canvas.height)
            }
            for (let i: number = space + 0.5; i < this.canvas.height; i += space) {
                this.strokeLine(0, i, this.canvas.width, i)
            }

            this.context2D.restore()

            // this.fillCircle(0, 0, 5, 'green')
            // this.strokeCoordinateAxis(0, 0, this.canvas.width, this.canvas.height)
        }
    }
    public fillText(
        text: string, 
        x: number, 
        y: number,
        color: string = 'white', 
        align: TextAlign = 'left', 
        baseline: TextBaseline = 'top', 
        font: FontType = '10px sans-serif'
    ): void {
        if (this.context2D !== null) {
            this.context2D.save()
            this.context2D.textAlign = align
            this.context2D.textBaseline = baseline
            this.context2D.font = font
            this.context2D.fillStyle = color
            this.context2D.fillText(text, x, y)
            this.context2D.restore()
        }
    }
    public drawImage(
        img: HTMLImageElement | HTMLCanvasElement,
        destRect: Rectangle,
        fillType: EImageFillType = EImageFillType.STRETCH,
        srcRect: Rectangle = Rectangle.create(0, 0, img.width, img.height),
    ): boolean {
        if (this.context2D === null || srcRect.isEmpty() || destRect.isEmpty()) return false
        if (fillType === EImageFillType.STRETCH) {
            const { x: srcRectX, y: srcRectY } = srcRect.origin
            const { width: srcRectWidth, height: srcRectHeight } = srcRect.size

            const { x: destRectX, y: destRectY } = destRect.origin
            const { width: destRectWidth, height: destRectHeight } = destRect.size

            this.context2D.drawImage(img, srcRectX, srcRectY, srcRectWidth, srcRectHeight, destRectX, destRectY, destRectWidth, destRectHeight)
        } else {
            let rows: number = Math.ceil(destRect.size.width / srcRect.size.width)
            let columns: number = Math.ceil(destRect.size.height / srcRect.size.height)

            let left: number = 0
            let top: number = 0
            let right: number = 0
            let bottom: number = 0
            let width: number = 0
            let height: number = 0

            let destRight: number = destRect.origin.x + destRect.size.width
            let destBottom: number = destRect.origin.y + destRect.size.height

            if (fillType === EImageFillType.REPEAT_X) columns = 1
            else if (fillType === EImageFillType.REPEAT_Y) rows = 1

            for (let i: number = 0; i < rows; i++) {
                for (let j: number = 0; j < columns; j++) {
                    left = destRect.origin.x + i * srcRect.size.width
                    top = destRect.origin.y + j * srcRect.size.height

                    width = srcRect.size.width
                    height = srcRect.size.height

                    right = left + width
                    bottom = top + height

                    if (right > destRight) width = srcRect.size.width - (right - destRight)
                    if (bottom > destBottom) height = srcRect.size.height - (bottom - destBottom)

                    this.context2D.drawImage(img, srcRect.origin.x, srcRect.origin.y, width, height, left, top, width, height)
                }
            }
        }
        return true
    }
}

export class WebGLApplication extends Application {
    public context3D: WebGLRenderingContext
    public constructor(canvas: HTMLCanvasElement, contextAttributes?: WebGLContextAttributes) {
        super(canvas)
        this.context3D = this.canvas.getContext('3d', contextAttributes) as WebGLRenderingContext
        if (this.context3D === null) throw new Error('无法创建WebGLRenderingContext上下文对象')
    }
}