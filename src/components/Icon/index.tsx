import { memo, useCallback } from 'react';
import { createFromIconfontCN } from '@ant-design/icons';
import { getAssetsFile } from '@/utils';

export interface IconProps {
  icon: string;
  clickEvent?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const IconFont = createFromIconfontCN({
  scriptUrl: getAssetsFile('icon/iconfont.js'),
});

export default memo(function Icon({ icon, clickEvent, style, className }: IconProps) {
  const clickHandle = useCallback(() => {
    clickEvent && clickEvent();
  }, [clickEvent]);

  return (
    <IconFont
      onClick={clickHandle}
      style={style}
      className={`iconfont ${className || ''}`}
      type={icon}
    />
  );
});
