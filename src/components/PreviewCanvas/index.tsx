import { memo, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import style from './index.module.less';

interface Props {
  id: string;
  fabricOption: any;
  width: number;
  height: number;
}

export default memo(function PreviewCanvas({ id, fabricOption, width, height }: Props) {
  const instanceRef = useRef<fabric.StaticCanvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!instanceRef.current) {
      instanceRef.current = new fabric.StaticCanvas(canvasRef.current, {
        width,
        height,
        selection: false, // 画布不显示选中
        fireRightClick: true, // 右键点击事件生效
        stopContextMenu: true, // 右键点击禁用默认自带的目录
        fireMiddleClick: true, // 中间建点击事件生效
        allowTouchScrolling: true,
      });

      instanceRef.current.loadFromJSON(fabricOption, () => {});
    }
  }, []);

  return (
    <div className={style.previewCanvas}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
});
