import { memo } from 'react'

import InsertPanel from '@/components/InsertPanel'
import StartPanel from '@/components/StartPanel'
import useStore from '@/stores'

import style from './index.module.less'

export default memo(function Header() {
  const { activePanel } = useStore()

  return (
    <div className={style.header}>
      <div className={style.container}>
        {activePanel === 'start' ? <StartPanel /> : <InsertPanel />}
      </div>
    </div>
  )
})
