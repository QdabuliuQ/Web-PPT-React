import { memo, useEffect } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import config from '@/config';
import style from './index.module.less';
import useStore from '@/stores';

export default memo(function Panel() {
  const { activeElement } = useStore();
  console.log(activeElement);

  return (
    <div className={style.panel}>
      <Scrollbars
        autoHide
        autoHideTimeout={1000}
        style={{
          height: 'calc(100vh - 85px - 40px)',
        }}
      >
        <div className={style.container}></div>
      </Scrollbars>
    </div>
  );
});
