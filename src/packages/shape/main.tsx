import { memo, useCallback, useMemo, useRef, useState } from 'react'
import Scrollbars from 'react-custom-scrollbars'
import { useClickAway } from 'ahooks'
import { Popover } from 'antd'

import ButtonItem from '@/components/ButtonItem'
import useStore from '@/stores'

import shape from './index'
import shapeItems from './shape'

import style from './index.module.less'

interface Props {
  finish: (option: any) => void
}

function Main({ finish }: Props) {
  const [open, setOpen] = useState(false)
  const { activeCanvas } = useStore()

  const getTitle = useCallback((type: string) => {
    if (type === 'rect') {
      return '矩形'
    }
    if (type === 'commonShape') {
      return '常见形状'
    }
    if (type === 'arrow') {
      return '箭头'
    }
    if (type === 'otherShape') {
      return '其他形状'
    }
    if (type === 'line') {
      return '线条'
    }
  }, [])

  const shapeClickEvent = useCallback(
    async (path: string, viewBox: [number, number], outlined?: boolean) => {
      console.log(path, viewBox)

      const el = await shape.createElement(
        `<svg 
				xmlns="http://www.w3.org/2000/svg"
					overflow="visible"
					width="18"
					height="18">
					<g transform="scale(${18 / viewBox[0]}, ${
            18 / viewBox[1]
          }) translate(0,0) matrix(1,0,0,1,0,0)">
					<path
						vectorEffect="non-scaling-stroke"
						strokeLinecap="butt"
						strokeMiterlimit="8"
						fill="${outlined ? '#999' : 'transparent'}"
						stroke="${outlined ? 'transparent' : '#999'}"
						strokeWidth="2"
						d="${path}"
					></path>
					</g>
				</svg>`,
        viewBox
      )
      console.log(el)

      finish(el)
      setOpen(false)
    },
    []
  )

  const content = useMemo(
    () => (
      <Scrollbars
        style={{
          width: '350px',
          height: '350px'
        }}
      >
        <div className={style.shapeMenu}>
          {shapeItems.map((item: any) => (
            <div key={item.type} className={style.menuItem}>
              <div className={style.menuTitle}>{getTitle(item.type)}</div>
              <div className={style.shapeContainer}>
                {item.children.map((shape: any) => (
                  <div
                    onClick={(e: any) => {
                      console.log('cll')
                      e.preventDefault()
                      shapeClickEvent(shape.path, shape.viewBox, shape.outlined)
                    }}
                    key={shape.path}
                    className={style.shapeItem}
                  >
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
    ),
    []
  )

  const popoverRef = useRef<any>(null)

  const clickEvent = useCallback((e: any) => {
    console.log(111)
    e.preventDefault()
    setOpen(true)
  }, [])

  const buttonRef = useRef<any>()

  useClickAway(() => {
    if (open) {
      setOpen(false)
    }
  }, [() => document.getElementsByClassName('popoverShape')[0], buttonRef])

  return (
    <Popover
      open={open}
      ref={popoverRef}
      overlayClassName={`${style.popoverShape} popoverShape`}
      placement="bottom"
      content={content}
      trigger="click"
    >
      <div ref={buttonRef} onClick={clickEvent}>
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
          title={shape.info.title}
        ></ButtonItem>
      </div>
    </Popover>
  )
}

export default memo(Main)
