import { memo, useEffect, useRef } from 'react'
import { Empty } from 'antd'

import ContextMenu from '@/components/ContextMenu'
import config from '@/mock/ppt'
import ContextMenuProvider from '@/provider/contextMenu'
import useStore from '@/stores'

import Canvas from './components/Canvas'
import Footer from './components/Footer'
import Header from './components/Header'
import List from './components/List'
import Menu from './components/Menu'
import Panel from './components/Panel'
import View from './components/View'

import style from './index.module.less'

export default memo(function Edit() {
  const { canvasInit, activeCanvas, mode } = useStore()

  useEffect(() => {
    canvasInit(config as any)
  }, [])

  const contextMenuRef = useRef(null)

  return (
    <div className={style.edit}>
      <ContextMenu ref={contextMenuRef} />
      <ContextMenuProvider.Provider
        value={{
          contextMenuRef: contextMenuRef.current
        }}
      >
        <Menu />
        <Header />
        {mode === 'list' ? (
          <div className={style.editContainer}>
            <List />
            {activeCanvas !== '' ? (
              <>
                <Canvas />
                <Panel />
              </>
            ) : (
              <div className={style.canvasContainer}>
                <Empty description="暂无选中" />
              </div>
            )}
          </div>
        ) : (
          <View />
        )}
        <Footer />
      </ContextMenuProvider.Provider>
    </div>
  )
})
