import {
  displayStatusStore,
  fullscreenStore,
  pageActiveStore,
  pptStore,
  remarkEditActiveStore,
} from "@/store";
import {
  Column,
  Down,
  Notes,
  Play,
  PlayOne,
  SlideTwo,
  ViewGridCard,
} from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Button, Dropdown, message, Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";

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

  // 从开头开始播放
  const handlePlayFromFirst = useMemoizedFn(() => {
    if (pages.length === 0) {
      message.error("没有可播放的页面");
      return;
    }
    const firstPageId = pages[0].id;
    fullscreenStore.enterFullscreen(firstPageId);
  });

  // 从当前页面开始播放
  const handlePlayFromCurrent = useMemoizedFn(() => {
    const currentPageId = pageActiveStore.getPageActive();
    if (!currentPageId) {
      message.error("未找到当前页面");
      return;
    }
    fullscreenStore.enterFullscreen(currentPageId);
  });

  const playDropDownMenu = useMemo(
    () => [
      {
        key: "playFirst",
        label: "从开头开始",
        icon: <SlideTwo theme="outline" size="15" fill="#333" />,
        onClick: handlePlayFromFirst,
      },
      {
        key: "playCurrent",
        label: "从当前开始",
        icon: <Play theme="outline" size="15" fill="#333" />,
        onClick: handlePlayFromCurrent,
      },
    ],
    [handlePlayFromFirst, handlePlayFromCurrent]
  );

  return (
    <div className="mx-[20px] h-[30px] flex items-center justify-between box-border border-t border-[#e0e0e0] text-[12px]">
      <div className="text-[#9b9b9b]">
        <span className="mr-[10px]">幻灯片</span>
        {pageIndex + 1} / {pages.length}
      </div>
      <div className="flex items-center gap-[15px]">
        <Button
          size="small"
          type="text"
          style={{
            height: "22px",
            fontSize: "11px",
            background: remarkEditActiveStore.getRemarkEditActive()
              ? "#ddd"
              : "transparent",
          }}
          icon={<Notes theme="outline" size="11" fill="#333" />}
          onClick={() =>
            remarkEditActiveStore.setRemarkEditActive(
              !remarkEditActiveStore.getRemarkEditActive()
            )
          }
        >
          备注
        </Button>
        <div className="flex items-center gap-[4px]">
          <Tooltip title="播放">
            <div
              className="w-[25px] h-[18px] flex items-center justify-center bg-primary rounded-[4px] cursor-pointer hover:bg-primary/80"
              onClick={handlePlay}
            >
              <PlayOne theme="filled" size="13" fill="#dddddd" />
            </div>
          </Tooltip>
          <Dropdown placement="top" menu={{ items: playDropDownMenu }}>
            <Button
              size="small"
              type="text"
              style={{ width: "15px", height: "18px", padding: 0 }}
              icon={<Down theme="outline" size="10" fill="#333" />}
            ></Button>
          </Dropdown>
        </div>
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
