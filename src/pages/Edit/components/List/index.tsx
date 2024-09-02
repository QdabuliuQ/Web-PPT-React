import { memo, useCallback } from 'react';

import style from './index.module.less';
import Scrollbars from 'react-custom-scrollbars';
import useStore from '@/stores';
import PreviewCanvas from '@/components/PreviewCanvas';
import { CanvasStore } from '@/stores/canvasStore';
import { getNewCanvasOption, getRandomID } from '@/utils';
import { Fabric } from '@/types/fabirc';

const style1 = {
  height: 'calc(100vh - 85px - 80px)',
};

export default memo(function List() {
  const { canvas, activeCanvas, activeCanvasUpdate, canvasPush } = useStore();

  const previewClickEvent = useCallback(
    (id: string) => {
      activeCanvasUpdate(activeCanvas !== id ? id : '');
    },
    [activeCanvas]
  );

  const addEvent = useCallback(() => {
    canvasPush({
      id: getRandomID(10),
      fabricOption: getNewCanvasOption() as unknown as Fabric.JSON,
    });
  }, []);

  return (
    <div className={style.list}>
      {canvas.length ? (
        <Scrollbars autoHide autoHideTimeout={1000} style={style1}>
          <div className={style.scrollContainer}>
            {canvas.map((item: CanvasStore.Canvas, index: number) => (
              <div
                className={`${style.canvasPreviewItem} ${activeCanvas === item.id ? style.activePreviewItem : ''}`}
                key={item.id}
              >
                <PreviewCanvas
                  className={style.previewItem}
                  id={item.id}
                  fabricOption={item.fabricOption}
                  clickEvent={previewClickEvent}
                />
                <div className={style.canvasIndex}>{index + 1}</div>
              </div>
            ))}
          </div>
        </Scrollbars>
      ) : (
        <div className={style.empty}>暂无画布</div>
      )}

      <div onClick={addEvent} className={style.canvasAdd}>
        <i className="iconfont i_add"></i>
      </div>
    </div>
  );
});
