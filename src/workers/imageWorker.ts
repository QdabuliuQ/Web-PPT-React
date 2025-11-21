// Web Worker 用于处理图片转 base64
self.onmessage = async (e: MessageEvent) => {
  const { type, file } = e.data;

  if (type === "convertToBase64") {
    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          self.postMessage({
            success: true,
            data: result,
          });
        } else {
          self.postMessage({
            success: false,
            error: "文件读取失败",
          });
        }
      };

      reader.onerror = () => {
        self.postMessage({
          success: false,
          error: "文件读取失败",
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      self.postMessage({
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      });
    }
  }
};

export {};
