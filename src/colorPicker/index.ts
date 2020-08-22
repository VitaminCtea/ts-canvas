window.onload = () => {
    const $ = (selector: string) => document.getElementById(selector) as HTMLElement

    const colorPickerPanelCanvas: HTMLCanvasElement = $('color-picker__panel') as HTMLCanvasElement
    const colorPickerBarCanvas: HTMLCanvasElement = $('color-picker__bar') as HTMLCanvasElement
    const colorSvpanelCursor: HTMLDivElement = $('color-svpanel__cursor') as HTMLDivElement
    const colorHueSliderThumb: HTMLDivElement = $('color-thumb') as HTMLDivElement
    const color: HTMLDivElement = $('color') as HTMLDivElement
    const colorPickerContent: HTMLDivElement = $('colorPickerContent') as HTMLDivElement

    const colorPickerBarContext: CanvasRenderingContext2D = colorPickerBarCanvas.getContext('2d') as CanvasRenderingContext2D
    const colorPickerPanelContext: CanvasRenderingContext2D = colorPickerPanelCanvas.getContext('2d') as CanvasRenderingContext2D

    colorPickerBarCanvas.width = 12
    colorPickerBarCanvas.height = colorPickerContent.clientHeight

    colorPickerPanelCanvas.width = 282
    colorPickerPanelCanvas.height = 214

    const { clientWidth: colorSvpanelCursorWidth, clientHeight: colorSvpanelCursorHeight } = colorSvpanelCursor

    enum Coordinate {
        TO_RIGHT,
        TO_TOP,
    }

    const colors = {
        defaultColor: '#f00',
        barColors: ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00'],
        toRightColors(toColor: string) {
            return ['#fff', toColor]
        },
        toTopColors: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)'],
    }

    type Options = {
        colors: string[]
        fillRect: [number, number, number, number]
        direction: Coordinate
        offsets?: number[]
    }

    const createLinearGradient = (context: CanvasRenderingContext2D, { offsets = [0, 1], colors, fillRect, direction }: Options) => {
        let startX: number = 0
        let startY: number = 0
        let endX: number = 0
        let endY: number = 0

        if (direction === Coordinate.TO_RIGHT) {
            endX = context.canvas.width
        } else {
            endY = context.canvas.height
        }

        const linearGradient: CanvasGradient = context.createLinearGradient(startX, startY, endX, endY)
        offsets.forEach((offset, index) => linearGradient.addColorStop(offset, colors[index]))
        context.fillStyle = linearGradient
        context.fillRect.apply(context, fillRect)
    }

    const initColorPickerBar = () => {
        // -> 创建颜色条
        createLinearGradient(colorPickerBarContext, {
            offsets: [0, 0.17, 0.33, 0.5, 0.67, 0.83, 1],
            colors: colors.barColors,
            fillRect: [0, 0, colorPickerBarCanvas.width, colorPickerBarCanvas.height],
            direction: Coordinate.TO_TOP,
        })
    }

    const initColorPickerPanel = (toColor: string = colors.defaultColor) => {
        // => 创建从左到右的线性渐变(白色 -> COLOR_PICKER_PANEL_DEFAULT_COLOR)
        createLinearGradient(colorPickerPanelContext, {
            colors: colors.toRightColors(toColor),
            fillRect: [0, 0, colorPickerPanelCanvas.width, colorPickerPanelCanvas.height],
            direction: Coordinate.TO_RIGHT,
        })

        // ?> 创建从下到上的线性渐变(黑色的透明度 -> 黑色的透明度)
        createLinearGradient(colorPickerPanelContext, {
            colors: colors.toTopColors,
            fillRect: [0, 0, colorPickerPanelCanvas.width, colorPickerPanelCanvas.height],
            direction: Coordinate.TO_TOP
        })
    }

    const updateColorPickerPanel = (toString: string) => initColorPickerPanel(toString)

    const windowToCanvas = (canvasEl: HTMLCanvasElement, event: MouseEvent): { x: number; y: number } => {
        const rect: DOMRect = canvasEl.getBoundingClientRect()
        const x: number = event.clientX - rect.left
        const y: number = event.clientY - rect.top
        return {
            x,
            y,
        }
    }

    const setColor = (canvasEl: HTMLCanvasElement, context: CanvasRenderingContext2D, event: MouseEvent) => {
        const { x, y } = windowToCanvas(canvasEl, event)
        const { newX, newY } = boundaryTreatment(canvasEl, x, y)
        colorSvpanelCursor.style.left = `${ newX }px`
        colorSvpanelCursor.style.top = `${ newY }px`
        const [ red, green, blue, alpha ] = getColor(newX, newY, canvasEl, context)
        color.style.backgroundColor = `rgba(${ red }, ${ green }, ${ blue }, ${ alpha })`
    }

    const getColor = (x: number, y: number, canvasEl: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
        const { width, height } = getCanvasRect(canvasEl)
        const imageData: ImageData = context.getImageData(0, 0, width, height)
        const data: Uint8ClampedArray = imageData.data
        const redIndex: number = y * (width * 4) + x * 4
        const alpha: number = data[redIndex + 3]

        return [data[redIndex], data[redIndex + 1], data[redIndex + 2], alpha === 0 ? 1 : alpha / 255]
    }

    const getCanvasRect = (canvasEl: HTMLCanvasElement) => ({ width: canvasEl.clientWidth, height: canvasEl.clientHeight })

    const boundaryTreatment = (canvasEl: HTMLCanvasElement, x: number, y: number): { newX: number, newY: number } => {
        const { width, height } = getCanvasRect(canvasEl)
        x = Math.max(Math.min(x, width - 1), 0)
        y = Math.max(Math.min(y, height), 0)
        return { newX: x, newY: y }
    }

    const moveThumb = (canvasEl: HTMLCanvasElement, context: CanvasRenderingContext2D, event: MouseEvent) => {
        let { x, y } = windowToCanvas(canvasEl, event)
        if (y >= 0 && y <= canvasEl.clientHeight) {
            const { newY } = boundaryTreatment(canvasEl, x, y)
            try {
                const [ red, green, blue, alpha ] = getColor(0, newY, canvasEl, context)
                const rgb = `rgba(${ red }, ${ green }, ${ blue }, ${ alpha })`
                updateColorPickerPanel(rgb)
                colorHueSliderThumb.style.top = `${ newY }px`
                color.style.backgroundColor = rgb
            } catch (e) {
                /**
                 * $ Will report a mistake
                 * = DOMException: Failed to execute 'addColorStop' on 'CanvasGradient': 
                 * =The value provided ('rgba(undefined, undefined, undefined, NaN)') could not be parsed as a color.
                 * */ 
            }
        }
    }

    const registerEvent = (el: HTMLElement, callback: (...args: any[]) => void) => {
        el.addEventListener('mousedown', (event: MouseEvent) => {
            callback(event)
            document.onmousemove = callback
            document.onmouseup = () => (document.onmouseup = document.onmousemove = null)
        })
    }

    registerEvent(colorPickerPanelCanvas, setColor.bind(null, colorPickerPanelCanvas, colorPickerPanelContext))
    registerEvent(colorPickerBarCanvas, moveThumb.bind(null, colorPickerBarCanvas, colorPickerBarContext))

    initColorPickerBar()
    initColorPickerPanel()
}
