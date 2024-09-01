import { memo, useCallback } from 'react';

import style from './index.module.less';

interface Props {
  icon: string;
  title: string;
  clickEvent?: () => void;
}

export default memo(function ButtonItem(props: Props) {
  const clickEvent = useCallback(() => {
    if (props.clickEvent) {
      props.clickEvent();
    }
  }, [props.clickEvent]);

  return (
    <div onClick={clickEvent} className={style.buttonItem}>
      <i className={`iconfont ${props.icon}`}></i>
      <span className={style.buttonTitle}>{props.title}</span>
    </div>
  );
});
