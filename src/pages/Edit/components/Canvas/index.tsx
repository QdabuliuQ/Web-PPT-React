import { memo } from 'react';

import style from './index.module.less';

export default memo(function Canvas() {
  return <div className={style.canvas}>canvas</div>;
});
