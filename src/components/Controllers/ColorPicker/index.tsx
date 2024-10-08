import { memo, useCallback } from 'react'
import { ColorPicker, type ColorPickerProps } from 'antd'
import _ from 'lodash'

import useStore from '@/stores'
import { Fabric } from '@/types/fabirc'

import style from './index.module.less'

interface Props extends ColorPickerProps {
  propName: string
}

export default memo(function _ColorPicker({ propName, ...other }: Props) {
  const { canvasFabricOptionUpdate } = useStore()

  const changeEvent = useCallback(
    _.debounce((_: unknown, color: string) => {
      const { instance, activeElement, activeCanvas } = useStore.getState()
      if (instance) {
        for (let i = 0; i < instance._objects.length; i++) {
          const element = instance._objects[i] as Fabric.Object
          if (element.property.id === activeElement) {
            if (Object.prototype.hasOwnProperty.call(element, propName)) {
              element.set({
                [propName]: color
              })
            } else if (
              Object.prototype.hasOwnProperty.call(element.property, propName)
            ) {
              element.set({
                property: {
                  ...element.property,
                  [propName]: color
                }
              })
            }
            console.log(propName, element)

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
    <ColorPicker
      onChange={changeEvent}
      className={style.colorPicker}
      {...(other ? other : {})}
    />
  )
})
