import { ColorPicker } from './components/ColorPicker'
import './style.css'

const colorPicker = new ColorPicker({
    node: document.getElementById('colorPicker')!,
    colorMode: 'HSV',
    activeColorChange(color) {
        console.log(color)
    }
})

colorPicker.init()