import { forwardRef, memo, ReactNode, useCallback } from 'react'

import Icon from '../Icon'

import style from './index.module.less'

interface Props {
  icon: string | ReactNode
  title: string
  disabled: boolean
  clickEvent?: (...args: Array<any>) => void
  blurEvent?: (...args: Array<any>) => void
}

export default memo(
  forwardRef(function ButtonItem(
    { icon, title, disabled, clickEvent, blurEvent }: Props,
    ref: any
  ) {
    const _clickEvent = useCallback(() => {
      if (clickEvent) {
        clickEvent(icon, title)
      }
    }, [clickEvent])

    const _blurEvent = useCallback(() => {
      if (blurEvent) {
        blurEvent(icon, title)
      }
    }, [blurEvent])

    return (
      <button
        ref={ref}
        onClick={_clickEvent}
        onBlur={_blurEvent}
        className={`${style.buttonItem} ${disabled ? style.disableItem : ''}`}
      >
        <div className={style.iconBox}>
          {typeof icon === 'string' ? <Icon icon={icon} /> : icon}
        </div>
        <span className={style.buttonTitle}>{title}</span>
      </button>
    )
  })
)
