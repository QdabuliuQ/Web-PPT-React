import { memo } from 'react'
import { Scrollbars } from 'react-custom-scrollbars'

import CanvasPanel from '@/components/CanvasPanel'
import ElementPanel from '@/components/ElementPanel'
import useStore from '@/stores'

import style from './index.module.less'
export default memo(function Panel() {
  const { activeElement } = useStore()

  return (
    <div className={style.panel}>
      <Scrollbars
        autoHide
        autoHideTimeout={1000}
        style={{
          height: 'calc(100vh - 85px - 40px - 30px)'
        }}
      >
        {activeElement ? <ElementPanel /> : <CanvasPanel />}
      </Scrollbars>
    </div>
  )
})
