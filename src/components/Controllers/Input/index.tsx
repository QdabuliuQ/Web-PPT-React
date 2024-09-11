import { memo, useCallback } from 'react'
import { Input, type InputProps } from 'antd'
import _ from 'lodash'

import useStore from '@/stores'
import type { Fabric } from '@/types/fabirc'

interface Props extends InputProps {
  propName: string
}

export default memo(function _Input({ propName, ...other }: Props) {
  const { canvasFabricOptionUpdate } = useStore()

  const changeEvent = useCallback(
    _.debounce(({ target: { value } }: any) => {
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

  return <Input {...(other ? other : {})} onChange={changeEvent} />
})
