import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useMount } from 'ahooks'
import { Spin } from 'antd'
import { fabric } from 'fabric'

import { type Fabric } from '@/types/fabirc'

import Icon from '../Icon'

import style from './index.module.less'

interface Props {
  id: string
  fabricOption: Fabric.JSON
  visible: boolean
  className?: string
  clickEvent?: (id: string, fabricOption: Fabric.JSON) => void
}

let lastFabricOption: Fabric.JSON | null = null
export default memo(function PreviewCanvas({
  id,
  fabricOption,
  visible,
  className,
  clickEvent
}: Props) {
  const instanceRef = useRef<fabric.StaticCanvas | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (!instanceRef.current) {
      instanceRef.current = new fabric.StaticCanvas(canvasRef.current, {
        width: 800,
        height: 500,
        selection: false, // 画布不显示选中
        fireRightClick: true, // 右键点击事件生效
        stopContextMenu: true, // 右键点击禁用默认自带的目录
        fireMiddleClick: true, // 中间建点击事件生效
        allowTouchScrolling: true
      })
      instanceRef.current.loadFromJSON(fabricOption, () => {})
      lastFabricOption = fabricOption
    } else if (lastFabricOption !== fabricOption) {
      instanceRef.current.loadFromJSON(fabricOption, () => {})
      lastFabricOption = fabricOption
    }
  }, [fabricOption])

  useMount(() => {
    setZoom(containerRef.current!.clientWidth / 800)

    setTimeout(() => {
      setLoading(false)
    }, 100)
  })

  const _clickEvent = useCallback(() => {
    if (clickEvent) {
      clickEvent(id, fabricOption)
    }
  }, [clickEvent])

  const [loading, setLoading] = useState(true)

  return (
    <div
      onClick={_clickEvent}
      ref={containerRef}
      className={`${style.previewCanvas} ${className || ''}`}
    >
      <Spin spinning={loading}>
        <>
          <canvas
            style={{
              zoom: zoom,
              opacity: loading ? 0 : 1
            }}
            ref={canvasRef}
          ></canvas>
          {!visible ? (
            <div className={style.iconBox}>
              <Icon icon="i_unvisible" className={style.unvisible} />
            </div>
          ) : (
            <></>
          )}
        </>
      </Spin>
    </div>
  )
})
