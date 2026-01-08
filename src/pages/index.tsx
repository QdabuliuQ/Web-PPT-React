import { GlobalContextMenu } from "@/components/GlobalContextMenu";
import { useDisplayStatusStore, useFullscreenStore } from "@/store";
import { Canvas } from "./Canvas";
import { Footer } from "./Footer";
import { Grid } from "./Grid";
import { Header } from "./Header";
import { Menu } from "./Menu";
import { Preview } from "./Preview";
import { Slideshow } from "./Slideshow";
import styles from "./index.module.less";

export default function Index() {
  // 使用 Zustand hooks 订阅状态变化，确保组件能够响应状态更新
  const displayStatus = useDisplayStatusStore((state) => state.displayStatus);
  const isFullscreen = useFullscreenStore((state) => state.isFullscreen);

  return (
    <div className="max-w-[100vw] max-h-[100vh] w-[100vw] h-[100vh] bg-[#eee] flex flex-col overflow-hidden">
      {/* 全屏幻灯片模式 - 独立渲染层 */}
      {isFullscreen && <Slideshow />}

      {/* 正常编辑模式 */}
      {!isFullscreen && (
        <>
          <GlobalContextMenu />
          <Header />
          <Menu />
          {displayStatus === "default" && (
            <div
              id="main-container"
              className={`${styles.mainContainerClass} flex w-[calc(100%-20px)] ml-[20px]`}
            >
              <Preview />
              <Canvas />
            </div>
          )}
          {displayStatus === "grid" && <Grid />}
          <Footer />
        </>
      )}
    </div>
  );
}
