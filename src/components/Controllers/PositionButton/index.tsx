import { memo, useCallback, useMemo } from 'react'
import { useKeyPress } from 'ahooks'
import { Button, Tooltip } from 'antd'
import ButtonGroup from 'antd/es/button/button-group'

import Icon from '@/components/Icon'
import useElementAlign from '@/hooks/useElementAlign'
import useStore from '@/stores'

import style from './index.module.less'

export default memo(function PositionButton() {
  const alignHandle = useElementAlign()

  const clickEvent = useCallback((align: string) => {
    const { activeElement } = useStore.getState()
    alignHandle(activeElement, align)
  }, [])

  const positions = useMemo(
    () => [
      {
        title: '水平左对齐(Ctrl+1)',
        icon: <Icon icon="i_align_left" />,
        key: 'align_left'
      },
      {
        title: '水平居中对齐(Ctrl+2)',
        icon: <Icon icon="i_align_vcenter" />,
        key: 'align_vcenter'
      },
      {
        title: '水平右对齐(Ctrl+3)',
        icon: <Icon icon="i_align_right" />,
        key: 'align_right'
      },
      {
        title: '水平垂直对齐(Ctrl+4)',
        icon: <Icon icon="i_align_center" />,
        key: 'align_center'
      },
      {
        title: '垂直顶对齐(Ctrl+5)',
        icon: <Icon icon="i_align_top" />,
        key: 'align_top'
      },
      {
        title: '垂直居中对齐(Ctrl+6)',
        icon: <Icon icon="i_align_hcenter" />,
        key: 'align_hcenter'
      },
      {
        title: '垂直底对齐(Ctrl+7)',
        icon: <Icon icon="i_align_bottom" />,
        key: 'align_bottom'
      }
    ],
    []
  )

  const keyPressEvent = useCallback((e: any) => {
    e.preventDefault()
    const index = Number(e.key) - 1
    clickEvent(positions[index].key)
  }, [])

  useKeyPress(
    ['ctrl.1', 'ctrl.2', 'ctrl.3', 'ctrl.4', 'ctrl.5', 'ctrl.6', 'ctrl.7'],
    keyPressEvent
  )

  return (
    <div className={style.positionButton}>
      <ButtonGroup className={style.buttonGroup}>
        {positions.map((item) => (
          <Tooltip key={item.key} placement="top" title={item.title}>
            <Button onClick={() => clickEvent(item.key)} icon={item.icon} />
          </Tooltip>
        ))}
      </ButtonGroup>
    </div>
  )
})
