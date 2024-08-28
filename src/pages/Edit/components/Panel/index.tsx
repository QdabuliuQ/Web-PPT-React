import { memo } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import style from './index.module.less';

export default memo(function Panel() {
  return (
    <div className={style.panel}>
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
