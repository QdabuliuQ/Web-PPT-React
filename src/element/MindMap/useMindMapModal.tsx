import { pageActiveStore, pptStore } from "@/store";
import { Graph } from "@antv/x6";
import { useMemoizedFn } from "ahooks";
import { useMemo, useState } from "react";
import type { IMindMapProps } from "./index";
import type { MindMapModalProps } from "./MindMapModal";
import type { X6GraphData } from "./utils";

interface UseMindMapModalProps {
  pageId: string;
  elementId: string;
  readonly?: boolean;
}

interface UseMindMapModalReturn {
  modalOpen: boolean;
  handleModalOpen: () => void;
  handleModalClose: () => void;
  handleDataChange: (updatedData: X6GraphData) => void;
  handlePreviewImageChange: (imageData: string) => void;
  handleBackgroundColorChange: (color: string) => void;
  exportGraphToSVG: (
    graph: Graph,
    viewBox: { x: number; y: number; width: number; height: number },
    backgroundColor?: string
  ) => Promise<string>;
  backgroundColor: string;
  data?: X6GraphData;
  // 返回可以直接传递给 MindMapModal 的 props
  modalProps: Omit<MindMapModalProps, "open" | "onClose"> & {
    open: boolean;
    onClose: () => void;
  };
}

/**
 * 管理 MindMapModal 的 hook
 * 封装了 modal 的打开/关闭、数据变更处理等逻辑
 */
export function useMindMapModal({
  pageId,
  elementId,
  readonly = false,
}: UseMindMapModalProps): UseMindMapModalReturn {
  const [modalOpen, setModalOpen] = useState(false);

  // 获取当前元素信息
  const currentElement = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IMindMapProps | null;

  const data = currentElement?.data;
  const backgroundColor =
    (currentElement as any)?.mindMapBackgroundColor || "#F2F7FA";

  // Modal 打开处理
  const handleModalOpen = useMemoizedFn(() => {
    setModalOpen(true);
  });

  // Modal 关闭处理
  const handleModalClose = useMemoizedFn(() => {
    setModalOpen(false);
  });

  // 处理数据变更
  const handleDataChange = useMemoizedFn((updatedData: X6GraphData) => {
    if (pageId && elementId) {
      const currentElement = pptStore.getElementInfo(pageId, elementId);
      if (currentElement) {
        pptStore.setElementInfo(pageId, elementId, {
          ...currentElement,
          data: updatedData,
        } as any);
      }
    }
  });

  // 处理预览图片变更
  const handlePreviewImageChange = useMemoizedFn((imageData: string) => {
    if (pageId && elementId) {
      const updatedElement = pptStore.getElementInfo(pageId, elementId);
      if (updatedElement) {
        pptStore.setElementInfo(pageId, elementId, {
          ...updatedElement,
          previewImage: imageData,
        } as any);
      }
    }
  });

  // 处理背景色变更
  const handleBackgroundColorChange = useMemoizedFn((color: string) => {
    if (pageId && elementId) {
      const updatedElement = pptStore.getElementInfo(pageId, elementId);
      if (updatedElement) {
        pptStore.setElementInfo(pageId, elementId, {
          ...updatedElement,
          mindMapBackgroundColor: color,
        } as any);
      }
    }
  });

  // 导出 SVG 的函数
  const exportGraphToSVG = useMemoizedFn(
    async (
      graph: Graph,
      viewBox: { x: number; y: number; width: number; height: number },
      backgroundColor?: string
    ) => {
      return new Promise<string>((resolve) => {
        graph.toSVG(
          (svgString) => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
            const svgElement = svgDoc.documentElement;

            // 隐藏所有连接点
            const ports = svgElement.querySelectorAll(".x6-port, [data-port]");
            ports.forEach((port) => {
              const element = port as SVGElement;
              element.style.display = "none";
            });

            // 如果有背景色，添加背景矩形
            if (backgroundColor) {
              const rect = svgDoc.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
              );
              rect.setAttribute("x", String(viewBox.x));
              rect.setAttribute("y", String(viewBox.y));
              rect.setAttribute("width", String(viewBox.width));
              rect.setAttribute("height", String(viewBox.height));
              rect.setAttribute("fill", backgroundColor);
              // 将背景矩形插入到最前面
              if (svgElement.firstChild) {
                svgElement.insertBefore(rect, svgElement.firstChild);
              } else {
                svgElement.appendChild(rect);
              }
            }

            // 将修改后的 SVG 转换为字符串
            const serializer = new XMLSerializer();
            const modifiedSvgString = serializer.serializeToString(svgElement);
            resolve(modifiedSvgString);
          },
          {
            copyStyles: true,
            preserveDimensions: true,
            viewBox: viewBox,
          }
        );
      });
    }
  );

  // 返回可以直接传递给 MindMapModal 的 props
  const modalProps = useMemo(
    () => ({
      open: modalOpen,
      onClose: handleModalClose,
      data,
      readonly,
      onDataChange: handleDataChange,
      onPreviewImageChange: handlePreviewImageChange,
      onBackgroundColorChange: handleBackgroundColorChange,
      exportGraphToSVG,
      initialBackgroundColor: backgroundColor,
    }),
    [
      modalOpen,
      handleModalClose,
      data,
      readonly,
      handleDataChange,
      handlePreviewImageChange,
      handleBackgroundColorChange,
      exportGraphToSVG,
      backgroundColor,
    ]
  );

  return {
    modalOpen,
    handleModalOpen,
    handleModalClose,
    handleDataChange,
    handlePreviewImageChange,
    handleBackgroundColorChange,
    exportGraphToSVG,
    backgroundColor,
    data,
    modalProps,
  };
}

