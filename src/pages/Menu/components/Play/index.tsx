import { PanelLargeButton, PanelSplitLine } from "@/components";
import {
  useFullscreenStore,
  usePageActiveStore,
  usePPTStore,
  useRemarkEditActiveStore,
} from "@/store";
import {
  Notes,
  Play as PlayIcon,
  PreviewCloseOne,
  PreviewOpen,
  SlideTwo,
} from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { message } from "antd";
import { type FC } from "react";

export const PlayComponent: FC = () => {
  // 使用 Zustand hooks 订阅状态变化
  const pages = usePPTStore((state) => state.pages);
  const pageActive = usePageActiveStore((state) => state.pageActive);
  const getActivePage = usePPTStore((state) => state.getActivePage);
  const togglePageVisible = usePPTStore((state) => state.togglePageVisible);
  const remarkEditActive = useRemarkEditActiveStore(
    (state) => state.remarkEditActive
  );
  const toggleRemarkEditActive = useRemarkEditActiveStore(
    (state) => state.toggleRemarkEditActive
  );
  const enterFullscreen = useFullscreenStore((state) => state.enterFullscreen);

  const handleStartPlay = useMemoizedFn(() => {
    if (pages.length === 0) {
      message.error("没有可播放的页面");
      return;
    }
    enterFullscreen(pages[0].id);
  });

  const handleCurrentPlay = useMemoizedFn(() => {
    // 获取当前页面 ID
    if (!pageActive) {
      message.error("未找到当前页面");
      return;
    }
    enterFullscreen(pageActive);
  });

  const page = pageActive ? getActivePage(pageActive) : null;

  const handleTogglePageVisible = useMemoizedFn(() => {
    if (!page) return;
    togglePageVisible(page.id);
  });

  const handleToggleRemark = useMemoizedFn(() => {
    toggleRemarkEditActive();
  });

  return (
    <div className="h-[53px] flex items-center gap-[10px]">
      <PanelLargeButton
        title="从头开始"
        aspectRatio={false}
        icon={<SlideTwo theme="outline" size="18" fill="#333" />}
        onClick={handleStartPlay}
      />
      <PanelLargeButton
        title="当前开始"
        aspectRatio={false}
        icon={<PlayIcon theme="outline" size="18" fill="#333" />}
        onClick={handleCurrentPlay}
      />
      <PanelSplitLine />
      <PanelLargeButton
        title={(page?.visible ? "隐藏" : "显示") + "幻灯片"}
        aspectRatio={false}
        icon={
          page?.visible ? (
            <PreviewCloseOne theme="outline" size="18" fill="#333" />
          ) : (
            <PreviewOpen theme="outline" size="18" fill="#333" />
          )
        }
        onClick={handleTogglePageVisible}
      />
      <PanelLargeButton
        title={remarkEditActive ? "关闭备注" : "开启备注"}
        aspectRatio={false}
        icon={<Notes theme="outline" size="18" fill="#333" />}
        onClick={handleToggleRemark}
      />
    </div>
  );
};

export const Play: FC = PlayComponent;
