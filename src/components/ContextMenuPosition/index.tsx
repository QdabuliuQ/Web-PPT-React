import { memo, useCallback, useMemo } from 'react'
import { Tooltip } from 'antd'

import Icon from '../Icon'

import style from './index.module.less'

interface Props {
  clickEvent: (type: string) => void
}

export default memo(function ContextMenuZIndex({ clickEvent }: Props) {
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

  return (
    <div className={style.contextMenuZIndex}>
      {positions.map((item) => (
        <Tooltip key={item.key} placement="top" title={item.title}>
          <div onClick={() => clickEvent(item.key)} className={style.menuItem}>
            {item.icon}
          </div>
        </Tooltip>
      ))}
    </div>
  )
})
