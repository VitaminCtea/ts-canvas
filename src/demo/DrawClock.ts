import { Canvas2DApplication } from "@/CanvasContext/index"
import { colors } from '@/colors/index'

export class DrawClock extends Canvas2DApplication {
    private static FONT_HEIGHT: number = 15
    private static MARGIN: number = 35
    private static NUMERAL_SPACING: number = 20
    private hand_truncation: number
    private hour_hand_truncation: number
    private radius: number
    private hand_radius: number
    private centerX: number
    private centerY: number
    private timer: any
    constructor(canvas: HTMLCanvasElement) {
        super(canvas)
        this.hand_truncation = canvas.width / 25
        this.hour_hand_truncation = canvas.width / 10
        this.radius = (canvas.width >>> 1) - DrawClock.MARGIN - 200
        this.hand_radius = this.radius + DrawClock.NUMERAL_SPACING
        this.centerX = canvas.width >>> 1
        this.centerY = canvas.height >>> 1
    }
    private drawCircle(): void {
        this.addShadow(() => {
            this.context2D.strokeStyle = colors[14]
            this.context2D.lineWidth = 8
            this.context2D.beginPath()
            this.context2D.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2, true)
            this.context2D.stroke()
        }, colors[1], 10)
    }
    private drawNumerals(): void {
        const numerals: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        const radius: number = this.hand_radius - 55
        let angle: number = 0
        let numeralWidth: number = 0
        numerals.forEach(numeral => {
            angle = Math.PI * 2 / 12 * (numeral - 3)
            numeralWidth = this.context2D.measureText(numeral.toString()).width
            this.addShadow(() => 
                this.context2D.fillText(
                    numeral.toString(), 
                    this.centerX + Math.cos(angle) * radius - numeralWidth / 2, 
                    this.centerY + Math.sin(angle) * radius + DrawClock.FONT_HEIGHT / 3
                )
            )
        })
    }
    private drawCenter(): void {
        this.addShadow(() => {
            this.context2D.fillStyle = colors[1]
            this.context2D.beginPath()
            this.context2D.arc(this.centerX, this.centerY, 6, 0, Math.PI * 2, true)
            this.context2D.fill()
        }, colors[1], 4, 2, 2)
    }
    private drawHand(loc: number, isHour: boolean, color: string): void {
        const angle: number = (Math.PI * 2) * (loc / 60) - Math.PI / 2
        const handRadius: number = isHour ? this.radius - this.hour_hand_truncation : this.radius - this.hand_truncation

        this.addShadow(() => {
            this.context2D.strokeStyle = color
            this.context2D.beginPath()
            this.context2D.moveTo(this.centerX, this.centerY)
            this.context2D.lineTo(this.centerX + Math.cos(angle) * handRadius, this.centerY + Math.sin(angle) * handRadius)
            this.context2D.stroke()
        })
    }
    private drawHands(): void {
        const date: Date = new Date()
        let hour: number = date.getHours()
        hour = hour > 12 ? hour - 12 : hour
        this.drawHand(hour * 5 + (date.getMinutes() / 60) * 5, true, colors[5])
        this.drawHand(date.getMinutes(), false, colors[9])
        this.drawHand(date.getSeconds(), false, colors[11])
    }
    private drawClock(): void {
        this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.drawCircle()
        this.drawHands()
        this.drawNumerals()
        this.drawMark()
        this.drawCenter()
        this.drawBrandText()
    }
    private drawMark(): void {
        for (let i: number = 0; i < 60; i++) {
            this.context2D.save()
            this.context2D.translate(this.centerX, this.centerY)
            this.context2D.beginPath()
            if (i % 5 === 0) {
                this.context2D.lineWidth = 2
                this.context2D.rotate(Math.PI / 6 * i)
                this.context2D.beginPath()
                this.context2D.moveTo(this.radius - 10, 0)
                this.context2D.lineTo(this.radius - 20, 0)
                this.context2D.stroke()
            } else {
                const angle: number = (i * 6) * Math.PI / 180
                const radius: number = this.radius - 15
                this.context2D.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 2, 0, Math.PI * 2, false)
                this.context2D.fill()
            }
            this.context2D.restore()
        }
    }
    private drawBrandText(): void {
        const BAND: string = 'THOOYORK'
        const DESCRIPTION: string = 'Germany'
        const SPACING: number = (this.radius - this.hand_truncation) >>> 1
        const width: number = this.context2D.measureText('W').width
        const height: number = width + width / 20

        this.context2D.save()
        this.context2D.textAlign = 'center'
        this.context2D.textBaseline = 'middle'

        this.context2D.save()
        this.context2D.font = '14px Arial'
        this.context2D.fillText(BAND, this.centerX, this.centerY + SPACING)

        this.context2D.save()
        this.context2D.font = '12px Arial'
        this.context2D.fillText(DESCRIPTION, this.centerX, this.centerY + SPACING + height)
        this.context2D.restore()

        this.context2D.restore()

        this.context2D.restore()
    }
    private addShadow(
        callback: () => void, 
        shadowColor: string = '#000', 
        shadowBlur: number = 6, 
        shadowOffsetX: number = 4, 
        shadowOffsetY: number = 4
    ): void {
        this.context2D.save()
        this.context2D.shadowColor = shadowColor
        this.context2D.shadowBlur = shadowBlur
        this.context2D.shadowOffsetX = shadowOffsetX
        this.context2D.shadowOffsetY = shadowOffsetY
        callback()
        this.context2D.restore()
    }
    public start(): void {
        this.context2D.font = DrawClock.FONT_HEIGHT + 'px Arial'
        this.timer = setInterval(this.drawClock.bind(this), 1000)
    }
    public stop(): void {
        clearInterval(this.timer)
    }
}