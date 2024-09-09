import type { ForwardedRef, ReactNode } from 'react';
import { forwardRef, memo, useImperativeHandle, useRef, useState } from 'react';

import useClickOutside from '@/hooks/useClickOutside';
import style from './index.module.less';

export interface ContextMenuItem {
  title: string;
  key: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export interface ContextMenuRef {
  hide: () => void;
  show: (x: number, y: number) => void;
}

interface Props {
  menuData: Array<ContextMenuItem | ReactNode>;
  menuClick: (title: string, key: string) => void;
}

export default memo(
  forwardRef(function ContextMenu(props: Props, ref: ForwardedRef<ContextMenuRef>) {
    const [visible, setVisible] = useState<boolean>(false);
    const [x, setX] = useState<number>(0);
    const [y, setY] = useState<number>(0);
    const domRef = useRef(null);

    useImperativeHandle(ref, () => ({
      hide: () => setVisible(false),
      show: (x: number, y: number) => {
        setVisible(true);
        setX(x);
        setY(y);
      },
    }));

    useClickOutside(domRef, () => {
      setVisible(false);
    });

    return visible ? (
      <div
        ref={domRef}
        style={{
          left: `${x}px`,
          top: `${y}px`,
        }}
        className={style.contextMenu}
      >
        {props.menuData &&
          props.menuData.map((item: ContextMenuItem | ReactNode, index: number) =>
            (item as ContextMenuItem).title ? (
              <div
                onClick={() =>
                  props.menuClick((item as ContextMenuItem).title, (item as ContextMenuItem).key)
                }
                key={(item as ContextMenuItem).title}
                className={style.menuItem}
              >
                {(item as ContextMenuItem).prefix ? (item as ContextMenuItem).prefix : <></>}
                <span>{(item as ContextMenuItem).title}</span>
                {(item as ContextMenuItem).suffix ? (item as ContextMenuItem).suffix : <></>}
              </div>
            ) : (
              <div key={index}>{item as ReactNode}</div>
            )
          )}
      </div>
    ) : (
      <></>
    );
  })
);
