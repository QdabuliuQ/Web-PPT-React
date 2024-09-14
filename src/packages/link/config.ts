import common from '@/config/common'
import { Controller } from '@/enums'
import { Config } from '@/types/config'

export default function config() {
  return [
    ...(common() as unknown as Array<Config.Item>),
    {
      type: Controller.input,
      title: '跳转地址',
      key: 'url',
      max: 200,
      min: 0
    },
    {
      type: Controller.input,
      title: '文本内容',
      key: 'text',
      max: 200,
      min: 0
    }
  ]
}
