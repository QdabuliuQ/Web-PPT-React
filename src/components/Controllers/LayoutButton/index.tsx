import { memo, useCallback, useMemo } from 'react'
import { useKeyPress } from 'ahooks'
import { Button, Tooltip } from 'antd'
import ButtonGroup from 'antd/es/button/button-group'

import Icon from '@/components/Icon'
import useElementHandle from '@/hooks/useElementHandle'
import useStore from '@/stores'

import style from './index.module.less'

export default memo(function LayoutButton() {
  const buttons = useMemo(
    () => [
      {
        title: '上移一层(Shift+1)',
        icon: <Icon icon="i_to_top" />,
        key: 'bringForward'
      },
      {
        title: '下移一层(Shift+2)',
        icon: <Icon icon="i_to_bottom" />,
        key: 'sendBackwards'
      },
      {
        title: '置于顶层(Shift+3)',
        icon: <Icon icon="i_top" />,
        key: 'bringToFront'
      },
      {
        title: '置于底层(Shift+4)',
        icon: <Icon icon="i_bottom" />,
        key: 'sendToBack'
      }
    ],
    []
  )

  const { elementLayoutChange } = useElementHandle()

  const clickEvent = useCallback((type: string) => {
    const { activeElement } = useStore.getState()
    elementLayoutChange(activeElement, type)
  }, [])

  const keyPressEvent = useCallback((e: any) => {
    const { activeElement } = useStore.getState()
    if (activeElement) {
      const index = Number(e.code.replace(/\D/g, ''))
      elementLayoutChange(activeElement, buttons[index - 1].key)
    }
  }, [])

  useKeyPress(['shift.1', 'shift.2', 'shift.3', 'shift.4'], keyPressEvent)

  return (
    <div className={style.layoutButton}>
      <ButtonGroup className={style.buttonGroup}>
        {buttons.map((item) => (
          <Tooltip key={item.key} placement="top" title={item.title}>
            <Button onClick={() => clickEvent(item.key)} icon={item.icon} />
          </Tooltip>
        ))}
      </ButtonGroup>
    </div>
  )
})
