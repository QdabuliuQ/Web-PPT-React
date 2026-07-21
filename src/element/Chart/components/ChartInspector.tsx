import { useChartInspectorStore } from "@/store/zustand/chartInspectorStore";
import { useElementActiveStore } from "@/store";
import { Close } from "@icon-park/react";
import { useEffect, useRef, type FC } from "react";
import styles from "./panel.module.less";

export const ChartInspector: FC = () => {
  const sectionKey = useChartInspectorStore((state) => state.sectionKey);
  const title = useChartInspectorStore((state) => state.title);
  const close = useChartInspectorStore((state) => state.close);
  const setContentEl = useChartInspectorStore((state) => state.setContentEl);
  const elementActive = useElementActiveStore((state) => state.elementActive);
  const prevElementRef = useRef(elementActive);

  // 切换或取消选中元素时关闭右侧面板
  useEffect(() => {
    if (prevElementRef.current !== elementActive) {
      close();
      prevElementRef.current = elementActive;
    }
  }, [elementActive, close]);

  if (!sectionKey) return null;

  return (
    <aside className={styles.inspector} aria-label={title || "图表属性"}>
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
      <div
        ref={setContentEl}
        className={styles.inspectorBody}
      />
    </aside>
  );
};
