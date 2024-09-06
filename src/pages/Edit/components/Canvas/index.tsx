import { memo, useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { fabric } from 'fabric';
import style from './index.module.less';
import useStore from '@/stores';
import { type Fabric } from '@/types/fabirc';
import { elementSelectEvent, elementDeselectEvent, overWriteToObject } from '@/utils';

export default memo(function Canvas() {
  const { activeCanvas, canvas, canvasUpdate, instanceUpdate } = useStore();

  const canvasMain = useRef<HTMLDivElement | null>(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const instance = useRef<fabric.Canvas | null>(null);

  const rebuildCanvasDom = useCallback((width: number, height: number) => {
    if (canvasMain.current) {
      canvasMain.current.innerHTML = '';
      const canvas = document.createElement('canvas');
      canvas.id = '__canvas__';
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      canvasMain.current.append(canvas);
    }
  }, []);

  useEffect(() => {
    if (activeCanvas) {
      const width = 800;
      const height = 500;
      setWidth(width);
      setHeight(height);

      rebuildCanvasDom(width, height);

      instance.current = new fabric.Canvas(
        document.getElementById('__canvas__') as HTMLCanvasElement,
        {
          width,
          height,
        }
      );

      instanceUpdate(instance.current);

      instance.current.on(
        'object:modified',
        _.debounce(() => {
          canvasUpdate(instance.current!.toJSON(), activeCanvas);
        }, 100)
      );

      for (let i = 0; i < canvas.length; i++) {
        if (canvas[i].id === activeCanvas) {
          instance.current.loadFromJSON(canvas[i].fabricOption, () => {
            instance.current!.getObjects().forEach((item) => {
              if ((item as Fabric.Object).property.type !== 'background') {
                item.on('selected', elementSelectEvent);
                item.on('deselected', elementDeselectEvent);
              }
              item.toObject = overWriteToObject(item.toObject);
            });
          });

          break;
        }
      }
    }

    () => {
      if (activeCanvas) {
        instance.current?.dispose();
        instance.current?.off('object:selected');
        instance.current?.off('object:modified');
      }
    };
  }, [activeCanvas]);

  return (
    <div ref={canvasMain} className={style.canvas}>
      <canvas
        id="__canvas__"
        width={width}
        height={height}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      ></canvas>
    </div>
  );
});
