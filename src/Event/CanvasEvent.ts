import { Vec2 } from "@/dataStructure/index"
import { CanvasInputEvent } from "./CanvasInputEvent"

export class CanvasMouseEvent extends CanvasInputEvent {
    public button: number
    public canvasPosition: Vec2
    public localPosition: Vec2
    public constructor(canvasPos: Vec2, button: number, altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false) {
        super(altKey, ctrlKey, shiftKey)
        this.canvasPosition = canvasPos
        this.button = button
        this.localPosition = Vec2.create()
    }
}

export class CanvasKeyBoardEvent extends CanvasInputEvent {
    public key: string
    public keyCode: number
    public repeat: boolean
    public constructor(key: string, keyCode: number, repeat: boolean, altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false) {
        super(altKey, ctrlKey, shiftKey)
        this.key = key
        this.keyCode = keyCode
        this.repeat = repeat
    }
}