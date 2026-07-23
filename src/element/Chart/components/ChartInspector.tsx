import { useElementActiveStore, useMenuActiveStore } from "@/store";
import { useChartInspectorStore } from "@/store/zustand/chartInspectorStore";
import { Close } from "@icon-park/react";
import { useEffect, useRef, type FC } from "react";
import styles from "./panel.module.less";

const THEME_SECTION = "ppt-theme";

export const ChartInspector: FC = () => {
  const sectionKey = useChartInspectorStore((state) => state.sectionKey);
  const title = useChartInspectorStore((state) => state.title);
  const close = useChartInspectorStore((state) => state.close);
  const setContentEl = useChartInspectorStore((state) => state.setContentEl);
  const elementActive = useElementActiveStore((state) => state.elementActive);
  const menuActive = useMenuActiveStore((state) => state.menuActive);
  const prevElementRef = useRef(elementActive);

  // 选中元素变化时关闭右侧面板
  useEffect(() => {
    if (prevElementRef.current !== elementActive) {
      close();
      prevElementRef.current = elementActive;
    }
  }, [elementActive, close]);

  // 离开「开始」菜单时关闭主题色面板
  useEffect(() => {
    if (sectionKey === THEME_SECTION && menuActive !== "start") {
      close();
    }
  }, [menuActive, sectionKey, close]);

  if (!sectionKey) return null;

  return (
    <aside className={styles.inspector} aria-label={title || "属性面板"}>
      <header className={styles.inspectorHeader}>
        <span className={styles.inspectorTitle}>{title}</span>
        <button
          type="button"
          className={styles.inspectorClose}
          onClick={close}
          aria-label="关闭"
        >
          <Close theme="outline" size="14" fill="currentColor" />
        </button>
      </header>
      <div ref={setContentEl} className={styles.inspectorBody} />
    </aside>
  );
};
