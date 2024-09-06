import useStore from '@/stores';
import { Fabric } from '@/types/fabirc';
import { fabric } from 'fabric';

export function getElementOption(cid: string, eid: string) {
  const { canvas } = useStore.getState();
  for (let i = 0; i < canvas.length; i++) {
    if (canvas[i].id === cid) {
      for (let j = 0; j < canvas[i].fabricOption.objects.length; j++) {
        const element = canvas[i].fabricOption.objects[j];
        if ((element as Fabric.Object).property.id === eid) {
          return element;
        }
      }
    }
  }
  return null;
}

export function overWriteToObject(toObject: any, optionNames: Array<string> = []) {
  return (function cb1(toObject) {
    return function cb2(this: any) {
      const options: { [propName: string]: any } = {};
      optionNames.forEach((name: string) => {
        options[name] = this[name];
      });
      return fabric.util.object.extend(toObject.call(this), {
        property: this.property,
        ...options,
      });
    };
  })(toObject);
}
