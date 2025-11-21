import { PanelButton } from "@/components/PanelButton";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { InboxOutlined } from "@ant-design/icons";
import { Pic } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Input, Modal, Radio, Upload, message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import imageCompression from "browser-image-compression";
import { memo, useState } from "react";
import { CreateImage } from ".";

const { Dragger } = Upload;
const { LIST_IGNORE } = Upload;

type UploadMode = "url" | "upload";

const uploadModeOptions = [
  { label: "图片地址", value: "url" },
  { label: "上传图片", value: "upload" },
];

export default function ImageButton() {
  const [open, setOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>("url");
  const [imageUrl, setImageUrl] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  // 压缩图片
  const compressImage = useMemoizedFn(async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 3, // 最大 3MB（与上传限制一致）
      maxWidthOrHeight: 1920, // 最大宽度或高度
      useWebWorker: true, // 使用 Web Worker
      initialQuality: 0.9, // 初始质量
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch {
      return file;
    }
  });

  // 使用 Web Worker 将文件转为 base64
  const convertFileToBase64 = useMemoizedFn((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 创建 Worker
      const worker = new Worker(
        new URL("../../workers/imageWorker.ts", import.meta.url),
        { type: "module" }
      );

      worker.onmessage = (e: MessageEvent) => {
        const { success, data, error } = e.data;
        worker.terminate(); // 使用完后终止 Worker

        if (success) {
          resolve(data);
        } else {
          reject(new Error(error || "文件读取失败"));
        }
      };

      worker.onerror = (error) => {
        worker.terminate();
        reject(error);
      };

      // 发送文件到 Worker
      worker.postMessage({
        type: "convertToBase64",
        file: file,
      });
    });
  });

  // 验证图片 URL 是否能正常加载并获取图片尺寸
  const getImageDimensions = useMemoizedFn(
    (url: string): Promise<{ width: number; height: number } | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        // 设置超时时间（10秒）
        const timeout = setTimeout(() => {
          resolve(null);
        }, 10000);

        img.onload = () => {
          clearTimeout(timeout);
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        };
        img.onerror = () => {
          clearTimeout(timeout);
          resolve(null);
        };
        img.src = url;
      });
    }
  );

  const handleClick = useMemoizedFn(() => {
    setOpen(true);
  });

  const handleOk = useMemoizedFn(async () => {
    const pageId = pageActiveStore.getPageActive();
    if (!pageId) {
      message.error("请先选择一个页面");
      return;
    }

    if (loading) return;

    let src = "";

    if (uploadMode === "url") {
      // URL 模式，直接使用输入的 URL
      src = imageUrl.trim();
      if (!src) {
        message.error("请输入图片地址");
        return;
      }
    } else {
      // 上传模式
      if (fileList.length === 0) {
        message.error("请上传图片");
        return;
      }

      const file = fileList[0];

      // 本地上传的文件需要转为 base64
      if (file.originFileObj) {
        setLoading(true);
        try {
          // 1. 先压缩图片
          const compressedFile = await compressImage(file.originFileObj);

          // 2. 使用 Web Worker 读取压缩后的文件并转为 base64
          src = await convertFileToBase64(compressedFile);
        } catch {
          setLoading(false);
          message.error("图片处理失败，请重试");
          return;
        }
        setLoading(false);
      } else if (file.response) {
        // 如果服务器返回了 URL，使用服务器 URL（不需要转 base64）
        src = file.response.url || file.response.data?.url || "";
      } else if (file.thumbUrl) {
        // 如果没有原始文件对象但有预览 URL，使用预览 URL
        src = file.thumbUrl;
      } else {
        message.error("图片上传失败，请重试");
        return;
      }

      if (!src) {
        message.error("图片上传失败，请重试");
        return;
      }
    }

    // 验证图片 URL 是否能正常加载并获取图片尺寸
    setLoading(true);
    const dimensions = await getImageDimensions(src);
    setLoading(false);

    if (!dimensions) {
      message.error("图片地址无效或无法加载，请检查图片链接");
      return;
    }

    // 计算等比例的高度（宽度固定为 300px）
    const targetWidth = 300;
    const targetHeight = Math.round(
      (dimensions.height / dimensions.width) * targetWidth
    );

    const option = CreateImage({
      src,
      width: targetWidth,
      height: targetHeight,
    });
    pptStore.addElementInfo(pageId, option);
    elementActiveStore.setElementActive(option.id);

    // 重置状态并关闭弹窗
    setImageUrl("");
    setFileList([]);
    setUploadMode("url");
    setOpen(false);
  });

  const handleCancel = useMemoizedFn(() => {
    setImageUrl("");
    setFileList([]);
    setUploadMode("url");
    setOpen(false);
  });

  const handleUploadChange = useMemoizedFn((info: any) => {
    // 过滤掉被移除的文件和无效的文件
    const validFileList = info.fileList.filter(
      (file: UploadFile) => file.status !== "removed" && file.status !== "error"
    );

    // 只有当文件列表中有有效文件时才更新
    if (validFileList.length > 0) {
      // 如果文件还没有预览图，创建预览
      const file = validFileList[0];
      if (file.originFileObj && !file.thumbUrl) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          setFileList([
            {
              ...file,
              status: "done",
              thumbUrl: url,
            } as UploadFile,
          ]);
        };
        reader.readAsDataURL(file.originFileObj);
      } else {
        setFileList(validFileList);
      }
    } else {
      // 如果没有有效文件，清空列表
      setFileList([]);
    }
  });

  // 简单的图片上传处理（实际项目中需要配置上传接口）
  const beforeUpload = useMemoizedFn((file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("只能上传图片文件");
      return LIST_IGNORE; // 阻止文件被添加到列表
    }
    const isLt3M = file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
      message.error("图片大小不能超过 3MB");
      return LIST_IGNORE; // 阻止文件被添加到列表
    }
    // 返回 false 阻止自动上传，但允许文件被添加到列表
    // 预览图的创建在 handleUploadChange 中处理
    return false;
  });

  return (
    <>
      <PanelButton
        icon={<Pic theme="outline" size="24" fill="#333" />}
        title="图片"
        onClick={handleClick}
      />
      <Modal
        title="插入图片"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        width={500}
        centered
        confirmLoading={loading}
      >
        <div className="flex flex-col gap-[16px] py-[15px]">
          <Radio.Group
            block
            options={uploadModeOptions}
            value={uploadMode}
            onChange={(e) => setUploadMode(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className="mb-[8px]"
          />

          {uploadMode === "url" ? (
            <div>
              <Input
                placeholder="请输入图片 URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onPressEnter={handleOk}
              />
            </div>
          ) : (
            <div>
              <Dragger
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
                maxCount={1}
                accept="image/*"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                <p className="ant-upload-hint">
                  支持单个图片文件，大小不超过 3MB
                </p>
              </Dragger>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export const ImageButtonComponent = memo(ImageButton);
