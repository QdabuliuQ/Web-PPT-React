import { memo, useCallback } from 'react'

import Icon from '../Icon'

import style from './index.module.less'

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
