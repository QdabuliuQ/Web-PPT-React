import { memo, useMemo } from 'react';

import style from './index.module.less';
import Scrollbars from 'react-custom-scrollbars';
import useStore from '@/stores';
import PreviewCanvas from '@/components/PreviewCanvas';
import { CanvasStore } from '@/stores/canvasStore';

const style1 = {
  height: 'calc(100vh - 85px - 80px)',
};

export default memo(function List() {
  const { canvas } = useStore();

  return (
    <div className={style.list}>
      {canvas.length ? (
        <Scrollbars autoHide autoHideTimeout={1000} style={style1}>
          <div className={style.scrollContainer}>
            {canvas.map((item: CanvasStore.Canvas) => (
              <PreviewCanvas
                key={item.id}
                id={item.id}
                fabricOption={item.fabricOption}
                width={184}
                height={90}
              />
            ))}
          </div>
        </Scrollbars>
      ) : (
        <div style={style1} className={style.empty}>
          暂无画布
        </div>
      )}

      <div className={style.canvasAdd}>
        <i className="iconfont i_add"></i>
      </div>
    </div>
  );
});
