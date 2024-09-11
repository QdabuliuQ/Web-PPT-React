import { memo, useCallback } from 'react'
import { Select, type SelectProps } from 'antd'
import _ from 'lodash'

import useStore from '@/stores'
import { type Fabric } from '@/types/fabirc'

import style from './index.module.less'

interface Props extends SelectProps {
  propName: string
}

export default memo(function _Select({ propName, ...other }: Props) {
  const { canvasFabricOptionUpdate } = useStore()

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
            canvasFabricOptionUpdate(activeCanvas, instance.toObject())
            break
          }
        }
      }
    }, 200),
    []
  )

  return (
    <Select
      className={style.select}
      {...(other ? other : {})}
      onChange={changeEvent}
    />
  )
})
