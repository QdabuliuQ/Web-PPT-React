import { memo, useCallback, useMemo, useState } from 'react';

import style from './index.module.less';

interface Menu {
  id: string;
  title: string;
}

export default memo(function Menu() {
  const menus = useMemo<Array<Menu>>(
    () => [
      {
        id: '0',
        title: '开始',
      },
      {
        id: '1',
        title: '插入',
      },
    ],
    []
  );

  const [active, setActive] = useState('');

  const menuClick = (id: string) => {
    setActive(id);
  };

  return (
    <div className={style.menu}>
      {menus.map((item) => (
        <div
          key={item.id}
          onClick={() => menuClick(item.id)}
          className={`${style.menuItem} ${active === item.id ? style.activeMenuItem : ''}`}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
});
