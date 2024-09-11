import type { ForwardedRef } from 'react'
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import Ruler from '@scena/react-guides'

import type { CanvasRulerRef, Props } from './types'

import style from './index.module.less'

const CanvasRuler = (props: Props, ref: ForwardedRef<CanvasRulerRef>) => {
  const { children, canvasWidth, canvasHeight } = props
  const [width, setWidth] = useState(canvasWidth)
  const [height, setHeight] = useState(canvasHeight)
  const [posX, setPosX] = useState(0)
  const [posY, setPosY] = useState(0)
  const [scale, setScale] = useState(1)
  const verticalRulerRef = useRef<null | Ruler>(null)
  const horizontalRulerRef = useRef<null | Ruler>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)

  let startX = 0
  let startY = 0

  const computedDis = () => {
    const containerRect = containerRef.current!.getBoundingClientRect()
    const canvasRect = canvasRef.current!.getBoundingClientRect()
    const disX = Math.floor(containerRect.left) - Math.floor(canvasRect.left)
    const disY = Math.floor(containerRect.top) - Math.floor(canvasRect.top)
    return { disX, disY }
  }

  const setLayoutPos = (scale: number) => {
    const { disX, disY } = computedDis()
    containerRef.current!.scrollLeft += -disX - 20
    containerRef.current!.scrollTop +=
      -disY -
      (containerRef.current!.clientHeight -
        canvasRef.current!.clientHeight * scale) /
        2
  }

  const autoLayoutCanvas = () => {
    const containerWidth = containerRef.current!.clientWidth - 40
    const containerHeight = containerRef.current!.clientHeight

    const containerRatio = parseFloat(
      (containerWidth / containerHeight).toFixed(3)
    )
    const canvasRatio = parseFloat((width / height).toFixed(3))
    let scale = 1
    if (canvasRatio > containerRatio) {
      const scaleWidth = parseFloat((containerWidth / width).toFixed(3))
      scale = scaleWidth > 1 ? 1 : scaleWidth
    } else {
      const scaleHeight = parseFloat((containerHeight / height).toFixed(3))
      scale = scaleHeight > 1 ? 1 : scaleHeight
    }
    setScale(Number(scale.toFixed(1)))
    setLayoutPos(scale)
  }

  const handleMouseMove = (e: any) => {
    containerRef.current!.scrollLeft = startX - e.pageX
    containerRef.current!.scrollTop = startY - e.pageY
  }

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  const dragCanvas = () => {
    canvasRef.current?.addEventListener('mousedown', (e: any) => {
      e.preventDefault()
      e.stopPropagation()
      startX = e.pageX + containerRef.current!.scrollLeft
      startY = e.pageY + containerRef.current!.scrollTop
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    })
  }

  const handlePageResize = () => {
    verticalRulerRef.current?.resize()
    horizontalRulerRef.current?.resize()
  }

  const handleScroll = useCallback(() => {
    const { disX, disY } = computedDis()

    setPosX(Math.floor(disX / scale))
    setPosY(Math.floor(disY / scale))
    horizontalRulerRef.current!.scrollGuides(disY / scale)
    verticalRulerRef.current!.scrollGuides(disX / scale)
  }, [scale])

  const handleWheel = useCallback(
    (e: any) => {
      e.preventDefault()
      if (e.ctrlKey) {
        let s = scale

        if (e.wheelDelta > 0) {
          s = s >= 2 ? s : s + 0.1
          setScale((pre: number) =>
            Number((pre >= 2 ? pre : pre + 0.1).toFixed(1))
          )
        } else if (e.wheelDelta < 0) {
          s = s <= 0.5 ? s : s - 0.1
          setScale((pre: number) =>
            Number((pre <= 0.5 ? pre : pre - 0.1).toFixed(1))
          )
        }
        setWidth(width * s)
        setHeight(height * s)
        handleScroll()
      }
    },
    [handleScroll, height, scale, width]
  )

  const containerWidth = useRef<number>(0)
  const containerHeight = useRef<number>(0)

  const updateScale = (scale?: number) => setScale(scale || 1)
  const initPosition = () => {
    const width = canvasWidth * scale * 2
    containerRef.current!.scrollLeft =
      (width - document.getElementsByClassName('content-box')[0].clientWidth) /
      2
    containerRef.current!.scrollTop =
      (canvasHeight * scale * 2 -
        document.getElementsByClassName('content-box')[0].clientHeight) /
      2
  }
  const scaleUp = () =>
    setScale((pre: number) => Number((pre >= 2 ? pre : pre + 0.1).toFixed(1)))
  const scaleDown = () =>
    setScale((pre: number) => Number((pre <= 0.5 ? pre : pre - 0.1).toFixed(1)))

  const setGuideLines = (
    direction: 'vertical' | 'horizontal',
    lines: Array<number>
  ) => {
    if (direction === 'vertical') {
      verticalRulerRef.current?.loadGuides(lines)
    } else if (direction === 'horizontal') {
      horizontalRulerRef.current?.loadGuides(lines)
    }
  }

  useImperativeHandle(ref as any, () => ({
    updateScale,
    initPosition,
    scaleUp,
    scaleDown,
    setGuideLines
  }))

  useEffect(() => {
    dragCanvas()
    autoLayoutCanvas()
    window.addEventListener('resize', handlePageResize)
    containerRef.current!.addEventListener('wheel', handleWheel, {
      passive: false
    })

    return () => {}
  }, [])

  useEffect(() => {
    initPosition()
  }, [canvasWidth, canvasHeight, scale])

  useEffect(() => {
    canvasRef.current && handleScroll()
    const container = document
      .getElementById('canvas-component')
      ?.getBoundingClientRect()
    containerWidth.current = container!.width - 30
    containerHeight.current = container!.height - 30
  }, [scale, canvasHeight, canvasWidth, handleScroll, initPosition])

  const computedUnit = useMemo(() => {
    if (scale > 1.5) return 25
    if (scale > 0.75 && scale <= 1.5) return 50
    if (scale > 0.4 && scale <= 0.75) return 100
    if (scale > 0.2 && scale <= 0.4) return 200
    return 400
  }, [scale])

  const lineStyle = useMemo(
    () => ({
      backgroundColor: '#1677ff'
    }),
    []
  )
  const posStyle = useMemo(
    () => ({
      color: '#1677ff'
    }),
    []
  )

  return (
    <div className={style.rulerContainer}>
      <div className={style.left}>
        <div className={style.px}>px</div>
        <Ruler
          ref={verticalRulerRef}
          type="vertical"
          lineColor="#aaa"
          textColor="#aaa"
          backgroundColor="#fff"
          negativeRuler
          zoom={scale}
          scrollPos={posY}
          unit={computedUnit}
          guideStyle={lineStyle}
          dragGuideStyle={lineStyle}
          segment={2}
          textOffset={[10, 0]}
          displayDragPos
          guidePosStyle={posStyle}
        />
      </div>
      <div className={style.right}>
        <div style={{ height: '20px' }}>
          <Ruler
            type="horizontal"
            ref={horizontalRulerRef}
            lineColor="#aaa"
            textColor="#aaa"
            backgroundColor="#fff"
            negativeRuler
            zoom={scale}
            scrollPos={posX}
            unit={computedUnit}
            guideStyle={lineStyle}
            dragGuideStyle={lineStyle}
            segment={2}
            textOffset={[0, 10]}
            displayDragPos
            guidePosStyle={posStyle}
          />
        </div>
        <div
          className={`${style.contentBox} content-box`}
          ref={containerRef}
          onScroll={handleScroll}
        >
          <div
            className={style.contentLayout}
            style={{
              width: `${
                canvasWidth * scale * 2 < containerWidth.current
                  ? containerWidth.current
                  : canvasWidth * scale * 2
              }px`,
              height: `${
                canvasHeight * scale * 2 < containerHeight.current
                  ? containerHeight.current
                  : canvasHeight * scale * 2
              }px`
            }}
          >
            <div
              className={style.contentCanvas}
              ref={canvasRef}
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                transform: `translate(-50%, -50%) scale(${scale})`
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(forwardRef(CanvasRuler))
