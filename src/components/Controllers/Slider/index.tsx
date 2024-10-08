import { memo, useCallback } from 'react'
import { Slider } from 'antd'
import { type SliderSingleProps } from 'antd/es/slider'
import _ from 'lodash'

import useStore from '@/stores'
import { Fabric } from '@/types/fabirc'

interface Props extends SliderSingleProps {
  propName: string
}

export default memo(function _Slider({ propName, ...other }: Props) {
  const { canvasFabricOptionUpdate } = useStore()
  const changeEvent = useCallback(
    _.debounce((value: number) => {
      const { instance, activeElement, activeCanvas } = useStore.getState()
      if (instance) {
        for (let i = 0; i < instance._objects.length; i++) {
          const element = instance._objects[i] as Fabric.Object
          if (element.property.id === activeElement) {
            if (Object.prototype.hasOwnProperty.call(element, propName)) {
              element.set({
                [propName]: value
              })
            } else if (
              Object.prototype.hasOwnProperty.call(element.property, propName)
            ) {
              element.set({
                property: {
                  ...element.property,
                  [propName]: value
                }
              })
            }

            instance.renderAll()
            canvasFabricOptionUpdate(activeCanvas, instance.toObject())
            break
          }
        }
      }
    }, 200),
    []
  )

  return <Slider {...(other ? other : {})} onChange={changeEvent} />
})
