import { message } from "antd";
import * as echarts from "echarts";

/**
 * 导出 ECharts 图表为图片
 * @param elementId - 图表元素的 ID
 * @param filename - 文件名（不含扩展名），默认为 "chart"
 * @param format - 图片格式，默认为 "png"
 * @returns 是否导出成功
 */
export async function exportChartAsImage(
  elementId: string,
  filename: string = "chart",
  format: "png" | "jpeg" = "png"
): Promise<boolean> {
  try {
    const chartElement = document.getElementById(`dom_${elementId}`);
    if (!chartElement) {
      message.warning("未找到图表元素");
      return false;
    }

    const chartInstance = echarts.getInstanceByDom(chartElement);
    if (!chartInstance) {
      message.warning("未找到图表实例");
      return false;
    }

    const dataURL = chartInstance.getDataURL({
      type: format,
      pixelRatio: 2,
    });

    if (!dataURL || typeof dataURL !== "string") {
      message.error("生成图片数据失败");
      return false;
    }

    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    const img = new Image();

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = dataURL;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      message.error("无法创建 Canvas 上下文");
      return false;
    }

    if (format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas 转换 Blob 失败"));
          }
        },
        mimeType,
        1.0
      );
    });

    if (!blob || blob.size === 0) {
      message.error("生成的图片数据为空");
      return false;
    }

    const extension = format === "jpeg" ? "jpg" : format;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${Date.now()}.${extension}`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    message.success("图片导出成功");
    return true;
  } catch (error) {
    console.error("导出图表图片失败:", error);
    message.error("导出图表图片失败");
    return false;
  }
}
