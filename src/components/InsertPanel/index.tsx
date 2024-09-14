import { memo, useCallback, useMemo } from 'react'

import packages from '@/packages'
import useStore from '@/stores'
import {
  getCircleElement,
  getRectElement,
  getTextElement,
  getTriangleElement
} from '@/utils'

import ButtonItem from '../ButtonItem'

import style from './index.module.less'

export default memo(function InsertPanel() {
  const { activeCanvas, canvasFabricOptionUpdate } = useStore()

  const clickEvent = useCallback((icon: string) => {
    const { activeCanvas, instance } = useStore.getState()
    if (activeCanvas) {
      let element
      if (icon === 'i_rect') {
        element = getRectElement()
      } else if (icon === 'i_triangle') {
        element = getTriangleElement()
      } else if (icon === 'i_text') {
        element = getTextElement()
      } else if (icon === 'i_circle') {
        element = getCircleElement()
      }
      instance?.add(element as fabric.Object)
      instance?.renderAll()
      canvasFabricOptionUpdate(activeCanvas, instance?.toObject())
    }
  }, [])

  const items = useMemo(
    () => [
      {
        icon: 'i_rect',
        title: '矩形'
      },
      {
        icon: 'i_triangle',
        title: '三角形'
      },
      {
        icon: 'i_text',
        title: '文本'
      },
      {
        icon: 'i_circle',
        title: '圆形'
      }
    ],
    []
  )

  const finishEvent = useCallback((option: any) => {
    const { instance, activeCanvas } = useStore.getState()
    instance?.add(option)
    console.log(option, 'xxx')

    instance?.renderAll()
    canvasFabricOptionUpdate(activeCanvas, instance!.toObject())
  }, [])

  return (
    <div className={style.insertPanel}>
      {items.map((item) => (
        <ButtonItem
          key={item.icon}
          disabled={activeCanvas === ''}
          clickEvent={clickEvent}
          icon={item.icon}
          title={item.title}
        />
      ))}
      {Object.keys(packages).map((key: string) => {
        const Component = (packages as any)[key].component
        return <Component key={key} finish={finishEvent} />
      })}
    </div>
  )
})
