import { memo, ReactNode, useCallback } from 'react'

import Icon from '../Icon'

import style from './index.module.less'

interface Props {
  icon: string | ReactNode
  title: string
  disabled: boolean
  clickEvent?: (...args: Array<any>) => void
}

export default memo(function ButtonItem({
  icon,
  title,
  disabled,
  clickEvent
}: Props) {
  const _clickEvent = useCallback(() => {
    if (clickEvent) {
      clickEvent(icon, title)
    }
  }, [clickEvent])

  return (
    <div
      onClick={_clickEvent}
      className={`${style.buttonItem} ${disabled ? style.disableItem : ''}`}
    >
      {typeof icon === 'string' ? <Icon icon={icon} /> : icon}
      <span className={style.buttonTitle}>{title}</span>
    </div>
  )
})
