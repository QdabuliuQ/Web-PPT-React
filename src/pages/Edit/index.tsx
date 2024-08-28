import { memo } from 'react';

import style from './index.module.less';
import Panel from './components/Panel';
import Canvas from './components/Canvas';
import Header from './components/Header';
import List from './components/List';
import Menu from './components/Menu';

export default memo(function Edit() {
  return (
    <div className={style.edit}>
      <Menu />
      <Header />
      <div className={style.editContainer}>
        <List />
        <Canvas />
        <Panel />
      </div>
    </div>
  );
});
