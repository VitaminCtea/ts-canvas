import { Steps } from '@/steps/components/steps'
import '@/steps/style.css'

new Steps({
    el: document.getElementById('steps')!,
    content: [
        { text: '1', title: '步骤1', description: '这是步骤1这是步骤1这是步骤1这是步骤1' },
        { text: '2', title: '步骤2', description: '这是步骤2' },
        { text: '3', title: '步骤3', description: '这是步骤3' },
        { text: '4', title: '步骤4', description: '这是步骤4' },
        { text: '5', title: '步骤5', description: '这是步骤5' }
    ],
    successColor: '#D30074',
    fixedStep: {
        enabled: true,
        specifySteps: 3
    },
    alignCenter: true,
    descriptionAlignment: [ 'justify', 'center', 'center', 'center', 'center' ]
})
