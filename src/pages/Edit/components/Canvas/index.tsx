import { memo } from 'react';

import style from './index.module.less';
import CanvasRuler from '../CanvasRuler';

export default memo(function Canvas() {
  return (
    <div className={style.canvas}>
      {/* <CanvasRuler canvasWidth={500} canvasHeight={500}>
        <canvas></canvas>
      </CanvasRuler> */}
    </div>
  );
});
