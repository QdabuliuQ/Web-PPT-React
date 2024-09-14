import { memo, useEffect, useMemo, useState } from 'react'
import {
  Collapse,
  type ColorPickerProps,
  type InputNumberProps,
  type InputProps,
  type SelectProps,
  type SliderSingleProps
} from 'antd'

import config from '@/config'
import { Controller } from '@/enums'
import packages from '@/packages'
import useStore from '@/stores'
import { type Config } from '@/types/config'
import { type Fabric } from '@/types/fabirc'
import { getElementOption } from '@/utils'

import ColorPicker from '../Controllers/ColorPicker'
import HandleButton from '../Controllers/HandleButton'
import Input from '../Controllers/Input'
import InputNumber from '../Controllers/InputNumber'
import LayoutButton from '../Controllers/LayoutButton'
import PositionButton from '../Controllers/PositionButton'
import Select from '../Controllers/Select'
import Slider from '../Controllers/Slider'
import Switch from '../Controllers/Switch'
import OptionItem from '../OptionItem'

import style from './index.module.less'

export default memo(function ElementPanel() {
  const { activeElement, activeCanvas, canvas } = useStore()

  const [info, setInfo] = useState<any>()
  const [elConfig, setElConfig] = useState<Array<Config.Item> | null>(null)

  useEffect(() => {
    const _info = getElementOption(activeCanvas, activeElement) as Fabric.Object
    setInfo(_info)
    if (_info) {
      if ((config as any)[`${_info.property.type}Config`]) {
        setElConfig((config as any)[`${_info.property.type}Config`]())
      } else {
        setElConfig(
          (packages as any)[
            `${_info.property.type.substring(0, 1).toUpperCase()}${_info.property.type.substring(1)}`
          ].info.config()
        )
      }
    }
  }, [activeElement, canvas])

  const basicInfoPanel = useMemo(
    () => [
      {
        key: '1',
        label: '基本属性',
        children: info
          ? [
              <div key={1} className={style.infoItem}>
                <div className={style.itemTitle}>宽度</div>
                <div className={style.itemData}>
                  {(info.width * info.scaleX).toFixed(0)} Px
                </div>
              </div>,
              <div key={2} className={style.infoItem}>
                <div className={style.itemTitle}>高度</div>
                <div className={style.itemData}>
                  {(info.height * info.scaleY).toFixed(0)} Px
                </div>
              </div>,
              <div key={3} className={style.infoItem}>
                <div className={style.itemTitle}>旋转角度</div>
                <div className={style.itemData}>
                  {info.angle.toFixed(0)} Deg
                </div>
              </div>,
              <div key={4} className={style.infoItem}>
                <div className={style.itemTitle}>偏移X</div>
                <div className={style.itemData}>{info.left} Px</div>
              </div>,
              <div key={5} className={style.infoItem}>
                <div className={style.itemTitle}>偏移Y</div>
                <div className={style.itemData}>{info.top} Px</div>
              </div>
            ]
          : []
      }
    ],
    [info]
  )

  const elInfoPanel = useMemo(
    () => [
      <div key={'a'}>
        {info && elConfig ? (
          elConfig.map((item) => (
            <OptionItem
              className={style.optionItem}
              key={item.key}
              title={item.title}
            >
              {item.type === Controller.colorPicker ? (
                <ColorPicker
                  {...((item.property
                    ? item.property
                    : {}) as ColorPickerProps)}
                  key={
                    Object.prototype.hasOwnProperty.call(info, item.key)
                      ? (info as any)[item.key]
                      : (info as any).property[item.key]
                  }
                  propName={item.key}
                  defaultValue={
                    Object.prototype.hasOwnProperty.call(info, item.key)
                      ? (info as any)[item.key]
                      : (info as any).property[item.key]
                  }
                />
              ) : item.type === Controller.inputNumber ? (
                <InputNumber
                  {...((item.property
                    ? item.property
                    : {}) as InputNumberProps)}
                  propName={item.key}
                  defaultValue={
                    Object.prototype.hasOwnProperty.call(info, item.key)
                      ? (info as any)[item.key]
                      : (info as any).property[item.key]
                  }
                />
              ) : item.type === Controller.switch ? (
                <Switch
                  defaultValue={
                    Object.prototype.hasOwnProperty.call(info, item.key)
                      ? (info as any)[item.key]
                      : (info as any).property[item.key]
                  }
                  propName={item.key}
                />
              ) : item.type === Controller.slider ? (
                <Slider
                  defaultValue={
                    Object.prototype.hasOwnProperty.call(info, item.key)
                      ? (info as any)[item.key]
                      : (info as any).property[item.key]
                  }
                  propName={item.key}
                  {...((item.property
                    ? item.property
                    : {}) as SliderSingleProps)}
                />
              ) : item.type === Controller.select ? (
                <Select
                  defaultValue={
                    Object.prototype.hasOwnProperty.call(info, item.key)
                      ? (info as any)[item.key]
                      : (info as any).property[item.key]
                  }
                  propName={item.key}
                  {...((item.property ? item.property : {}) as SelectProps)}
                />
              ) : item.type === Controller.input ? (
                <Input
                  defaultValue={
                    Object.prototype.hasOwnProperty.call(info, item.key)
                      ? (info as any)[item.key]
                      : (info as any).property[item.key]
                  }
                  propName={item.key}
                  {...((item.property ? item.property : {}) as InputProps)}
                />
              ) : (
                <></>
              )}
            </OptionItem>
          ))
        ) : (
          <></>
        )}
      </div>
    ],
    [info, elConfig, activeElement]
  )

  return (
    <div>
      <PositionButton />
      <LayoutButton />
      <HandleButton />
      <Collapse
        defaultActiveKey={['1']}
        ghost
        items={basicInfoPanel}
      ></Collapse>
      <Collapse
        defaultActiveKey={['1']}
        ghost
        items={[
          {
            key: '1',
            label: '元素属性',
            children: elInfoPanel
          }
        ]}
      />
    </div>
  )
})
