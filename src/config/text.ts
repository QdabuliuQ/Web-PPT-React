import { Controller } from '@/enums'
import { Config } from '@/types/config'

import common from './common'

const config: Array<Config.Item> = [
  ...(common as unknown as Array<Config.Item>),
  {
    title: '文本内容',
    type: Controller.input,
    key: 'text',
    property: {
      maxLength: 200
    }
  },
  {
    title: '颜色',
    type: Controller.colorPicker,
    key: 'fill'
  },
  {
    title: '字体大小',
    type: Controller.inputNumber,
    property: {
      min: 0,
      max: 500,
      precision: 0
    },
    key: 'fontSize'
  },
  {
    title: '对齐方式',
    type: Controller.select,
    property: {
      options: [
        {
          label: '左对齐',
          value: 'left'
        },
        {
          label: '右对齐',
          value: 'right'
        },
        {
          label: '居中',
          value: 'center'
        },
        {
          label: '两端对齐',
          value: 'justify'
        },
        {
          label: '两端对齐（左）',
          value: 'justify-left'
        },
        {
          label: '两端对齐（右）',
          value: 'justify-right'
        }
      ]
    },
    key: 'textAlign'
  },
  {
    title: '行高',
    type: Controller.inputNumber,
    property: {
      min: 0,
      max: 500,
      precision: 2
    },
    key: 'lineHeight'
  },
  {
    title: '上划线',
    type: Controller.switch,
    key: 'overline'
  },
  {
    title: '下划线',
    type: Controller.switch,
    key: 'underline'
  },
  {
    title: '删除线',
    type: Controller.switch,
    key: 'linethrough'
  },
  {
    title: '字体风格',
    type: Controller.select,
    property: {
      options: [
        {
          label: '默认',
          value: 'normal'
        },
        {
          label: 'italic',
          value: 'italic'
        },
        {
          label: 'oblique',
          value: 'oblique'
        }
      ]
    },
    key: 'fontStyle'
  }
]

export default config
