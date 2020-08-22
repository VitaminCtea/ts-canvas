let canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
let context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D

const center: { x: number, y: number } = {
    x: canvas.width >>> 1,
    y: canvas.height >>> 1
}

// canvas.addEventListener('mousemove', (e: MouseEvent) => {
//     center.x = e.clientX
//     center.y = e.clientY
// })

const createHexadecimalColor: () => string = () => {
    const hexadecimalColorChar: string = '0123456789ABCDEF'
    let result: string = '#'
    for (let i: number = 0; i < 6; i++) {
        result += hexadecimalColorChar[Math.floor(Math.random() * hexadecimalColorChar.length)]
    }
    return result
}

const queue: Ob[] = []

class Ob {
    public x: number
    public y: number
    public r: number
    public cc: string
    public o: number
    public s: number
    public theta: number
    public t: number
    constructor(x: number, y: number, r: number, cc: string, o: number, s: number) {
        this.x = x
        this.y = y
        this.r = r
        this.cc = cc
        this.theta = Math.random() * Math.PI * 2
        this.s = s
        this.o = o
        this.t = Math.random() * 150
    }
    public dr() {
        const ls: { x: number, y: number } = {
            x: this.x,
            y: this.y
        }
        this.theta += this.s
        this.x = center.x + Math.cos(this.theta) * this.t
        this.y = center.y + Math.sin(this.theta) * this.t
        context.beginPath()
        context.lineWidth = this.r
        context.strokeStyle = this.cc
        context.moveTo(ls.x, ls.y)
        context.lineTo(this.x, this.y)
        context.stroke()
        context.closePath()
    }
}

window.addEventListener('resize', resize)

function resize() {
    for (let i: number = 0; i < 101; i++) {
        // const radius: number = 30
        // const x: number = Math.random() * (canvas.width - 2 * radius) + radius
        // const y: number = Math.random() * (canvas.height - 2 * radius) + radius
        queue[i] = new Ob(canvas.width >>> 1, canvas.height >>> 1, 4, createHexadecimalColor(), Math.random() * 200 + 20, 0.02)
    }
}

function animate() {
    window.requestAnimationFrame(animate)
    context.fillStyle = 'rgba(0, 0, 0, 0.05)'
    context.fillRect(0, 0, canvas.width, canvas.height)
    queue.forEach(ob => ob.dr())
}

for (let i: number = 0; i < 10; i++) {
    // const radius: number = 30
    // const x: number = Math.random() * (canvas.width - 2 * radius) + radius
    // const y: number = Math.random() * (canvas.height - 2 * radius) + radius
    queue.push(new Ob(canvas.width >>> 1, canvas.height >>> 1, 5, 'red', Math.random() * 200 + 20, 2))
}

context.lineWidth = 2
context.globalAlpha = 0.5

resize()
animate()