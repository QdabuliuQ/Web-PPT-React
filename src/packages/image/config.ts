import common from '@/config/common'
import { Config } from '@/types/config'

export default function config() {
  return [...(common() as unknown as Array<Config.Item>)]
}
