import { Controller } from '@/enums'
import { Config } from '@/types/config'

import common from './common'

const config: Array<Config.Item> = [
  ...(common as unknown as Array<Config.Item>),
  {
    type: Controller.colorPicker,
    title: '颜色',
    key: 'fill'
  }
]

export default config
