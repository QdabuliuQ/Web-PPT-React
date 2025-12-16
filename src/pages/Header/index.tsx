import { ChartPanelKey, ChartPanelTitle } from "@/element/Chart";
import { IconPanelKey, IconPanelTitle } from "@/element/Icon";
import { ImagePanelKey, ImagePanelTitle } from "@/element/Image";
import { MindMapPanelKey, MindMapPanelTitle } from "@/element/MindMap";
import { TablePanelKey, TablePanelTitle } from "@/element/Table";
import { TextPanelKey, TextPanelTitle } from "@/element/Text";
import {
  elementActiveStore,
  menuActiveStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import { exportPageAsImage } from "@/utils/tool";
import { LoadingOutlined } from "@ant-design/icons";
import { FileJpg, FilePdf, FileSettings } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Button, Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import styles from "./index.module.less";

const MenuMapped = {
  text: {
    key: TextPanelKey,
    title: TextPanelTitle,
  },
  table: {
    key: TablePanelKey,
    title: TablePanelTitle,
  },
  icon: {
    key: IconPanelKey,
    title: IconPanelTitle,
  },
  image: {
    key: ImagePanelKey,
    title: ImagePanelTitle,
  },
  mindmap: {
    key: MindMapPanelKey,
    title: MindMapPanelTitle,
  },
  chart: {
    key: ChartPanelKey,
    title: ChartPanelTitle,
  },
};

export const Header: FC = observer(() => {
  const menuItems = useMemo(
    () => [
      {
        label: "开始",
        key: "start",
      },
      {
        label: "插入",
        key: "insert",
      },
      {
        label: "切换",
        key: "toggle",
      },
      {
        label: "放映",
        key: "play",
      },
      {
        label: "视图",
        key: "view",
      },
    ],
    []
  );

  const pageActive = pageActiveStore.getPageActive();
  const elementActive = elementActiveStore.getElementActive();

  const [elementPanel, setElementPanel] = useState<{
    key: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (pageActive && elementActive) {
      // 重新获取元素信息，确保获取到最新的数据
      const element = pptStore.getElementInfo(pageActive, elementActive);

      if (element) {
        // 检查元素类型是否在 MenuMapped 中
        const elementType = element.type as keyof typeof MenuMapped;
        if (MenuMapped[elementType]) {
          const panel = MenuMapped[elementType];
          setElementPanel(panel);
          // 直接切换 panel，确保元素已经选中
          menuActiveStore.setActiveMenu(panel.key);
          return;
        }
      }
    }

    // 没有选中元素时，切换回开始页面
    setElementPanel(null);
    const menuActive = menuActiveStore.getMenuActive();
    if (
      menuActive !== "start" &&
      menuActive !== "insert" &&
      menuActive !== "toggle" &&
      menuActive !== "view"
    ) {
      menuActiveStore.setActiveMenu("start");
    }
  }, [elementActive, pageActive]);

  const otherPanelClick = useMemoizedFn(() => {
    menuActiveStore.setActiveMenu(elementPanel?.key || "");
  });

  const name = pptStore.getName();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // 导出配置文件
  const handleExportConfig = useMemoizedFn(async () => {
    if (exportLoading) return;

    setExportLoading(true);
    try {
      // 获取数据
      const configData = {
        name: pptStore.getName(),
        pages: pptStore.getPages(),
      };

      // 转换为 JSON 字符串
      const jsonString = JSON.stringify(configData, null, 2);

      // 创建 Blob 对象
      const blob = new Blob([jsonString], { type: "application/json" });

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name || "未命名"}.json`;

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("导出配置文件失败:", error);
    } finally {
      setTimeout(() => {
        setExportLoading(false);
      }, 200);
    }
  });

  // 导出PDF
  const handleExportPdf = useMemoizedFn(async () => {
    if (pdfLoading) return;

    setPdfLoading(true);
    try {
      // 动态导入jsPDF
      const { default: jsPDF } = await import("jspdf");
      const pages = pptStore
        .getPages()
        .filter((page) => page.visible !== false);

      if (pages.length === 0) {
        console.warn("没有可导出的页面");
        return;
      }

      const name = pptStore.getName();

      // 创建PDF实例 (横向，1000x700)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1000, 700],
      });

      // PDF页面尺寸
      const pdfWidth = 1000;
      const pdfHeight = 700;

      // 遍历每个页面，使用exportPageAsImage导出图片并添加到PDF
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // 使用exportPageAsImage导出页面为图片
        const imgData = await exportPageAsImage(page.id);

        if (!imgData) {
          console.warn(`页面 ${page.id} 导出失败，跳过`);
          continue;
        }

        // 如果不是第一页，添加新页面
        if (i > 0) {
          pdf.addPage();
        }

        // 添加图片到PDF
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }

      // 保存PDF
      pdf.save(`${name || "未命名"}.pdf`);
    } catch (error) {
      console.error("导出PDF失败:", error);
    } finally {
      setTimeout(() => {
        setPdfLoading(false);
      }, 200);
    }
  });

  // 导出所有画布为长图
  const handleExportLongImage = useMemoizedFn(async () => {
    if (imageLoading) return;

    setImageLoading(true);
    try {
      const pages = pptStore
        .getPages()
        .filter((page) => page.visible !== false);

      if (pages.length === 0) {
        console.warn("没有可导出的页面");
        return;
      }

      const CANVAS_WIDTH = 1000;
      const CANVAS_HEIGHT = 700;
      const SPACER_HEIGHT = 50; // 黑色间隔的高度

      // 导出所有页面的图片
      const imageDataUrls: string[] = [];
      for (const page of pages) {
        const dataUrl = await exportPageAsImage(page.id);
        if (dataUrl) {
          imageDataUrls.push(dataUrl);
        } else {
          console.warn(`页面 ${page.id} 导出失败，跳过`);
        }
      }

      if (imageDataUrls.length === 0) {
        console.warn("没有成功导出的页面");
        return;
      }

      // 加载所有图片
      const images = await Promise.all(
        imageDataUrls.map(
          (dataUrl) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = dataUrl;
            })
        )
      );

      // 计算总高度：所有画布高度 + 间隔高度（画布数量 - 1）
      const totalHeight =
        CANVAS_HEIGHT * images.length + SPACER_HEIGHT * (images.length - 1);

      // 创建大的 Canvas 用于拼接
      const canvas = document.createElement("canvas");
      canvas.width = CANVAS_WIDTH;
      canvas.height = totalHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("无法创建 Canvas 上下文");
      }

      // 填充黑色背景
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CANVAS_WIDTH, totalHeight);

      // 绘制所有图片和间隔
      let currentY = 0;
      for (let i = 0; i < images.length; i++) {
        const img = images[i];

        // 绘制图片
        ctx.drawImage(img, 0, currentY, CANVAS_WIDTH, CANVAS_HEIGHT);
        currentY += CANVAS_HEIGHT;

        // 如果不是最后一张，添加黑色间隔
        if (i < images.length - 1) {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, currentY, CANVAS_WIDTH, SPACER_HEIGHT);
          currentY += SPACER_HEIGHT;
        }
      }

      // 转换为图片并下载
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${name || "未命名"}_长图.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("导出长图失败:", error);
    } finally {
      setTimeout(() => {
        setImageLoading(false);
      }, 200);
    }
  });

  return (
    <div className="px-[20px] pt-[10px] pb-[12px] flex items-center justify-between">
      <div className="flex gap-[10px] flex-2">
        <div className="text-[12px] text-gray-600 flex items-center relative min-h-[20px]">
          {/* 文本显示 */}
          <span
            className={`cursor-text transition-opacity duration-200 ease-in-out ml-[5px] inline-block max-w-[150px] truncate ${
              !isEdit
                ? "opacity-100 relative pointer-events-auto"
                : "opacity-0 absolute pointer-events-none"
            }`}
            title={name || "未命名"}
            onClick={() => {
              setIsEdit(true);
              requestAnimationFrame(() => {
                inputRef.current?.focus();
              });
            }}
          >
            {name || "未命名"}
          </span>
          {/* 输入框 */}
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => pptStore.setName(e.target.value)}
            onBlur={() => {
              setIsEdit(false);
            }}
            maxLength={50}
            style={{
              opacity: isEdit ? 1 : 0,
              position: !isEdit ? "absolute" : "relative",
              pointerEvents: !isEdit ? "none" : "auto",
              transition: "opacity 0.2s ease-in-out",
            }}
          />
        </div>
        <Tooltip placement="bottomLeft" title="导出配置文件">
          <Button
            size="small"
            type="text"
            icon={
              exportLoading ? (
                <LoadingOutlined spin style={{ color: "#f25f00" }} />
              ) : (
                <FileSettings theme="outline" size="17" fill="#5e5e5e" />
              )
            }
            disabled={exportLoading}
            onClick={handleExportConfig}
          />
        </Tooltip>
        <Tooltip placement="bottom" title="导出PDF">
          <Button
            size="small"
            type="text"
            icon={
              pdfLoading ? (
                <LoadingOutlined spin style={{ color: "#f25f00" }} />
              ) : (
                <FilePdf theme="outline" size="17" fill="#5e5e5e" />
              )
            }
            disabled={pdfLoading}
            onClick={handleExportPdf}
          />
        </Tooltip>
        <Tooltip placement="bottom" title="导出长图">
          <Button
            size="small"
            type="text"
            icon={
              imageLoading ? (
                <LoadingOutlined spin style={{ color: "#f25f00" }} />
              ) : (
                <FileJpg theme="outline" size="17" fill="#5e5e5e" />
              )
            }
            disabled={imageLoading}
            onClick={handleExportLongImage}
          />
        </Tooltip>
      </div>
      <div className="flex items-center gap-[30px] flex-6">
        {menuItems.map((item) => (
          <div
            className={`text-[13px] cursor-pointer transition-colors duration-200 ease-in-out ${
              menuActiveStore.isActive(item.key)
                ? `text-[var(--primary-color)] font-bold ${styles.activeItem}`
                : "text-gray-600 hover:text-[var(--primary-color)]"
            }`}
            key={item.key}
            onClick={() => menuActiveStore.setActiveMenu(item.key)}
          >
            {item.label}
          </div>
        ))}
        {elementActive && (
          <div
            className={`text-[13px] cursor-pointer transition-colors duration-200 ease-in-out ${
              menuActiveStore.isActive("animation")
                ? `text-[var(--primary-color)] font-bold ${styles.activeItem}`
                : "text-gray-600 hover:text-[var(--primary-color)]"
            }`}
            onClick={() => menuActiveStore.setActiveMenu("animation")}
          >
            动画
          </div>
        )}
        {elementPanel && (
          <div
            className={`text-[13px] cursor-pointer transition-colors duration-200 ease-in-out ${
              menuActiveStore.isActive(elementPanel.key)
                ? `text-[var(--primary-color)] font-bold ${styles.activeItem}`
                : "text-gray-600 hover:text-[var(--primary-color)]"
            }`}
            onClick={otherPanelClick}
          >
            {elementPanel.title}
          </div>
        )}
      </div>
      <div className="flex-2">12</div>
    </div>
  );
});
