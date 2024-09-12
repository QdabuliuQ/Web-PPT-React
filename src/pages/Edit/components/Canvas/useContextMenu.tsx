import { useCallback, useMemo, useRef, useState } from 'react'

import { ContextMenuRef } from '@/components/ContextMenu'
import ContextMenuPosition from '@/components/ContextMenuPosition'
import Icon from '@/components/Icon'
import useStore from '@/stores'

function SplitLine() {
  const style = useMemo(
    () => ({
      margin: '5px 0',
      width: '100%',
      height: '1px',
      background: '#ededed'
    }),
    []
  )
  return <div style={style}></div>
}

export default function useContextMenu(
  elementDeleteEvent: (eid: string) => void,
  elementLockChangeEvent: (eid: string, type: 'lock' | 'unlock') => void,
  elementCopyEvent: (eid: string) => void,
  elementAlignEvent: (eid: string, align: string) => void,
  elementLayoutChange: (eid: string, type: string) => void
) {
  const elementContextMenuRef = useRef<ContextMenuRef | null>(null)
  const { activeElementUpdate } = useStore()

  const style = useMemo(
    () => ({
      marginRight: '10px'
    }),
    []
  )

  const clickEvent = useCallback((type: string) => {
    elementAlignEvent(elementId.current, type)
    elementContextMenuRef.current?.hide()
    elementId.current = ''
  }, [])

  const [isLock, setIsLock] = useState(false)
  const elementContextMenuData = useMemo(
    () => [
      <ContextMenuPosition clickEvent={clickEvent} />,
      <SplitLine />,
      {
        title: '复制(Ctrl+C)',
        prefix: <Icon icon="i_copy" style={style} />,
        key: 'copy'
      },
      isLock
        ? {
            title: '解锁(Ctrl+L)',
            prefix: <Icon icon="i_unlock" style={style} />,
            key: 'unlock'
          }
        : {
            title: '锁定(Ctrl+L)',
            prefix: <Icon icon="i_lock" style={style} />,
            key: 'lock'
          },
      {
        title: '删除(Ctrl+D)',
        prefix: <Icon icon="i_delete" style={style} />,
        key: 'delete'
      },
      <SplitLine />,
      {
        title: '上移一层(Shift+1)',
        prefix: <Icon icon="i_to_top" style={style} />,
        key: 'bringForward'
      },
      {
        title: '下移一层(Shift+2)',
        prefix: <Icon icon="i_to_bottom" style={style} />,
        key: 'sendBackwards'
      },
      {
        title: '置于顶层(Shift+3)',
        prefix: <Icon icon="i_top" style={style} />,
        key: 'bringToFront'
      },
      {
        title: '置于底层(Shift+4)',
        prefix: <Icon icon="i_bottom" style={style} />,
        key: 'sendToBack'
      }
    ],
    [isLock]
  )

  const contextMenuEvent = useCallback((opt: any) => {
    const evt = opt.e
    if (opt.button === 3) {
      if (!opt.target || opt.target.property.type === 'background') return
      const { instance } = useStore.getState()
      ;(
        elementContextMenuRef.current as unknown as {
          show: (x: number, y: number) => void
        }
      ).show(evt.clientX, evt.clientY)
      elementId.current = opt.target.property.id
      setIsLock(opt.target.lockMovementX && opt.target.lockMovementY)
      activeElementUpdate(elementId.current)
      instance?.setActiveObject(opt.target)
      instance?.renderAll()
    }
  }, [])

  const elementId = useRef('')

  const menuClickEvent = useCallback((_: unknown, key: string) => {
    if (key === 'copy') {
      elementCopyEvent(elementId.current)
    } else if (key === 'lock' || key === 'unlock') {
      elementLockChangeEvent(elementId.current, key)
    } else if (key === 'delete') {
      elementDeleteEvent(elementId.current)
    } else {
      elementLayoutChange(elementId.current, key)
    }
    elementContextMenuRef.current?.hide()
    elementId.current = ''
  }, [])

  return {
    elementContextMenuRef,
    elementContextMenuData,
    contextMenuEvent,
    menuClickEvent
  }
}
