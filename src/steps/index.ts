import { Steps } from '@/steps/components/steps'
import './style.css'
import './index.css'

const titles: string[] = [ '订单开始处理','开始拣货','打包商品','商品运输中','准备配送', '订单完成' ]
const descs: string[] = [
    '这是对订单处理的描述说明',
    '这是对开始拣货的描述说明',
    '这是对打包商品的描述说明',
    '这是对商品运输的描述说明',
    '这是对准备配送的描述说明',
    '这是对订单完成的描述说明'
]

const createContent = (titles: string[], descs: string[]) => titles.map((title, index) => ({ title, description: descs[index] }))

new Steps({
    el: document.getElementById('steps')!,  // ? 需要将步骤组件挂载到任意容器上
    content: createContent(titles, descs),  // # 每个步骤说明的数组
    successColor: '#D30074',    // = 步骤条成功的颜色
    fixedStep: {    // - 支持固定步骤
        enabled: true,  // ! 是否启用固定步骤
        specifySteps: 3 // ? 指定到哪个步骤
    },
    alignCenter: true,  // & 是否居中( 包括 title 和 description )
    // $ 当alignCenter为true时，title、description文本都会居中，在多段落时会不美观
    // $ 所以这个选项可以自定义每个描述文字信息的对齐方式，不受alignCenter属性影响，尤其对多段落的文本特别有用
    descriptionAlignment: 'left',
    direction: 'horizontal',    // % 支持横向和纵向布局
    // * 每个步骤的图标数组
    icons: [ 'icon-order__processing', 'icon-picking', 'icon-packing', 'icon-in__transit', 'icon-ready__ship', 'icon-order__completion' ]
})
