import { PanelLargeButton, PanelSelect, PanelSplitLine } from "@/components";
import { pageActiveStore, pptStore } from "@/store";
import { Down, FullSelection } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Checkbox, InputNumber, Popover } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState, type FC } from "react";
import styles from "./index.module.less";

const toggleInAnimationName = [
  {
    type: "",
    name: "无切换",
  },
  {
    type: "backInDown",
    name: "回弹下",
  },
  {
    type: "backInLeft",
    name: "回弹左",
  },
  {
    type: "backInRight",
    name: "回弹右",
  },
  {
    type: "backInUp",
    name: "回弹上",
  },
  {
    type: "bounceIn",
    name: "弹跳",
  },
  {
    type: "bounceInDown",
    name: "弹跳下",
  },
  {
    type: "bounceInLeft",
    name: "弹跳左",
  },
  {
    type: "bounceInRight",
    name: "弹跳右",
  },
  {
    type: "bounceInUp",
    name: "弹跳上",
  },
  {
    type: "fadeIn",
    name: "淡入",
  },
  {
    type: "fadeInDown",
    name: "淡入下",
  },
  {
    type: "fadeInDownBig",
    name: "淡入下(快)",
  },
  {
    type: "fadeInLeft",
    name: "淡入左",
  },
  {
    type: "fadeInLeftBig",
    name: "淡入左(快)",
  },
  {
    type: "fadeInRight",
    name: "淡入右",
  },
  {
    type: "fadeInRightBig",
    name: "淡入右(快)",
  },
  {
    type: "fadeInUp",
    name: "淡入上",
  },
  {
    type: "fadeInUpBig",
    name: "淡入上(快)",
  },
  {
    type: "fadeInTopLeft",
    name: "淡入左上",
  },
  {
    type: "fadeInTopRight",
    name: "淡入右上",
  },
  {
    type: "fadeInBottomLeft",
    name: "淡入左下",
  },
  {
    type: "fadeInBottomRight",
    name: "淡入右下",
  },
];

const toggleInDurationOptions = [
  {
    value: "faster",
    label: "0.5秒",
  },
  {
    value: "fast",
    label: "0.8秒",
  },
  {
    value: "default",
    label: "1秒",
  },
  {
    value: "slow",
    label: "2秒",
  },
  {
    value: "slower",
    label: "3秒",
  },
];

const toggleInDelayOptions = [
  {
    value: "0",
    label: "默认",
  },
  {
    value: "2",
    label: "2秒",
  },
  {
    value: "3",
    label: "3秒",
  },
  {
    value: "4",
    label: "4秒",
  },
  {
    value: "5",
    label: "5秒",
  },
];

const ToggleComponent: FC = () => {
  const [animationName, setAnimationName] = useState<string>("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 获取当前页面
  const pageActive = pageActiveStore.getPageActive();
  const currentPage = pageActive ? pptStore.getActivePage(pageActive) : null;
  const currentToggleIn = (currentPage as any)?.toggleIn || "";
  const currentToggleInDuration = (currentPage as any)?.toggleInDuration || 0;
  const currentToggleInDelay = (currentPage as any)?.toggleInDelay || 0;
  const currentClickToNext = (currentPage as any)?.clickToNext || true;
  const currentAutoToggle = (currentPage as any)?.autoToggle || false;
  const currentAutoToggleTime = (currentPage as any)?.autoToggleTime || 5;

  // 前6个动画
  const displayAnimations = toggleInAnimationName.slice(0, 6);
  // 剩余的动画
  const moreAnimations = toggleInAnimationName.slice(6);

  const mouseEnterHandle = useMemoizedFn((type: string) => {
    setAnimationName(type);
  });

  const mouseLeaveHandle = useMemoizedFn(() => setAnimationName(""));

  // 更新页面属性的通用函数
  const updatePageProperty = useMemoizedFn((property: string, value: any) => {
    if (!pageActive) return;
    const page = pptStore.getActivePage(pageActive);
    if (!page) return;

    const pageIndex = pptStore.getPages().findIndex((p) => p.id === pageActive);
    if (pageIndex === -1) return;

    const newPages = [...pptStore.getPages()];
    newPages[pageIndex] = {
      ...newPages[pageIndex],
      [property]: value,
    } as any;
    pptStore.setPages(newPages);
  });

  // 处理动画选择
  const handleAnimationSelect = useMemoizedFn((type: string) => {
    updatePageProperty("toggleIn", type);
  });

  // 处理过渡时间变化
  const handleToggleInDurationChange = useMemoizedFn((value: string) => {
    updatePageProperty("toggleInDuration", value);
  });

  // 处理延迟时间变化
  const handleToggleInDelayChange = useMemoizedFn((value: string) => {
    updatePageProperty("toggleInDelay", value);
  });

  // 处理单击换片变化
  const handleClickToNextChange = useMemoizedFn(
    (e: { target: { checked: boolean } }) => {
      updatePageProperty("clickToNext", e.target.checked);
    }
  );

  // 处理自动换片变化
  const handleAutoToggleChange = useMemoizedFn(
    (e: { target: { checked: boolean } }) => {
      updatePageProperty("autoToggle", e.target.checked);
    }
  );

  // 处理自动换片时间变化
  const handleAutoToggleTimeChange = useMemoizedFn((value: number | null) => {
    if (value !== null) {
      updatePageProperty("autoToggleTime", value);
    }
  });

  // 应用全部：将当前页面的切换动画设置应用到所有页面
  const handleApplyToAll = useMemoizedFn(() => {
    if (!pageActive || !currentPage) return;

    // 获取当前页面的切换动画相关属性
    const toggleSettings = {
      toggleIn: currentToggleIn,
      toggleInDuration: currentToggleInDuration,
      toggleInDelay: currentToggleInDelay,
      clickToNext: currentClickToNext,
      autoToggle: currentAutoToggle,
      autoToggleTime: currentAutoToggleTime,
    };

    // 更新所有页面
    const newPages = pptStore.getPages().map((page) => ({
      ...page,
      ...toggleSettings,
    })) as any;

    pptStore.setPages(newPages);
  });

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
    item: { type: string; name: string },
    inPopover = false
  ) => {
    const isSelected = currentToggleIn === item.type;

    return (
      <div
        className={`${
          inPopover ? "h-[42px]" : "h-full"
        } w-[80px] relative text-[12px] cursor-pointer rounded-[6px] overflow-hidden bg-[#fff] border ${
          isSelected ? "border-primary" : "border-[#dfdfdf]"
        } border-dashed flex items-center justify-center flex-shrink-0`}
        key={item.type}
        onMouseEnter={() => mouseEnterHandle(item.type)}
        onMouseLeave={mouseLeaveHandle}
        onClick={() => handleAnimationSelect(item.type)}
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
              animationName === item.type ? `animate__${item.type}` : ""
            } ${
              animationName === item.type ? "opacity-100" : "opacity-0"
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
    <div className="flex gap-[10px] h-[53px]">
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
      <PanelSplitLine />
      <div className="flex flex-col justify-between gap-[4px] mr-[5px]">
        <div className="flex items-center gap-[4px]">
          <span className="text-[12px] text-[#666] mr-[5px]">过渡时间</span>
          <PanelSelect
            value={currentToggleInDuration}
            options={toggleInDurationOptions}
            size="small"
            style={{ width: 70 }}
            onChange={handleToggleInDurationChange}
          />
        </div>
        <div className="flex items-center gap-[4px]">
          <span className="text-[12px] text-[#666] mr-[5px]">延迟时间</span>
          <PanelSelect
            value={currentToggleInDelay}
            options={toggleInDelayOptions}
            size="small"
            style={{ width: 70 }}
            onChange={handleToggleInDelayChange}
          />
        </div>
      </div>
      <div className="flex flex-col justify-between gap-[4px]">
        <div className="flex items-center gap-[4px] text-[12px] h-[24px]">
          <Checkbox
            checked={currentClickToNext}
            onChange={handleClickToNextChange}
            style={{ fontSize: "12px" }}
          >
            单击鼠标时换片
          </Checkbox>
        </div>
        <div className={`flex items-center gap-[4px] ${styles.checkboxCustom}`}>
          <Checkbox
            checked={currentAutoToggle}
            onChange={handleAutoToggleChange}
            style={{ fontSize: "12px" }}
          >
            自动换片：
            <InputNumber
              disabled={!currentAutoToggle}
              size="small"
              value={currentAutoToggleTime}
              style={{ width: 70 }}
              onChange={handleAutoToggleTimeChange}
            />
          </Checkbox>
        </div>
      </div>
      <PanelSplitLine />
      <PanelLargeButton
        title="应用全部"
        aspectRatio={false}
        icon={<FullSelection theme="outline" size="18" fill="#333" />}
        onClick={handleApplyToAll}
      />
    </div>
  );
};

export const Toggle: FC = observer(ToggleComponent);
