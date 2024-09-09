import { fabric } from 'fabric';

export namespace Fabric {
  export interface JSON {
    version: string;
    objects: fabric.Object[];
  }

  export interface Object extends fabric.Object {
    width: number;
    height: number;
    left: number;
    top: number;
    scaleX: number;
    scaleY: number;
    angle: number;
    property: {
      id: string;
      type: string;
    };
  }
}
