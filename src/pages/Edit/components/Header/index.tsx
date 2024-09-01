import { memo } from 'react';
import style from './index.module.less';
import useStore from '@/stores';
import StartPanel from '@/components/StartPanel';
import InsertPanel from '@/components/InsertPanel';

export default memo(function Header() {
  const { activePanel } = useStore();

  return (
    <div className={style.header}>
      <div className={style.container}>
        {activePanel === 'start' ? <StartPanel /> : <InsertPanel />}
      </div>
    </div>
  );
});
