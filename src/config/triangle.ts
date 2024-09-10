import { Config } from '@/types/config'
import common from './common'
import { Controller } from '@/enums'

const config: Array<Config.Item> = [
  ...(common as unknown as Array<Config.Item>),
  {
    type: Controller.colorPicker,
    title: '颜色',
    key: 'fill'
  }
]

export default config
