import { useCallback } from 'react'

import useStore from '@/stores'
import { Fabric } from '@/types/fabirc'

export default function useElementAlign() {
  const alignHandle = useCallback((eid: string, align: string) => {
    const { instance, activeCanvas, canvasFabricOptionUpdate } =
      useStore.getState()

    const { width, height } = instance!._objects[0] as Fabric.Object
    for (let j = 1; j < instance!._objects.length; j++) {
      const element = instance!._objects[j] as Fabric.Object
      if ((element as Fabric.Object).property.id === eid) {
        if (align === 'align_left') {
          element.set({
            left: 0
          })
        } else if (align === 'align_right') {
          element.set({
            left: width - element.width * element.scaleX
          })
        } else if (align === 'align_vcenter') {
          element.set({
            left: width / 2 - (element.width * element.scaleX) / 2
          })
        } else if (align === 'align_center') {
          element.set({
            left: width / 2 - (element.width * element.scaleX) / 2,
            top: height / 2 - (element.height * element.scaleY) / 2
          })
        } else if (align === 'align_top') {
          element.set({
            top: 0
          })
        } else if (align === 'align_hcenter') {
          element.set({
            top: height / 2 - (element.height * element.scaleY) / 2
          })
        } else if (align === 'align_bottom') {
          element.set({
            top: height - element.height * element.scaleY
          })
        }
        element.setCoords()
        instance?.renderAll()
        canvasFabricOptionUpdate(activeCanvas, instance!.toObject())
        break
      }
    }
  }, [])

  return alignHandle
}
