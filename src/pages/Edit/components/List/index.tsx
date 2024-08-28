import { memo } from 'react';

import style from './index.module.less';
import Scrollbars from 'react-custom-scrollbars';

export default memo(function List() {
  return (
    <div className={style.list}>
      <Scrollbars
        autoHide
        autoHideTimeout={1000}
        style={{
          height: 'calc(100vh - 85px - 40px)',
        }}
      >
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
        <h1>ahhh</h1>
      </Scrollbars>
    </div>
  );
});
