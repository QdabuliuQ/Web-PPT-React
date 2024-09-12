import { fabric } from 'fabric'

export namespace Fabric {
  export interface JSON {
    version: string
    objects: Object[]
  }

  export interface Object extends fabric.Object {
    width: number
    height: number
    left: number
    top: number
    scaleX: number
    scaleY: number
    angle: number
    selectable: boolean
    hasControls: boolean
    hoverCursor: string
    property: {
      id: string
      type: string
    }
    [propName: string]: any
  }
}
