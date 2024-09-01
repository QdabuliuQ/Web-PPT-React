import { memo, useCallback, useMemo, useState } from 'react';

import style from './index.module.less';
import useStore from '@/stores';

interface Menu {
  id: string;
  title: string;
}

export default memo(function Menu() {
  const menus = useMemo<Array<Menu>>(
    () => [
      {
        id: 'start',
        title: '开始',
      },
      {
        id: 'insert',
        title: '插入',
      },
    ],
    []
  );

  const { activePanel, activePanelUpdate } = useStore();
  console.log(activePanel, 'activePanel');

  const menuClick = (id: string) => {
    activePanelUpdate(id);
  };

  return (
    <div className={style.menu}>
      {menus.map((item) => (
        <div
          key={item.id}
          onClick={() => menuClick(item.id)}
          className={`${style.menuItem} ${activePanel === item.id ? style.activeMenuItem : ''}`}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
});
