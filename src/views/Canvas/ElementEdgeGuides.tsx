import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import { useMemoizedFn } from "ahooks";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
} from "react";
import styles from "./ElementEdgeGuides.module.less";

type EdgeBox = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

type Props = {
  /** 当前页元素 id 列表 */
  elementIds: string[];
  /** 平移等场景下关闭探测 */
  enabled?: boolean;
};

function findElementAtPoint(
  clientX: number,
  clientY: number,
  idSet: Set<string>,
  container: HTMLElement
): HTMLElement | null {
  const stack = document.elementsFromPoint(clientX, clientY);
  for (const node of stack) {
    if (!(node instanceof HTMLElement)) continue;
    if (node === container || node.id === "canvas-container") continue;

    if (node.id && idSet.has(node.id)) {
      return node;
    }

    let parent = node.parentElement;
    while (parent && parent !== container) {
      if (parent.id && idSet.has(parent.id)) {
        return parent;
      }
      parent = parent.parentElement;
    }
  }
  return null;
}

function toContainerLocalBox(
  el: HTMLElement,
  container: HTMLElement
): EdgeBox {
  const elRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const scaleX = containerRect.width / container.offsetWidth || 1;
  const scaleY = containerRect.height / container.offsetHeight || 1;

  return {
    id: el.id,
    left: (elRect.left - containerRect.left) / scaleX,
    top: (elRect.top - containerRect.top) / scaleY,
    width: elRect.width / scaleX,
    height: elRect.height / scaleY,
  };
}

function isSameBox(a: EdgeBox | null, b: EdgeBox | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

/**
 * hover 元素时，在其上下左右边位置画贯穿整画布的参考线：
 * - 水平线：宽度 = 画布宽度
 * - 垂直线：高度 = 画布高度
 */
export const ElementEdgeGuides: FC<Props> = ({
  elementIds,
  enabled = true,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const idSetRef = useRef(new Set(elementIds));
  const boxRef = useRef<EdgeBox | null>(null);
  const rafRef = useRef<number | null>(null);
  const [box, setBox] = useState<EdgeBox | null>(null);

  idSetRef.current = new Set(elementIds);

  const commitBox = useMemoizedFn((next: EdgeBox | null) => {
    if (isSameBox(boxRef.current, next)) return;
    boxRef.current = next;
    setBox(next);
  });

  const clearBox = useMemoizedFn(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    commitBox(null);
  });

  const handleMouseMove = useMemoizedFn((e: MouseEvent) => {
    const container = overlayRef.current?.parentElement;
    if (!container) return;

    const { clientX, clientY } = e;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const hit = findElementAtPoint(
        clientX,
        clientY,
        idSetRef.current,
        container
      );
      if (!hit) {
        commitBox(null);
        return;
      }
      commitBox(toContainerLocalBox(hit, container));
    });
  });

  useEffect(() => {
    const container = overlayRef.current?.parentElement;
    if (!container || !enabled) {
      clearBox();
      return;
    }

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", clearBox);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", clearBox);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled, handleMouseMove, clearBox]);

  if (!box) {
    return <div ref={overlayRef} className={styles.overlay} aria-hidden />;
  }

  const right = box.left + box.width;
  const bottom = box.top + box.height;
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;

  return (
    <div ref={overlayRef} className={styles.overlay} aria-hidden>
      <svg
        key={box.id}
        className={styles.svg}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      >
        {/* 上边：从元素中心向两侧展开 */}
        <line
          className={`${styles.line} ${styles.lineHorizontal}`}
          x1={0}
          y1={box.top}
          x2={CANVAS_WIDTH}
          y2={box.top}
          style={
            {
              "--origin-x": `${cx}px`,
              "--origin-y": `${box.top}px`,
              animationDelay: "0ms",
            } as CSSProperties
          }
        />
        {/* 下边 */}
        <line
          className={`${styles.line} ${styles.lineHorizontal}`}
          x1={0}
          y1={bottom}
          x2={CANVAS_WIDTH}
          y2={bottom}
          style={
            {
              "--origin-x": `${cx}px`,
              "--origin-y": `${bottom}px`,
              animationDelay: "40ms",
            } as CSSProperties
          }
        />
        {/* 左边：从元素中心向上下展开 */}
        <line
          className={`${styles.line} ${styles.lineVertical}`}
          x1={box.left}
          y1={0}
          x2={box.left}
          y2={CANVAS_HEIGHT}
          style={
            {
              "--origin-x": `${box.left}px`,
              "--origin-y": `${cy}px`,
              animationDelay: "80ms",
            } as CSSProperties
          }
        />
        {/* 右边 */}
        <line
          className={`${styles.line} ${styles.lineVertical}`}
          x1={right}
          y1={0}
          x2={right}
          y2={CANVAS_HEIGHT}
          style={
            {
              "--origin-x": `${right}px`,
              "--origin-y": `${cy}px`,
              animationDelay: "120ms",
            } as CSSProperties
          }
        />
      </svg>
    </div>
  );
};
