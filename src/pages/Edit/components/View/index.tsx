import { memo, useMemo } from 'react'
import Scrollbars from 'react-custom-scrollbars'
import { Empty } from 'antd'

import PreviewCanvas from '@/components/PreviewCanvas'
import useStore from '@/stores'
import { CanvasStore } from '@/stores/canvasStore'

import style from './index.module.less'

export default memo(function View() {
  const { canvas, activeCanvas, activeCanvasUpdate, modeUpdate } = useStore()

  const _style = useMemo(
    () => ({
      height: '100%'
    }),
    []
  )

  const dbClickEvent = (id: string) => {
    activeCanvasUpdate(id)
    modeUpdate('list')
  }

  return (
    <div className={style.view}>
      {canvas.length ? (
        <Scrollbars autoHide autoHideTimeout={1000} style={_style}>
          <div className={style.viewContainer}>
            {canvas.map((item: CanvasStore.Canvas, index: number) => (
              <div
                className={`${style.canvasPreviewItem} ${activeCanvas === item.id ? style.activePreviewItem : ''}`}
                key={item.id}
                onDoubleClick={() => dbClickEvent(item.id)}
              >
                <PreviewCanvas
                  className={style.previewItem}
                  id={item.id}
                  fabricOption={item.fabricOption}
                />
                <div className={style.canvasIndex}>{index + 1}</div>
              </div>
            ))}
          </div>
        </Scrollbars>
      ) : (
        <div className={style.empty}>
          <Empty description="暂无幻灯片" />
        </div>
      )}
    </div>
  )
})
