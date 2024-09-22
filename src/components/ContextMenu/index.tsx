import type { ForwardedRef, ReactNode } from 'react'
import { forwardRef, memo, useImperativeHandle, useRef, useState } from 'react'
import { useClickAway } from 'ahooks'

import style from './index.module.less'

export interface ContextMenuItem {
  title: string
  key: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export interface ContextMenuRef {
  hide: () => void
  show: (x: number, y: number, menu: Array<MenuData | ReactNode>) => void
}

export type MenuItem = {
  prefix?: ReactNode
  suffix?: ReactNode
  title: string
  key: string
  clickEvent: (key: string) => void
}

export type MenuData = MenuItem | ReactNode

export default memo(
  forwardRef(function ContextMenu(
    _: unknown,
    ref: ForwardedRef<ContextMenuRef>
  ) {
    const [visible, setVisible] = useState<boolean>(false)
    const [x, setX] = useState<number>(0)
    const [y, setY] = useState<number>(0)
    const domRef = useRef(null)

    const [menuData, setMenuData] = useState<Array<MenuData>>([])

    useImperativeHandle(ref, () => ({
      hide: () => setVisible(false),
      show: (x: number, y: number, menu: Array<MenuData>) => {
        setVisible(true)
        setX(x)
        setY(y)
        if (menu !== menuData) {
          setMenuData(menu)
        }
      }
    }))

    useClickAway(() => {
      setVisible(false)
    }, domRef)

    return visible ? (
      <div
        ref={domRef}
        style={{
          left: `${x}px`,
          top: `${y}px`
        }}
        className={style.contextMenu}
      >
        {menuData.length &&
          menuData.map((item: MenuData, index: number) =>
            (item as MenuItem)!.title ? (
              <div
                onClick={() => {
                  console.log(11)
                  ;(item as MenuItem).clickEvent((item as MenuItem).key)
                }}
                key={(item as MenuItem).title}
                className={style.menuItem}
              >
                {(item as MenuItem).prefix ? (item as MenuItem).prefix : <></>}
                <span>{(item as MenuItem).title}</span>
                {(item as MenuItem).suffix ? (item as MenuItem).suffix : <></>}
              </div>
            ) : (
              <div key={index}>{item as ReactNode}</div>
            )
          )}
      </div>
    ) : (
      <></>
    )
  })
)
