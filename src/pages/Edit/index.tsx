import { memo, useEffect } from 'react';

import Panel from './components/Panel';
import Canvas from './components/Canvas';
import Header from './components/Header';
import List from './components/List';
import Menu from './components/Menu';

import config from '@/mock/ppt';
import useStore from '@/stores';
import { Empty } from 'antd';
import Footer from './components/Footer';
import View from './components/View';

import style from './index.module.less';

export default memo(function Edit() {
  const { canvasInit, activeCanvas, mode } = useStore();

  useEffect(() => {
    canvasInit(config as any);
  }, []);

  return (
    <div className={style.edit}>
      <Menu />
      <Header />
      {mode === 'list' ? (
        <div className={style.editContainer}>
          <List />
          {activeCanvas !== '' ? (
            <Canvas />
          ) : (
            <div className={style.canvasContainer}>
              <Empty description="暂无选中" />
            </div>
          )}
          <Panel />
        </div>
      ) : (
        <View />
      )}
      <Footer />
    </div>
  );
});
