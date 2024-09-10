import { memo } from 'react'
import { Scrollbars } from 'react-custom-scrollbars'
import style from './index.module.less'
import useStore from '@/stores'
import ElementPanel from '@/components/ElementPanel'
import CanvasPanel from '@/components/CanvasPanel'
export default memo(function Panel() {
  const { activeElement } = useStore()

  return (
    <div className={style.panel}>
      <Scrollbars
        autoHide
        autoHideTimeout={1000}
        style={{
          height: 'calc(100vh - 85px - 40px)'
        }}
      >
        {activeElement ? <ElementPanel /> : <CanvasPanel />}
      </Scrollbars>
    </div>
  )
})
