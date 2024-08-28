import { memo } from 'react';
import style from './index.module.less';

export default memo(function Header() {
  return (
    <div className={style.header}>
      <div className={style.container}></div>
    </div>
  );
});
