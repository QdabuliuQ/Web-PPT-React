import useStore from '@/stores';
import { Fabric } from '@/types/fabirc';
import { Slider } from 'antd';
import { type SliderSingleProps } from 'antd/es/slider';
import _ from 'lodash';
import { memo, useCallback } from 'react';

interface Props extends SliderSingleProps {
  propName: string;
}

export default memo(function _Slider({ propName, ...other }: Props) {
  const { canvasUpdate } = useStore();
  const changeEvent = useCallback(
    _.debounce((value: number) => {
      const { instance, activeElement, activeCanvas } = useStore.getState();
      if (instance) {
        for (let i = 0; i < instance._objects.length; i++) {
          const element = instance._objects[i] as Fabric.Object;
          if (element.property.id === activeElement) {
            element.set({
              [propName]: value,
            });

            instance.renderAll();
            canvasUpdate(instance.toObject(), activeCanvas);
            break;
          }
        }
      }
    }, 200),
    []
  );

  return <Slider {...(other ? other : {})} onChange={changeEvent} />;
});
