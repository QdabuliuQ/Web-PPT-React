import useStore from '@/stores'
import { Fabric } from '@/types/fabirc'
import { InputNumber, type InputNumberProps } from 'antd'
import _ from 'lodash'
import { memo, useCallback } from 'react'

import style from './index.module.less'

interface Props extends InputNumberProps {
  propName: string
}

export default memo(function _InputNumber({ propName, ...other }: Props) {
  const { canvasUpdate } = useStore()

  const changeEvent = useCallback(
    _.debounce((value: any) => {
      const { instance, activeElement, activeCanvas } = useStore.getState()
      if (instance) {
        for (let i = 0; i < instance._objects.length; i++) {
          const element = instance._objects[i] as Fabric.Object
          if (element.property.id === activeElement) {
            element.set({
              [propName]: value
            })

            instance.renderAll()
            canvasUpdate(instance.toObject(), activeCanvas)
            break
          }
        }
      }
    }, 200),
    []
  )

  return (
    <InputNumber
      className={style.inputNumber}
      {...(other ? other : {})}
      onChange={changeEvent}
    />
  )
})
