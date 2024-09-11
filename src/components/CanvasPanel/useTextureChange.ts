import { useCallback, useMemo, useState } from 'react'
import { fabric } from 'fabric'

import useStore from '@/stores'
import { Fabric } from '@/types/fabirc'
import { getAssetsFile } from '@/utils'

export default function useTextureChange(
  getBgrectElement: () => Fabric.Object
) {
  const { canvasFabricOptionUpdate } = useStore()

  const [name, setName] = useState('texture1')
  const [repeat, setRepeat] = useState('repeat')

  const updateBgRect = (name: string, repeat: string) => {
    fabric.Image.fromURL(getAssetsFile(`image/${name}.png`), function (img) {
      const { instance, activeCanvas } = useStore.getState()
      const el = getBgrectElement()
      el?.set({
        fill: new fabric.Pattern({
          source: img.getElement() as HTMLImageElement,
          repeat
        })
      })
      instance?.renderAll()
      canvasFabricOptionUpdate(activeCanvas, instance!.toObject())
    })
  }

  const repeatChangeEvent = useCallback(
    (value: string) => {
      setRepeat(value)
      updateBgRect(name, value)
    },
    [name]
  )

  const textureClickEvent = useCallback(
    (name: string) => {
      setName(name)
      updateBgRect(name, repeat)
    },
    [repeat]
  )

  const repeatOption = useMemo(
    () => [
      { value: 'repeat', label: '重复' },
      { value: 'repeat-x', label: 'X轴重复' },
      { value: 'repeat-y', label: 'Y轴重复' },
      { value: 'no-repeat', label: '不重复' }
    ],
    []
  )

  return {
    repeat,
    setRepeat,
    setName,
    textureClickEvent,
    repeatChangeEvent,
    repeatOption
  }
}
