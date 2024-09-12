import { memo, useCallback, useMemo } from 'react'
import { useKeyPress } from 'ahooks'
import { Button, Tooltip } from 'antd'
import ButtonGroup from 'antd/es/button/button-group'

import Icon from '@/components/Icon'
import useElementHandle from '@/hooks/useElementHandle'
import useStore from '@/stores'

import style from './index.module.less'

export default memo(function HandleButton() {
  const { activeElement, canvas, instance } = useStore()

  const { elementDeleteEvent, elementLockChangeEvent, elementCopyEvent } =
    useElementHandle()

  const buttons = useMemo((): Array<any> => {
    let isLock = false
    for (let i = 0; i < instance!._objects.length; i++) {
      const element = instance!._objects[i]
      if (element.property.id === activeElement) {
        if (element.lockMovementX && element.lockMovementY) {
          isLock = true
        }
      }
    }
    return [
      {
        title: '复制(Ctrl+C)',
        icon: <Icon icon="i_paste" />,
        key: 'paste'
      },
      isLock
        ? {
            title: '解锁(Ctrl+L)',
            icon: <Icon icon="i_unlock" />,
            key: 'unlock'
          }
        : {
            title: '锁定(Ctrl+L)',
            icon: <Icon icon="i_lock" />,
            key: 'lock'
          },
      ,
      {
        title: '删除(Ctrl+D)',
        icon: <Icon icon="i_delete" />,
        key: 'delete'
      }
    ]
  }, [activeElement, canvas])

  const clickEvent = useCallback((key: string) => {
    const { activeElement } = useStore.getState()
    if (key === 'delete') {
      elementDeleteEvent(activeElement)
    } else if (key === 'unlock' || key === 'lock') {
      elementLockChangeEvent(activeElement, key)
    } else if (key === 'paste') {
      elementCopyEvent(activeElement)
    }
  }, [])

  const keyPressEvent = useCallback((e: any) => {
    const { key } = e
    const { activeElement, instance } = useStore.getState()

    if (activeElement) {
      if (key === 'c') {
        elementCopyEvent(activeElement)
      } else if (key === 'l') {
        e.preventDefault()
        for (let i = 0; i < instance!._objects.length; i++) {
          if (instance?._objects[i].property.id === activeElement) {
            elementLockChangeEvent(
              activeElement,
              instance?._objects[i].lockMovementX &&
                instance?._objects[i].lockMovementY
                ? 'unlock'
                : 'lock'
            )
            break
          }
        }
      } else if (key === 'd') {
        e.preventDefault()
        elementDeleteEvent(activeElement)
      }
    }
  }, [])

  useKeyPress(['ctrl.c', 'ctrl.l', 'ctrl.d'], keyPressEvent)

  return (
    <div className={style.handleButton}>
      <ButtonGroup>
        {buttons.map((item) => (
          <Tooltip key={item.key} placement="top" title={item.title}>
            <Button onClick={() => clickEvent(item.key)} icon={item.icon} />
          </Tooltip>
        ))}
      </ButtonGroup>
    </div>
  )
})
