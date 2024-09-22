import { useCallback, useContext, useMemo, useRef, useState } from 'react'

import { MenuData } from '@/components/ContextMenu'
import Icon from '@/components/Icon'
import ContextMenuProvider from '@/provider/contextMenu'
import useStore from '@/stores'
import { getNewCanvas, getRandomID } from '@/utils'

export function useContextMenu() {
  const { contextMenuRef } = useContext(ContextMenuProvider)
  const {
    canvasDelete,
    activeElementUpdate,
    activeCanvasUpdate,
    canvasInsert,
    canvasByKeyUpdate,
    canvasFabricOptionUpdate
  } = useStore()

  const canvasId = useRef<string>('')

  const [visible, setVisible] = useState(true)

  const menuClick = useCallback(
    (key: string) => {
      const { activeCanvas, canvas, instance } = useStore.getState()

      if (key === 'copy') {
        // 复制幻灯片
        for (let i = 0; i < canvas.length; i++) {
          if (canvas[i].id === canvasId.current) {
            const canvasInfo = JSON.parse(JSON.stringify(canvas[i]))
            canvasInfo.id = getRandomID(10)
            canvasInsert(canvasInfo, i)
            break
          }
        }
      } else if (key === 'delete') {
        // 删除幻灯片
        canvasDelete(canvasId.current)
        activeElementUpdate('')
        if (activeCanvas === canvasId.current) {
          activeCanvasUpdate('')
        }
      } else if (key === 'new') {
        // 新建幻灯片
        for (let i = 0; i < canvas.length; i++) {
          if (canvas[i].id === canvasId.current) {
            canvasInsert(getNewCanvas() as any, i + 1)
            break
          }
        }
      } else if (key === 'visible' || key === 'unvisible') {
        // 隐藏/显示幻灯片
        canvasByKeyUpdate(canvasId.current, 'visible', key === 'visible')
      } else if (key === 'clear') {
        // 清空幻灯片内容
        for (let i = 0; i < canvas.length; i++) {
          if (canvas[i].id === canvasId.current) {
            canvas[i].fabricOption.objects = canvas[
              i
            ].fabricOption.objects.slice(0, 1)
            canvasFabricOptionUpdate(canvasId.current, {
              ...canvas[i].fabricOption
            })
            if (activeCanvas === canvasId.current) {
              instance?.loadFromJSON(canvas[i].fabricOption, () => {
                instance?.renderAll()
              })
            }
            break
          }
        }
      }
      canvasId.current = ''
      if (contextMenuRef) {
        contextMenuRef!.hide()
      }
    },
    [contextMenuRef]
  )

  const contextMenuData = useMemo<Array<MenuData>>(
    () => [
      {
        prefix: <Icon icon="i_new" style={{ marginRight: '10px' }} />,
        title: '新建(Shift+N)',
        key: 'new',
        clickEvent: menuClick
      },
      {
        prefix: <Icon icon="i_copy" style={{ marginRight: '10px' }} />,
        title: '复制(Shift+C)',
        key: 'copy',
        clickEvent: menuClick
      },
      {
        prefix: <Icon icon="i_delete" style={{ marginRight: '10px' }} />,
        title: '删除(Shift+D)',
        key: 'delete',
        clickEvent: menuClick
      },
      {
        prefix: <Icon icon="i_clear" style={{ marginRight: '10px' }} />,
        title: '清空(Shift+R)',
        key: 'clear',
        clickEvent: menuClick
      },
      visible
        ? {
            prefix: <Icon icon="i_unvisible" style={{ marginRight: '10px' }} />,
            title: '隐藏(Shift+V)',
            key: 'unvisible',
            clickEvent: menuClick
          }
        : {
            prefix: <Icon icon="i_visible" style={{ marginRight: '10px' }} />,
            title: '显示(Shift+V)',
            key: 'visible',
            clickEvent: menuClick
          }
    ],
    [visible, contextMenuRef]
  )

  const contextMenuEvent = (
    ev: React.MouseEvent<HTMLDivElement>,
    id: string
  ) => {
    ev.preventDefault()
    canvasId.current = id
    const { canvas } = useStore.getState()
    for (let i = 0; i < canvas.length; i++) {
      if (canvas[i].id === id) {
        setVisible(canvas[i].visible)
        break
      }
    }
    contextMenuRef!.show(ev.clientX, ev.clientY, contextMenuData)
  }

  return {
    canvasId,
    menuClick,
    contextMenuRef,
    contextMenuEvent,
    contextMenuData
  }
}
