import { fabric } from 'fabric'

import useStore from '@/stores'
import { Fabric } from '@/types/fabirc'

import { elementDeselectEvent, elementSelectEvent, getRandomID } from './index'

export function initElement(el: fabric.Object) {
  el.toObject = overWriteToObject(el.toObject)
  el.on('selected', elementSelectEvent)
  el.on('deselected', elementDeselectEvent)
}

export function getRectElement(option: { [propName: string]: any } = {}) {
  const rect = new fabric.Rect({
    left: 0,
    top: 0,
    width: 100,
    height: 70,
    property: {
      id: getRandomID(10),
      type: 'rect'
    },
    fill: '#c05316',
    ...option
  } as { [propName: string]: any })
  initElement(rect)
  return rect
}

export function getTriangleElement(option: { [propName: string]: any } = {}) {
  const triangle = new fabric.Triangle({
    left: 0,
    top: 0,
    width: 100,
    height: 70,
    property: {
      id: getRandomID(10),
      type: 'triangle'
    },
    fill: '#c05316',
    ...option
  } as { [propName: string]: any })
  initElement(triangle)
  return triangle
}

export function getTextElement(option: { [propName: string]: any } = {}) {
  const text = new fabric.Textbox('请插入文本', {
    left: 0,
    top: 0,
    width: 100,
    height: 70,
    property: {
      id: getRandomID(10),
      type: 'triangle'
    },
    fill: '#c05316',
    ...option
  } as { [propName: string]: any })
  initElement(text)
  return text
}

export function getCircleElement(option: { [propName: string]: any } = {}) {
  const circle = new fabric.Circle({
    left: 0,
    top: 0,
    width: 70,
    height: 70,
    radius: 50,
    property: {
      id: getRandomID(10),
      type: 'circle'
    },
    fill: '#c05316',
    ...option
  } as { [propName: string]: any })

  initElement(circle)
  return circle
}

export function getElementOption(cid: string, eid: string) {
  const { canvas } = useStore.getState()
  for (let i = 0; i < canvas.length; i++) {
    if (canvas[i].id === cid) {
      for (let j = 0; j < canvas[i].fabricOption.objects.length; j++) {
        const element = canvas[i].fabricOption.objects[j]
        if ((element as Fabric.Object).property.id === eid) {
          return element
        }
      }
    }
  }
  return null
}

export function getBgRectElementOption(cid: string) {
  const { canvas } = useStore.getState()
  for (let i = 0; i < canvas.length; i++) {
    if (canvas[i].id === cid) {
      for (let j = 0; j < canvas[i].fabricOption.objects.length; j++) {
        const element = canvas[i].fabricOption.objects[j]
        if ((element as Fabric.Object).property.type === 'background') {
          return element
        }
      }
    }
  }
  return null
}

export function overWriteToObject(
  toObject: any,
  optionNames: Array<string> = []
) {
  return (function cb1(toObject) {
    return function cb2(this: any) {
      const options: { [propName: string]: any } = {}
      optionNames.forEach((name: string) => {
        options[name] = this[name]
      })
      return fabric.util.object.extend(toObject.call(this), {
        property: this.property,
        ...options
      })
    }
  })(toObject)
}
