import { memo, useCallback, useEffect, useState } from 'react'
import { Button, ColorPicker, Radio, Select, Space, Tooltip } from 'antd'
import ButtonGroup from 'antd/es/button/button-group'
import { fabric } from 'fabric'
import _ from 'lodash'

import { useContextMenu } from '@/pages/Edit/components/List/useContextMenu'
import useStore from '@/stores'
import { Fabric } from '@/types/fabirc'
import { getBgRectElementOption } from '@/utils/element'

import Icon from '../Icon'
import OptionItem from '../OptionItem'

import useButtonHandle from './useButtonHandle'
import useTextureChange from './useTextureChange'

import style from './index.module.less'

const files = import.meta.glob('@/assets/image/*.png')
const images: Array<{ name: string; url: string }> = []
;(async function () {
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
})()

export default memo(function CanvasPanel() {
  const { canvasFabricOptionUpdate, activeCanvas, canvas } = useStore()
  const [value, setValue] = useState(1)

  const onChange = useCallback(({ target: { value } }: any) => {
    setValue(value)
    if (value === 0) {
      clearBgrectFill()
      setName('')
      setDefaultInfo(undefined)
    } else if (value === 1) {
      singleColorChange(null, '#fff')
      setName('')
      setDefaultInfo('#fff')
    } else if (value === 2) {
      gradientColorChange(null, 'linear-gradient(90deg, rgba(0,0,0,0) 0%)')
      setName('')
      setDefaultInfo([
        {
          color: 'rgba(0,0,0,0)',
          percent: 0
        }
      ])
    } else {
      setName('texture1')
      textureClickEvent('texture1')
      setRepeat('repeat')
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

  const clearBgrectFill = () => {
    const { instance, activeCanvas } = useStore.getState()
    const el = getBgrectElement()
    if (el) {
      el.set({
        fill: void 0
      })
      instance?.renderAll()
      canvasFabricOptionUpdate(activeCanvas, instance!.toObject())
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
        canvasFabricOptionUpdate(activeCanvas, instance!.toObject())
      }
    }, 200),
    []
  )

  const linearColorFormat = useCallback(
    (color: Array<{ color: string; offset: number }>) => {
      const res: Array<{ color: string; percent: number }> = []
      color.map((item) => {
        res.push({
          percent: item.offset * 100,
          color: item.color
        })
      })
      return res
    },
    []
  )

  const gradientColorChange = useCallback(
    _.debounce((_: unknown, value: string) => {
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
        canvasFabricOptionUpdate(activeCanvas, instance!.toObject())
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

  const [canvasInfo, setCanvasInfo] = useState<any>()
  const [defaultInfo, setDefaultInfo] = useState<any>()

  useEffect(() => {
    const bgRect = getBgRectElementOption(activeCanvas) as Fabric.Object
    if (bgRect) {
      setDefaultInfo(bgRect.fill)

      if (typeof bgRect.fill === 'undefined') {
        setValue(0)
      } else if (typeof bgRect.fill === 'string') {
        setValue(1)
      } else if ((bgRect.fill as any).type === 'linear') {
        setValue(2)
      } else {
        setValue(3)
        setRepeat((bgRect.fill as any).repeat)
      }
    }

    if (activeCanvas) {
      for (let i = 0; i < canvas.length; i++) {
        if (canvas[i].id === activeCanvas) {
          setCanvasInfo(canvas[i])
          break
        }
      }
    }
  }, [activeCanvas])

  const { updateAllEvent, resetAllEvent } = useButtonHandle()

  const resetEvent = useCallback(() => {
    resetAllEvent()
    clearBgrectFill()
    setName('')
    setValue(0)
  }, [])

  const { canvasId, menuClick } = useContextMenu()
  canvasId.current = activeCanvas
  const groupItemClickEvent = useCallback((type: string) => {
    menuClick(null, type)
  }, [])

  return (
    <div className={style.canvasPanel}>
      <Radio.Group onChange={onChange} value={value}>
        <Space direction="vertical">
          <Radio value={0}>无填充</Radio>
          <Radio value={1}>纯色填充</Radio>
          <Radio value={2}>渐变填充</Radio>
          <Radio value={3}>纹理填充</Radio>
        </Space>
      </Radio.Group>
      {defaultInfo && value !== 0 ? (
        <div className={style.panel}>
          {value === 1 ? (
            <OptionItem title="颜色">
              <ColorPicker
                key={value}
                defaultValue={defaultInfo}
                onChange={singleColorChange}
                mode="single"
              />
            </OptionItem>
          ) : value === 2 ? (
            <OptionItem title="渐变色">
              <ColorPicker
                key={value}
                defaultValue={
                  defaultInfo.colorStops
                    ? linearColorFormat(defaultInfo.colorStops)
                    : []
                }
                onChange={gradientColorChange}
                mode="gradient"
              />
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
      <div className={style.splitLine}></div>
      <Button
        onClick={updateAllEvent}
        className={style.btn}
        type="primary"
        block
      >
        应用全部幻灯片
      </Button>
      <Button onClick={resetEvent} className={style.btn} block>
        重置全部幻灯片
      </Button>
      <ButtonGroup className={style.btnGroup}>
        <Tooltip placement="top" title="新建">
          <Button
            onClick={() => groupItemClickEvent('new')}
            icon={<Icon icon="i_new" />}
          />
        </Tooltip>
        <Tooltip placement="top" title="复制">
          <Button
            onClick={() => groupItemClickEvent('copy')}
            icon={<Icon icon="i_copy" />}
          />
        </Tooltip>
        <Tooltip placement="top" title="删除">
          <Button
            onClick={() => groupItemClickEvent('delete')}
            icon={<Icon icon="i_delete" />}
          />
        </Tooltip>
        <Tooltip placement="top" title="清空">
          <Button
            onClick={() => groupItemClickEvent('clear')}
            icon={<Icon icon="i_clear" />}
          />
        </Tooltip>
        {canvasInfo ? (
          canvasInfo.visible ? (
            <Tooltip placement="top" title="隐藏">
              <Button
                onClick={() => groupItemClickEvent('unvisible')}
                icon={<Icon icon="i_unvisible" />}
              />
            </Tooltip>
          ) : (
            <Tooltip placement="top" title="显示">
              <Button
                onClick={() => groupItemClickEvent('visible')}
                icon={<Icon icon="i_visible" />}
              />
            </Tooltip>
          )
        ) : (
          <></>
        )}
      </ButtonGroup>
    </div>
  )
})
