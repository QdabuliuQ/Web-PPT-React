import { Input, type InputProps } from 'antd'
import { memo, useCallback } from 'react'

import useStore from '@/stores'
import type { Fabric } from '@/types/fabirc'
import _ from 'lodash'

interface Props extends InputProps {
  propName: string
}

export default memo(function _Input({ propName, ...other }: Props) {
  const { canvasUpdate } = useStore()

  const changeEvent = useCallback(
    _.debounce(({ target: { value } }: any) => {
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

  return <Input {...(other ? other : {})} onChange={changeEvent} />
})
