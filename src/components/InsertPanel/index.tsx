import { memo } from 'react';
import ButtonItem from '../ButtonItem';

import style from './index.module.less';

export default memo(function InsertPanel() {
  return (
    <div className={style.insertPanel}>
      <ButtonItem icon="i_rect" title="矩形" />
      <ButtonItem icon="i_triangle" title="三角形" />
      <ButtonItem icon="i_text" title="文本" />
    </div>
  );
});
