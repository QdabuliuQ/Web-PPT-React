import { memo, useCallback } from 'react'

import style from './index.module.less'
import Icon from '../Icon'

interface Props {
  icon: string
  title: string
  clickEvent?: () => void
}

export default memo(function ButtonItem(props: Props) {
  const clickEvent = useCallback(() => {
    if (props.clickEvent) {
      props.clickEvent()
    }
  }, [props.clickEvent])

  return (
    <div onClick={clickEvent} className={style.buttonItem}>
      <Icon icon={props.icon} />
      <span className={style.buttonTitle}>{props.title}</span>
    </div>
  )
})
