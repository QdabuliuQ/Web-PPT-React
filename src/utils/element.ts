import useStore from '@/stores';
import { Fabric } from '@/types/fabirc';

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
