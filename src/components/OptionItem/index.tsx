import { memo, ReactNode } from 'react'

import style from './index.module.less'

interface Props {
  title: string
  children: ReactNode
  className?: string
}

export default memo(function OptionItem({ title, children, className }: Props) {
  return (
    <div className={`${style.optionItem} ${className || ''}`}>
      <div className={style.title}>{title}</div>
      {children}
    </div>
  )
})
