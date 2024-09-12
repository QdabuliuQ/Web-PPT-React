import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import _ from 'lodash'

import ContextMenu from '@/components/ContextMenu'
import useElementAlign from '@/hooks/useElementAlign'
import useElementHandle from '@/hooks/useElementHandle'
import useStore from '@/stores'
import { type Fabric } from '@/types/fabirc'
import {
  elementDeselectEvent,
  elementSelectEvent,
  overWriteToObject
} from '@/utils'

import useContextMenu from './useContextMenu'

import style from './index.module.less'

export default memo(function Canvas() {
  const {
    activeCanvas,
    canvas,
    canvasFabricOptionUpdate,
    instanceUpdate,
    remark,
    canvasRemarkUpdate
  } = useStore()

  const canvasMain = useRef<HTMLDivElement | null>(null)

  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const instance = useRef<fabric.Canvas | null>(null)

  const rebuildCanvasDom = useCallback((width: number, height: number) => {
    if (canvasMain.current) {
      canvasMain.current.innerHTML = ''
      const canvas = document.createElement('canvas')
      canvas.id = '__canvas__'
      canvas.width = width
      canvas.height = height
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      canvasMain.current.append(canvas)
    }
  }, [])

  const {
    elementDeleteEvent,
    elementLockChangeEvent,
    elementCopyEvent,
    elementLayoutChange
  } = useElementHandle()
  const alignHandle = useElementAlign()
  const {
    contextMenuEvent,
    elementContextMenuData,
    elementContextMenuRef,
    menuClickEvent
  } = useContextMenu(
    elementDeleteEvent,
    elementLockChangeEvent,
    elementCopyEvent,
    alignHandle,
    elementLayoutChange
  )

  useEffect(() => {
    if (activeCanvas) {
      const width = 800
      const height = 500
      setWidth(width)
      setHeight(height)

      rebuildCanvasDom(width, height)

      instance.current = new fabric.Canvas(
        document.getElementById('__canvas__') as HTMLCanvasElement,
        {
          width,
          height,
          fireRightClick: true,
          stopContextMenu: true,
          fireMiddleClick: true
        }
      )

      instanceUpdate(instance.current as any)

      instance.current.on(
        'object:modified',
        _.debounce(() => {
          canvasFabricOptionUpdate(activeCanvas, instance.current!.toObject())
        }, 100)
      )

      instance.current.on('mouse:down', contextMenuEvent)

      for (let i = 0; i < canvas.length; i++) {
        if (canvas[i].id === activeCanvas) {
          instance.current.loadFromJSON(canvas[i].fabricOption, () => {
            instance.current!.getObjects().forEach((item) => {
              if ((item as Fabric.Object).property.type !== 'background') {
                item.on('selected', elementSelectEvent)
                item.on('deselected', elementDeselectEvent)
                item.toObject = overWriteToObject(item.toObject)
              } else {
                item.toObject = overWriteToObject(item.toObject, [
                  'selectable',
                  'hasControls',
                  'hoverCursor'
                ])
              }
            })
          })

          textareaRef.current!.value = canvas[i].remark
          break
        }
      }
    }

    ;() => {
      if (activeCanvas) {
        instance.current?.dispose()
        instance.current?.off('object:selected')
        instance.current?.off('object:modified')
        instance.current?.off('mouse:down')
      }
    }
  }, [activeCanvas])

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const changeEvent = useCallback(
    _.debounce(() => {
      if (textareaRef.current) {
        const { activeCanvas } = useStore.getState()
        canvasRemarkUpdate(activeCanvas, textareaRef.current.value)
      }
    }, 200),
    []
  )

  return (
    <div className={style.canvas}>
      <div
        className={style.container}
        style={{
          height: remark ? 'calc(100% - 35px)' : '100%'
        }}
        ref={canvasMain}
      >
        <canvas
          id="__canvas__"
          width={width}
          height={height}
          style={{
            width: `${width}px`,
            height: `${height}px`
          }}
        ></canvas>
      </div>
      <div className={style.remark}>
        <div className={style.textareaContainer}>
          <textarea
            ref={textareaRef}
            placeholder="请输入备注"
            rows={1}
            maxLength={300}
            onChange={changeEvent}
          />
        </div>
      </div>
      <ContextMenu
        ref={elementContextMenuRef}
        menuData={elementContextMenuData}
        menuClick={menuClickEvent}
      />
    </div>
  )
})
