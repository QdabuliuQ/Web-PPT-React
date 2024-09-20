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
  show: (x: number, y: number, menu: Array<MenuData>) => void
}

export interface MenuData {
  prefix?: ReactNode
  suffix?: ReactNode
  title: string
  key: string
  clickEvent: (key: string) => void
}

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
          menuData.map((item: MenuData | ReactNode, index: number) =>
            (item as MenuData).title ? (
              <div
                onClick={() => {
                  console.log(11)
                  ;(item as MenuData).clickEvent((item as MenuData).key)
                }}
                key={(item as MenuData).title}
                className={style.menuItem}
              >
                {(item as MenuData).prefix ? (item as MenuData).prefix : <></>}
                <span>{(item as MenuData).title}</span>
                {(item as MenuData).suffix ? (item as MenuData).suffix : <></>}
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
