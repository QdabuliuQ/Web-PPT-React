import { memo } from 'react';

import style from './index.module.less';

interface Props {
  icon: string;
  title: string;
}

export default memo(function ButtonItem(props: Props) {
  return (
    <div className={style.buttonItem}>
      <i className={`iconfont ${props.icon}`}></i>
      <div>{props.title}</div>
    </div>
  );
});
