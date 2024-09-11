import { memo, useCallback, useState } from 'react'

import useStore from '@/stores'
import { Fabric } from '@/types/fabirc'

import style from './index.module.less'

interface Props {
  propName: string
  defaultValue: boolean
}

export default memo(function _Switch({ propName, defaultValue }: Props) {
  const { canvasFabricOptionUpdate } = useStore()

  const [status, setStatus] = useState(defaultValue)

  const clickEvent = useCallback(() => {
    const { instance, activeElement, activeCanvas } = useStore.getState()
    setStatus(!status)
    if (instance) {
      for (let i = 0; i < instance._objects.length; i++) {
        const element = instance._objects[i] as Fabric.Object
        if (element.property.id === activeElement) {
          if (Object.prototype.hasOwnProperty.call(element, propName)) {
            element.set({
              [propName]: !status
            })
          } else if (
            Object.prototype.hasOwnProperty.call(element.property, propName)
          ) {
            element.set({
              property: {
                ...element.property,
                [propName]: !status
              }
            })
          }

          instance.renderAll()
          canvasFabricOptionUpdate(activeCanvas, instance.toObject())
          break
        }
      }
    }
  }, [status])

  return (
    <div
      onClick={clickEvent}
      className={style.switch}
      style={{
        background: status ? '#c05316' : '#adadad',
        color: status ? '#fff' : '#fff'
      }}
    >
      {status ? '开启' : '关闭'}
    </div>
  )
})
