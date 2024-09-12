import { useCallback } from 'react'

import useStore from '@/stores'
import { getRandomID, initElement } from '@/utils'

export default function useElementHandle() {
  const getElementByInstance = (eid: string) => {
    const { instance } = useStore.getState()
    for (let i = 0; i < instance!._objects.length; i++) {
      const element = instance!._objects[i]
      if (element.property.id === eid) {
        return element
      }
    }
    return null
  }

  // 元素删除
  const elementDeleteEvent = useCallback((eid: string) => {
    const {
      activeCanvas,
      activeElement,
      instance,
      canvasFabricOptionUpdate,
      activeElementUpdate
    } = useStore.getState()
    const element = getElementByInstance(eid)
    if (element) {
      instance?.remove(element)
      instance?.renderAll()
      canvasFabricOptionUpdate(activeCanvas, instance!.toObject())
      if (activeElement === eid) {
        activeElementUpdate('')
      }
    }
  }, [])

  // 元素锁定
  const elementLockChangeEvent = useCallback(
    (eid: string, type: 'lock' | 'unlock') => {
      const { activeCanvas, instance, canvasFabricOptionUpdate } =
        useStore.getState()
      const element = getElementByInstance(eid)
      if (element) {
        element.set({
          lockMovementX: type === 'lock',
          lockMovementY: type === 'lock'
        })
        instance?.renderAll()
        canvasFabricOptionUpdate(activeCanvas, instance!.toObject())
      }
    },
    []
  )

  // 元素复制
  const elementCopyEvent = useCallback((eid: string) => {
    const { activeCanvas, instance, canvasFabricOptionUpdate } =
      useStore.getState()
    const element = getElementByInstance(eid)
    if (element) {
      element.clone(function callback(obj: any) {
        const id = getRandomID(10)
        obj.set({
          left: obj.left + 10,
          top: obj.top + 10,
          property: {
            type: obj.property.type,
            id
          }
        })
        initElement(obj)
        // 添加到画布
        instance!.add(obj)
        instance?.renderAll()
        canvasFabricOptionUpdate(activeCanvas, instance?.toObject())
      })
    }
  }, [])

  // 元素层级修改
  const elementLayoutChange = useCallback((eid: string, type: string) => {
    const { activeCanvas, instance, canvasFabricOptionUpdate } =
      useStore.getState()
    const element = getElementByInstance(eid)
    if (element) {
      ;(instance as any)[type](element)
      for (let i = 0; i < instance!._objects.length; i++) {
        if (instance!._objects[i].property.type === 'background') {
          instance!.sendToBack(instance!._objects[i])
          break
        }
      }
      instance?.renderAll()
      canvasFabricOptionUpdate(activeCanvas, instance?.toObject())
    }
  }, [])

  return {
    elementDeleteEvent,
    elementLockChangeEvent,
    elementCopyEvent,
    elementLayoutChange
  }
}
