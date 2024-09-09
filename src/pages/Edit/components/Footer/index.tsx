import { memo, useCallback, useMemo } from 'react';

import style from './index.module.less';
import useStore from '@/stores';
import Icon from '@/components/Icon';
import { Slider } from 'antd';

export default memo(function Footer() {
  const { activeCanvas, canvas, remarkUpdate, remark, mode, modeUpdate, activeElementUpdate } =
    useStore();

  const index = useMemo(() => {
    if (activeCanvas === '') {
      return 0;
    }
    for (let i = 0; i < canvas.length; i++) {
      if (canvas[i].id === activeCanvas) {
        return i + 1;
      }
    }
    return 0;
  }, [activeCanvas, canvas]);

  const remarkEvent = useCallback(() => {
    const { remark } = useStore.getState();
    remarkUpdate(!remark);
  }, []);

  const modeEvent = (mode: 'list' | 'view') => {
    modeUpdate(mode);
    activeElementUpdate('');
  };

  return (
    <div className={style.footer}>
      <div className={style.left}>
        <div className={style.count}>
          <Icon icon="i_canvas" />
          幻灯片 {index} / {canvas.length}
        </div>
        <div className={style.line}></div>
      </div>
      <div className={style.right}>
        <div
          onClick={remarkEvent}
          className={`${style.textItem} ${remark ? style.activeItem : ''}`}
        >
          <Icon icon="i_remark" />
          备注
        </div>
        <div className={style.line}></div>
        <div
          onClick={() => modeEvent('list')}
          style={{ marginLeft: '15px' }}
          className={`${style.btnItem} ${mode === 'list' ? style.activeItem : ''}`}
        >
          <Icon icon="i_list" />
        </div>
        <div
          onClick={() => modeEvent('view')}
          style={{ marginRight: '15px' }}
          className={`${style.btnItem} ${mode === 'view' ? style.activeItem : ''}`}
        >
          <Icon icon="i_view" />
        </div>
        <div className={style.line}></div>
        <div className={style.play}>
          <Icon icon="i_play" />
        </div>
        <div className={style.line}></div>
        <div className={style.scale}>
          <div className={style.btnItem}>
            <Icon icon="i_decrease" />
          </div>
          <Slider step={1} className={style.slider} />
          <div className={style.btnItem}>
            <Icon icon="i_add" />
          </div>
        </div>
      </div>
    </div>
  );
});
