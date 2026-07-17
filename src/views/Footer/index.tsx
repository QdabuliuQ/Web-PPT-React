import {
  useCanvasZoomStore,
  useDisplayStatusStore,
  useFullscreenStore,
  usePageActiveStore,
  usePPTStore,
  useRemarkEditActiveStore,
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
import { Dropdown, message, Slider, Tooltip } from "antd";
import { useMemo, type FC } from "react";
import styles from "./index.module.less";

const FooterComponent: FC = () => {
  const pages = usePPTStore((state) => state.pages);
  const pageActive = usePageActiveStore((state) => state.pageActive);
  const displayStatus = useDisplayStatusStore((state) => state.displayStatus);
  const setDisplayStatus = useDisplayStatusStore(
    (state) => state.setDisplayStatus
  );
  const remarkEditActive = useRemarkEditActiveStore(
    (state) => state.remarkEditActive
  );
  const toggleRemarkEditActive = useRemarkEditActiveStore(
    (state) => state.toggleRemarkEditActive
  );
  const enterFullscreen = useFullscreenStore((state) => state.enterFullscreen);
  const zoomPercent = useCanvasZoomStore((state) => state.zoomPercent);
  const setZoomPercent = useCanvasZoomStore((state) => state.setZoomPercent);

  const pageIndex = pages.findIndex((p) => p.id === pageActive);

  const handleToggleRemark = useMemoizedFn(() => {
    toggleRemarkEditActive();
  });

  const handlePlay = useMemoizedFn(() => {
    if (!pageActive) {
      message.error("未找到当前页面");
      return;
    }
    enterFullscreen(pageActive);
  });

  const handlePlayFromFirst = useMemoizedFn(() => {
    if (pages.length === 0) {
      message.error("没有可播放的页面");
      return;
    }
    const firstPageId = pages[0].id;
    enterFullscreen(firstPageId);
  });

  const handlePlayFromCurrent = useMemoizedFn(() => {
    if (!pageActive) {
      message.error("未找到当前页面");
      return;
    }
    enterFullscreen(pageActive);
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
    <div className={styles.footer}>
      <div className={styles.left}>
        <div className={styles.slideCount}>
          幻灯片 {Math.max(pageIndex + 1, 1)} / {pages.length || 1}
        </div>
        {displayStatus === "default" && (
          <div className={styles.zoomControl}>
            <Slider
              className={styles.zoomSlider}
              min={10}
              max={200}
              step={1}
              value={zoomPercent}
              onChange={setZoomPercent}
              tooltip={{ formatter: (value) => `${value}%` }}
            />
            <span className={styles.zoomLabel}>{zoomPercent}%</span>
          </div>
        )}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.remarkBtn} ${remarkEditActive ? styles.remarkActive : ""}`}
          onClick={handleToggleRemark}
        >
          <Notes
            theme="outline"
            size="14"
            fill={remarkEditActive ? "#f25f00" : "#595959"}
          />
          <span>备注</span>
        </button>

        <div className={styles.divider} />

        <div className={styles.playGroup}>
          <button
            type="button"
            className={styles.playBtn}
            onClick={handlePlay}
          >
            <PlayOne theme="filled" size="14" fill="#fff" />
            <span>播放</span>
          </button>
          <Dropdown placement="topRight" menu={{ items: playDropDownMenu }}>
            <button
              type="button"
              className={styles.playCaret}
              aria-label="播放选项"
            >
              <Down theme="outline" size="12" fill="#fff" />
            </button>
          </Dropdown>
        </div>

        <div className={styles.divider} />

        <div className={styles.viewToggles}>
          <Tooltip title="普通视图">
            <button
              type="button"
              className={`${styles.viewBtn} ${displayStatus === "default" ? styles.viewActive : ""}`}
              onClick={() => setDisplayStatus("default")}
            >
              <Column
                theme="outline"
                size="15"
                fill={displayStatus === "default" ? "#f25f00" : "#595959"}
              />
            </button>
          </Tooltip>
          <Tooltip title="幻灯片预览">
            <button
              type="button"
              className={`${styles.viewBtn} ${displayStatus === "grid" ? styles.viewActive : ""}`}
              onClick={() => setDisplayStatus("grid")}
            >
              <ViewGridCard
                theme="outline"
                size="15"
                fill={displayStatus === "grid" ? "#f25f00" : "#595959"}
              />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export const Footer: FC = FooterComponent;
