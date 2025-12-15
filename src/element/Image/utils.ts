import { downloadImage } from "@/utils";

/**
 * 下载图片
 * @param src - 图片地址（支持 base64、data URL 或普通 URL）
 * @param id - 元素ID（用于生成默认文件名）
 */
export async function downloadImageFile(
  src: string,
  id: string
): Promise<void> {
  if (!src) {
    return;
  }

  try {
    // 判断是否为 base64 或 data URL
    const isDataUrl = src.startsWith("data:");

    if (isDataUrl) {
      // 直接下载 base64 图片
      const filename = `${id}.png`;
      downloadImage(src, filename);
    } else {
      // 对于 URL，使用 canvas 方式下载（可以处理跨域图片）
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";

      const dataUrl = await new Promise<string>((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("无法创建 canvas 上下文"));
              return;
            }
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");
            resolve(dataUrl);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          // 如果跨域失败，尝试使用 fetch
          fetch(src)
            .then((response) => {
              if (!response.ok) {
                throw new Error("图片下载失败");
              }
              return response.blob();
            })
            .then((blob) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve(reader.result as string);
              };
              reader.onerror = () => {
                reject(new Error("图片读取失败"));
              };
              reader.readAsDataURL(blob);
            })
            .catch(reject);
        };

        img.src = src;
      });

      // 从 URL 中提取文件名，如果没有则使用默认名称
      let filename = `image_${id}.png`;
      try {
        const urlPath = new URL(src).pathname;
        const urlFilename = urlPath.split("/").pop();
        if (urlFilename && urlFilename.includes(".")) {
          filename = urlFilename;
        }
      } catch {
        // URL 解析失败，使用默认文件名
      }

      downloadImage(dataUrl, filename);
    }
  } catch (error) {
    console.error("下载图片失败:", error);
  }
}
