import useStore from '@/stores';
import { Fabric } from '@/types/fabirc';

export function elementSelectEvent(e: fabric.IEvent) {
  const { activeElementUpdate } = useStore.getState();
  const { target } = e;
  activeElementUpdate((target as Fabric.Object).property.id);
}
export function elementDeselectEvent() {
  const { activeElementUpdate } = useStore.getState();
  activeElementUpdate('');
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
          type: 'background',
        },
        selectable: false,
        hasControls: false,
        hoverCursor: 'default',
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
          type: 'rect',
        },
        selectable: true,
        evented: true,
      },
    ],
  };
}
