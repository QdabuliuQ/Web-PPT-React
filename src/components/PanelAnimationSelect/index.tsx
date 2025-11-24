import { Down } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Popover } from "antd";
import { useEffect, useRef, useState, type FC } from "react";

interface AnimationItem {
  type: string;
  name: string;
}

interface PanelAnimationSelectProps {
  displayAnimations: AnimationItem[];
  moreAnimations: AnimationItem[];
  selectedAnimation: string;
  onSelect: (type: string) => void;
  onAnimationHover?: (type: string) => void;
  onAnimationLeave?: () => void;
  hoverAnimation?: string;
}

export const PanelAnimationSelect: FC<PanelAnimationSelectProps> = ({
  displayAnimations,
  moreAnimations,
  selectedAnimation,
  onSelect,
  onAnimationHover,
  onAnimationLeave,
  hoverAnimation = "",
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 清除关闭定时器
  const clearCloseTimer = useMemoizedFn(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  });

  // 延迟关闭 Popover
  const handleClosePopover = useMemoizedFn(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setPopoverOpen(false);
    }, 200); // 200ms 延迟，给用户时间移动到 Popover
  });

  // 保持 Popover 打开
  const handleKeepPopoverOpen = useMemoizedFn(() => {
    clearCloseTimer();
    setPopoverOpen(true);
  });

  // 渲染动画项
  const renderAnimationItem = (
    item: AnimationItem,
    inPopover = false
  ) => {
    const isSelected = selectedAnimation === item.type;

    return (
      <div
        className={`${
          inPopover ? "h-[42px]" : "h-full"
        } w-[80px] relative text-[12px] cursor-pointer rounded-[6px] overflow-hidden bg-[#fff] border ${
          isSelected ? "border-primary" : "border-[#dfdfdf]"
        } border-dashed flex items-center justify-center flex-shrink-0`}
        key={item.type}
        onMouseEnter={() => onAnimationHover?.(item.type)}
        onMouseLeave={onAnimationLeave}
        onClick={() => onSelect(item.type)}
      >
        <div className="flex flex-col items-center justify-center">
          <div
            className={`font-bold ${
              isSelected ? "text-primary" : "text-[#999]"
            }`}
          >
            {item.name}
          </div>
        </div>
        {item.type !== "" && (
          <div
            className={`animate__animated ${
              hoverAnimation === item.type ? `animate__${item.type}` : ""
            } ${
              hoverAnimation === item.type ? "opacity-100" : "opacity-0"
            } absolute w-full h-full bg-primary flex items-center justify-center text-[12px] text-white font-bold`}
          >
            Web PPT
          </div>
        )}
      </div>
    );
  };

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  // Popover 内容
  const popoverContent = (
    <div
      className="flex flex-wrap gap-[4px] w-[500px] max-h-[300px] overflow-y-auto"
      onMouseEnter={handleKeepPopoverOpen}
      onMouseLeave={handleClosePopover}
    >
      {moreAnimations.map((item) => renderAnimationItem(item, true))}
    </div>
  );

  return (
    <Popover
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      placement="bottom"
      content={popoverContent}
      trigger={[]}
      overlayClassName="animation-popover"
    >
      <div className="h-[53px] px-[5px] box-border border border-[#dfdfdf] rounded-[6px] flex items-center gap-[4px]">
        <div className="h-[51px] flex items-center">
          <div className="h-[42px] flex items-center gap-[4px]">
            {displayAnimations.map((item) => renderAnimationItem(item))}
            <div
              className="h-[42px] w-[15px] flex items-center justify-center cursor-pointer rounded-[6px] border border-[#dfdfdf] bg-[#f5f5f5] transition-colors hover:bg-[#e8e8e8]"
              onMouseEnter={handleKeepPopoverOpen}
              onMouseLeave={handleClosePopover}
            >
              <Down
                theme="outline"
                size="13"
                fill="#666"
                className={`transition-transform duration-200 ${
                  popoverOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </Popover>
  );
};

