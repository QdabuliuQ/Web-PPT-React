import { memo, useCallback, useMemo } from "react";
import Scrollbars from "react-custom-scrollbars";
import { Popover } from "antd";

import ButtonItem from "@/components/ButtonItem";
import useStore from "@/stores";

import shape from "./index"
import shapeItems from "./shape"

import style from "./index.module.less"

function Main() {
  const { activeCanvas } = useStore()
    
  const clickEvent = useCallback(() => { }, [])
  
  const content = useMemo(
    () => 
      <Scrollbars
        style={{
          height: '350px'
        }}
      >
        <div className={style.shapeMenu}>
          {shapeItems.map((item: any) => (
            <div className={style.menuItem}>
              <div className={style.menuTitle}>{item.title}</div>
              <div className={style.shapeContainer}>
                {item.children.map((shape: any) => (
                  <div className="">
                    <svg overflow="visible" width="18" height="18">
                      <g
                        transform={`scale(${18 / shape.viewBox[0]}, ${
                          18 / shape.viewBox[1]
                        }) translate(0,0) matrix(1,0,0,1,0,0)`}
                      >
                        <path
                          vectorEffect="non-scaling-stroke"
                          strokeLinecap="butt"
                          strokeMiterlimit="8"
                          fill={`${shape.outlined ? '#999' : 'transparent'}`}
                          stroke={`${shape.outlined ? 'transparent' : '#999'}`}
                          strokeWidth="2"
                          d={shape.path}
                        />
                      </g>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Scrollbars>
    ,
    []
  )

  return (
    <Popover placement="bottom" content={content} trigger="click">
      <ButtonItem
        disabled={activeCanvas === ''}
        icon={
          <span
            className={style.iconSpan}
            dangerouslySetInnerHTML={{
              __html: shape.info.icon
            }}
          ></span>
        }
        clickEvent={clickEvent}
        title={shape.info.title}
      ></ButtonItem>
    </Popover>
  )
}

export default memo(Main);