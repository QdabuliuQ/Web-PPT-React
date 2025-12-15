import { PanelLargeButton, PanelSplitLine } from "@/components";
import {
  fullscreenStore,
  pageActiveStore,
  pptStore,
  remarkEditActiveStore,
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
import { observer } from "mobx-react-lite";
import { type FC } from "react";

export const PlayComponent: FC = () => {
  const handleStartPlay = useMemoizedFn(() => {
    const pages = pptStore.getPages();
    fullscreenStore.enterFullscreen(pages[0].id);
  });

  const handleCurrentPlay = useMemoizedFn(() => {
    // 获取当前页面 ID
    const currentPageId = pageActiveStore.getPageActive();
    if (!currentPageId) {
      message.error("未找到当前页面");
      return;
    }
    fullscreenStore.enterFullscreen(currentPageId);
  });

  const page = pptStore.getActivePage(
    pageActiveStore.getPageActive() as string
  );

  const handleTogglePageVisible = useMemoizedFn(() => {
    if (!page) return;
    pptStore.togglePageVisible(page.id);
  });

  const remarkEditActive = remarkEditActiveStore.getRemarkEditActive();

  const handleToggleRemark = useMemoizedFn(() => {
    remarkEditActiveStore.toggleRemarkEditActive();
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

export const Play: FC = observer(PlayComponent);
