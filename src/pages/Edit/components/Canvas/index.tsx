import { memo, useEffect, useRef, useState } from 'react';

import style from './index.module.less';

export default memo(function Canvas() {
  const canvasMain = useRef<HTMLDivElement | null>(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setWidth(canvasMain.current!.clientWidth * 0.8);
    setHeight(canvasMain.current!.clientWidth * 0.8 * 0.6);
  }, []);

  return (
    <div ref={canvasMain} className={style.canvas}>
      <canvas
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
