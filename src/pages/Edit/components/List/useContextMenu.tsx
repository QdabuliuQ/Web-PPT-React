import { useCallback, useMemo, useRef, useState } from 'react'

import { ContextMenuItem, ContextMenuRef } from '@/components/ContextMenu'
import Icon from '@/components/Icon'
import useStore from '@/stores'
import { getNewCanvas, getRandomID } from '@/utils'

export function useContextMenu() {
  const {
    canvasDelete,
    activeElementUpdate,
    activeCanvasUpdate,
    canvasInsert,
    canvasByKeyUpdate,
    canvasFabricOptionUpdate
  } = useStore()

  const canvasId = useRef<string>('')
  const contextMenuRef = useRef<ContextMenuRef | null>(null)

  const [visible, setVisible] = useState(true)
  const contextMenuData = useMemo<Array<ContextMenuItem>>(
    () => [
      {
        prefix: <Icon icon="i_new" style={{ marginRight: '10px' }} />,
        title: '新建幻灯片',
        key: 'new'
      },
      {
        prefix: <Icon icon="i_copy" style={{ marginRight: '10px' }} />,
        title: '复制幻灯片',
        key: 'copy'
      },
      {
        prefix: <Icon icon="i_delete" style={{ marginRight: '10px' }} />,
        title: '删除幻灯片',
        key: 'delete'
      },
      {
        prefix: <Icon icon="i_clear" style={{ marginRight: '10px' }} />,
        title: '清空幻灯片',
        key: 'clear'
      },
      visible
        ? {
            prefix: <Icon icon="i_unvisible" style={{ marginRight: '10px' }} />,
            title: '隐藏幻灯片',
            key: 'unvisible'
          }
        : {
            prefix: <Icon icon="i_visible" style={{ marginRight: '10px' }} />,
            title: '显示幻灯片',
            key: 'visible'
          }
    ],
    [visible]
  )

  const menuClick = useCallback((_: unknown, key: string) => {
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
      canvasByKeyUpdate(
        canvasId.current,
        'visible',
        key === 'visible' ? true : false
      )
    } else if (key === 'clear') {
      // 清空幻灯片内容
      for (let i = 0; i < canvas.length; i++) {
        if (canvas[i].id === canvasId.current) {
          canvas[i].fabricOption.objects = canvas[i].fabricOption.objects.slice(
            0,
            1
          )
          canvasFabricOptionUpdate(canvasId.current, {
            ...canvas[i].fabricOption
          })
          if (activeCanvas === canvasId.current) {
            instance?.loadFromJSON(canvas[i].fabricOption, () => {
              console.log(instance, 'instance')
              instance?.renderAll()
            })
          }
          break
        }
      }
    }
    canvasId.current = ''
    if (contextMenuRef.current) {
      contextMenuRef.current!.hide()
    }
  }, [])
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
    contextMenuRef.current!.show(ev.clientX, ev.clientY)
  }

  return {
    canvasId,
    menuClick,
    contextMenuRef,
    contextMenuEvent,
    contextMenuData
  }
}
