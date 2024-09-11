import useStore from '@/stores'
import { Fabric } from '@/types/fabirc'

import { getRandomID } from '.'

export function elementSelectEvent(e: fabric.IEvent) {
  const { activeElementUpdate } = useStore.getState()
  const { target } = e
  activeElementUpdate((target as Fabric.Object).property.id)
}
export function elementDeselectEvent() {
  const { activeElementUpdate } = useStore.getState()
  activeElementUpdate('')
}

export function getNewCanvasOption() {
  return {
    version: '5.3.0',
    objects: [
      {
        type: 'rect',
        version: '5.3.0',
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0,
        width: 800,
        height: 500,
        fill: '#fff',
        stroke: null,
        strokeWidth: 1,
        strokeDashArray: null,
        strokeLineCap: 'butt',
        strokeDashOffset: 0,
        strokeLineJoin: 'miter',
        strokeUniform: false,
        strokeMiterLimit: 4,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        flipX: false,
        flipY: false,
        opacity: 1,
        shadow: null,
        visible: true,
        backgroundColor: '',
        fillRule: 'nonzero',
        paintFirst: 'fill',
        globalCompositeOperation: 'source-over',
        skewX: 0,
        skewY: 0,
        rx: 0,
        ry: 0,
        property: {
          type: 'background'
        },
        selectable: false,
        hasControls: false,
        hoverCursor: 'default'
      },
      {
        type: 'rect',
        version: '5.3.0',
        originX: 'center',
        originY: 'center',
        left: 0,
        top: 0,
        width: 100,
        height: 70,
        fill: '#1677ff',
        stroke: null,
        strokeWidth: 1,
        strokeDashArray: null,
        strokeLineCap: 'butt',
        strokeDashOffset: 0,
        strokeLineJoin: 'miter',
        strokeUniform: false,
        strokeMiterLimit: 4,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        flipX: false,
        flipY: false,
        opacity: 1,
        shadow: null,
        visible: true,
        backgroundColor: '',
        fillRule: 'nonzero',
        paintFirst: 'fill',
        globalCompositeOperation: 'source-over',
        skewX: 0,
        skewY: 0,
        rx: 0,
        ry: 0,
        property: {
          id: 'pA9zlORubK',
          type: 'rect'
        },
        selectable: true,
        evented: true
      },
      {
        type: 'textbox',
        version: '5.3.0',
        originX: 'center',
        originY: 'center',
        left: 258.8,
        top: 126,
        width: 150,
        height: 48.82,
        fill: 'rgba(255,0,0,0.5)',
        stroke: null,
        strokeWidth: 1,
        strokeDashArray: null,
        strokeLineCap: 'butt',
        strokeDashOffset: 0,
        strokeLineJoin: 'miter',
        strokeUniform: false,
        strokeMiterLimit: 4,
        scaleX: 2.04,
        scaleY: 2.04,
        angle: 0,
        flipX: false,
        flipY: false,
        opacity: 1,
        shadow: null,
        visible: true,
        backgroundColor: 'rgba(0,0,0,0)',
        fillRule: 'nonzero',
        paintFirst: 'fill',
        globalCompositeOperation: 'source-over',
        skewX: 0,
        skewY: 0,
        fontFamily: 'Times New Roman',
        fontWeight: 'normal',
        fontSize: 20,
        text: 'Lorum ipsum dolor sit amet',
        underline: false,
        overline: false,
        linethrough: true,
        textAlign: 'justify-right',
        fontStyle: 'normal',
        lineHeight: 1.16,
        textBackgroundColor: '',
        charSpacing: 0,
        styles: [],
        direction: 'ltr',
        path: null,
        pathStartOffset: 0,
        pathSide: 'left',
        pathAlign: 'baseline',
        minWidth: 20,
        splitByGrapheme: false,
        property: {
          id: 'NkdqJfrEEG',
          type: 'text'
        }
      },
      {
        type: 'triangle',
        version: '5.3.0',
        originX: 'center',
        originY: 'center',
        left: 127,
        top: 93,
        width: 100,
        height: 70,
        fill: '#1677ff',
        stroke: null,
        strokeWidth: 1,
        strokeDashArray: null,
        strokeLineCap: 'butt',
        strokeDashOffset: 0,
        strokeLineJoin: 'miter',
        strokeUniform: false,
        strokeMiterLimit: 4,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        flipX: false,
        flipY: false,
        opacity: 1,
        shadow: null,
        visible: true,
        backgroundColor: '',
        fillRule: 'nonzero',
        paintFirst: 'fill',
        globalCompositeOperation: 'source-over',
        skewX: 0,
        skewY: 0,
        property: {
          id: 'y4bHFmbWun',
          type: 'triangle'
        }
      }
    ]
  }
}

export function getNewCanvas() {
  return {
    remark: '',
    visible: true,
    id: getRandomID(10),
    fabricOption: {
      version: '5.3.0',
      objects: [
        {
          type: 'rect',
          version: '5.3.0',
          originX: 'left',
          originY: 'top',
          left: 0,
          top: 0,
          width: 800,
          height: 500,
          fill: '#fff',
          stroke: null,
          strokeWidth: 1,
          strokeDashArray: null,
          strokeLineCap: 'butt',
          strokeDashOffset: 0,
          strokeLineJoin: 'miter',
          strokeUniform: false,
          strokeMiterLimit: 4,
          scaleX: 1,
          scaleY: 1,
          angle: 0,
          flipX: false,
          flipY: false,
          opacity: 1,
          shadow: null,
          visible: true,
          backgroundColor: '',
          fillRule: 'nonzero',
          paintFirst: 'fill',
          globalCompositeOperation: 'source-over',
          skewX: 0,
          skewY: 0,
          rx: 0,
          ry: 0,
          property: {
            type: 'background'
          },
          selectable: false,
          hasControls: false,
          hoverCursor: 'default'
        }
      ]
    }
  }
}
