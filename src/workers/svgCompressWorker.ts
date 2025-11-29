// Web Worker 用于压缩 SVG 字符串
// 使用 SVGO 压缩 SVG
import { optimize } from "svgo";

self.onmessage = async (e: MessageEvent) => {
  const { type, svgString } = e.data;

  if (type === "compressSVG") {
    try {
      const result = optimize(svgString, {
        plugins: [
          // 只使用最安全的压缩插件
          "removeDoctype",
          "removeComments",
          "removeMetadata",
          "removeEditorsNSData",
          "removeTitle",
          "removeDesc",
          "removeEmptyText",
          // 禁用可能有问题的插件：
          // - removeEmptyContainers (可能移除包含内容的容器)
          // - removeHiddenElems (可能移除实际可见的元素)
          // - removeUnknownsAndDefaults (可能移除 X6 需要的属性)
          // - removeUselessDefs (可能移除实际使用的定义)
          // - removeNonInheritableGroupAttrs (可能影响分组)
          // - cleanupIds (可能影响引用)
          // - sortAttrs (可能影响属性顺序)
        ],
        multipass: false, // 禁用多次优化，避免过度压缩
      });

      const compressedSvgString = result.data;
      const originalSize = svgString.length;
      const compressedSize = compressedSvgString.length;
      const compressionRatio = (
        ((originalSize - compressedSize) / originalSize) *
        100
      ).toFixed(2);

      console.log(
        `SVG 压缩: ${originalSize} -> ${compressedSize} 字节 (减少 ${compressionRatio}%)`
      );

      self.postMessage({
        success: true,
        data: compressedSvgString,
      });
    } catch (error) {
      self.postMessage({
        success: false,
        error: error instanceof Error ? error.message : "SVG 压缩失败",
      });
    }
  }
};

export {};
