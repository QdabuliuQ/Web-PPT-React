import {
  displayStatusStore,
  fullscreenStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import { Column, PlayOne, ViewGridCard } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { message, Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { type FC } from "react";

const FooterComponent: FC = () => {
  const pages = pptStore.getPages();
  const pageIndex = pageActiveStore.getPageIndex(pages);
  const displayStatus = displayStatusStore.getDisplayStatus();

  // 处理播放按钮点击
  const handlePlay = useMemoizedFn(() => {
    // 获取当前页面 ID
    const currentPageId = pageActiveStore.getPageActive();
    if (!currentPageId) {
      message.error("未找到当前页面");
      return;
    }

    // 进入全屏模式，从当前页面开始播放
    fullscreenStore.enterFullscreen(currentPageId);
  });

  return (
    <div className="mx-[20px] h-[30px] flex items-center justify-between box-border border-t border-[#ccc] text-[12px]">
      <div className="text-[#9b9b9b]">
        <span className="mr-[10px]">幻灯片</span>
        {pageIndex + 1} / {pages.length}
      </div>
      <div className="flex items-center gap-[15px]">
        <Tooltip title="播放">
          <div
            className="w-[25px] h-[18px] flex items-center justify-center bg-primary rounded-[4px] cursor-pointer hover:bg-primary/80"
            onClick={handlePlay}
          >
            <PlayOne theme="filled" size="13" fill="#dddddd" />
          </div>
        </Tooltip>
        <Tooltip title="普通视图">
          <span
            className="cursor-pointer"
            onClick={() => displayStatusStore.setDisplayStatus("default")}
          >
            <Column
              theme="outline"
              size="15"
              fill={displayStatus === "default" ? "#f25f00" : "#333"}
            />
          </span>
        </Tooltip>
        <Tooltip title="幻灯片预览">
          <span
            className="cursor-pointer"
            onClick={() => displayStatusStore.setDisplayStatus("grid")}
          >
            <ViewGridCard
              theme="outline"
              size="15"
              fill={displayStatus === "grid" ? "#f25f00" : "#333"}
            />
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export const Footer: FC = observer(FooterComponent);
