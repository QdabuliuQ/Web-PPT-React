import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { fabric } from 'fabric'
import { ColorPicker, Radio, Select, Space } from 'antd'
import OptionItem from '../OptionItem'
import _ from 'lodash'
import useStore from '@/stores'
import { Fabric } from '@/types/fabirc'
import useTextureChange from './useTextureChange'
import style from './index.module.less'
import { getBgRectElementOption } from '@/utils/element'

const files = import.meta.glob('@/assets/image/*.png')
const images: Array<{ name: string; url: string }> = []
for (const key in files) {
  if (Object.prototype.hasOwnProperty.call(files, key)) {
    const keys = key.split('/')
    if (keys[keys.length - 1].indexOf('texture') !== -1) {
      const name = keys[keys.length - 1].replace('.png', '')
      images.push({
        name,
        url: ((await files[key]()) as any).default
      })
    }
  }
}

export default memo(function CanvasPanel() {
  const { canvasUpdate, activeCanvas } = useStore()
  const [value, setValue] = useState(1)
  const onChange = useCallback(({ target: { value } }: any) => {
    setValue(value)
    if (value === 1) {
      singleColorChange(null, '#fff')
      setName('')
    } else if (value === 2) {
      gradientColorChange(null, 'linear-gradient(90deg, rgba(0,0,0,0) 0%)')
      setName('')
    } else {
      setName('texture1')
      textureClickEvent('texture1')
    }
  }, [])

  const getBgrectElement = () => {
    const { instance } = useStore.getState()
    if (instance) {
      for (let i = 0; i < instance!._objects.length; i++) {
        const element = instance!._objects[i] as Fabric.Object
        if (element.property.type === 'background') {
          return element
        }
      }
    }
  }

  const singleColorChange = useCallback(
    _.debounce((_: unknown, value: string) => {
      const { instance, activeCanvas } = useStore.getState()
      const el = getBgrectElement()
      if (el) {
        el.set({
          fill: value
        })
        instance?.renderAll()
        canvasUpdate(instance!.toObject(), activeCanvas)
      }
    }, 200),
    []
  )

  const gradientColorChange = useCallback(
    _.debounce((_: unknown, value: string) => {
      console.log(value)

      const { instance, activeCanvas } = useStore.getState()
      const el = getBgrectElement()
      const color = value
        .substring(15 + 1, value.length - 1)
        .split(', ')
        .slice(1)
        .map((item) => {
          const info = item.split(' ')
          info[1] = (parseInt(info[1]) / 100) as any
          return {
            color: info[0],
            offset: Number(info[1])
          }
        })
      if (el) {
        const gradient = new fabric.Gradient({
          type: 'linear', // linear or radial
          gradientUnits: 'pixels', // pixels or pencentage 像素 或者 百分比
          coords: { x1: 0, y1: 0, x2: el.width, y2: 0 }, // 至少2个坐标对（x1，y1和x2，y2）将定义渐变在对象上的扩展方式
          colorStops: color
        })
        el.set({
          fill: gradient
        })
        instance?.renderAll()
        canvasUpdate(instance!.toObject(), activeCanvas)
      }
    }, 200),
    []
  )

  const {
    repeat,
    setRepeat,
    setName,
    textureClickEvent,
    repeatChangeEvent,
    repeatOption
  } = useTextureChange(getBgrectElement as any)

  const [defaultInfo, setDefaultInfo] = useState<any>()
  useEffect(() => {
    const bgRect = getBgRectElementOption(activeCanvas) as Fabric.Object
    if (bgRect) {
      console.log(bgRect.fill)

      setDefaultInfo(bgRect.fill)
      if (typeof bgRect.fill === 'string') {
        setValue(1)
      } else if ((bgRect.fill as any).type === 'linear') {
        setValue(2)
      } else {
        setValue(3)
        setRepeat((bgRect.fill as any).repeat)
      }
    }
  }, [activeCanvas])

  return (
    <div className={style.canvasPanel}>
      <Radio.Group onChange={onChange} value={value}>
        <Space direction="vertical">
          <Radio value={1}>纯色填充</Radio>
          <Radio value={2}>渐变填充</Radio>
          <Radio value={3}>纹理填充</Radio>
        </Space>
      </Radio.Group>
      {defaultInfo ? (
        <div className={style.panel}>
          {value === 1 ? (
            <OptionItem title="颜色">
              <ColorPicker
                defaultValue={defaultInfo.fill}
                onChange={singleColorChange}
                mode="single"
              />
            </OptionItem>
          ) : value === 2 ? (
            <OptionItem title="渐变色">
              <ColorPicker onChange={gradientColorChange} mode="gradient" />
            </OptionItem>
          ) : value === 3 ? (
            <>
              <OptionItem className={style.optionItem} title="纹理填充">
                <div className={style.texture}>
                  {images.map((item) => (
                    <div
                      onClick={() => textureClickEvent(item.name)}
                      key={item.url}
                      className={style.textureItem}
                    >
                      <img src={item.url} />
                    </div>
                  ))}
                </div>
              </OptionItem>
              <OptionItem className={style.optionItem} title="放置方式">
                <Select
                  className={style.select}
                  defaultValue={repeat}
                  options={repeatOption}
                  onChange={repeatChangeEvent}
                />
              </OptionItem>
            </>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  )
})
