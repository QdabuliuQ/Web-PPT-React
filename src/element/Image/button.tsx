import { PanelButton } from "@/components/PanelButton";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { InboxOutlined } from "@ant-design/icons";
import { Pic } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Input, Modal, Radio, Upload, message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import imageCompression from "browser-image-compression";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreateImage } from ".";

const { Dragger } = Upload;
const { LIST_IGNORE } = Upload;

type UploadMode = "url" | "upload";

export default function ImageButton() {
  const { t } = useTranslation();
  
  const uploadModeOptions = [
    { label: t('elements.image.uploadMode.url'), value: "url" },
    { label: t('elements.image.uploadMode.upload'), value: "upload" },
  ];
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
          reject(new Error(error || t('elements.image.errors.processFailed')));
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
      message.error(t('elements.image.errors.selectPage'));
      return;
    }

    if (loading) return;

    let src = "";

    if (uploadMode === "url") {
      // URL 模式，直接使用输入的 URL
      src = imageUrl.trim();
      if (!src) {
        message.error(t('elements.image.errors.enterUrl'));
        return;
      }
    } else {
      // 上传模式
      if (fileList.length === 0) {
        message.error(t('elements.image.errors.uploadImage'));
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
          message.error(t('elements.image.errors.processFailed'));
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
        message.error(t('elements.image.errors.uploadFailed'));
        return;
      }

      if (!src) {
        message.error(t('elements.image.errors.uploadFailed'));
        return;
      }
    }

    // 验证图片 URL 是否能正常加载并获取图片尺寸
    setLoading(true);
    const dimensions = await getImageDimensions(src);
    setLoading(false);

    if (!dimensions) {
      message.error(t('elements.image.errors.invalidUrl'));
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
    const ok = pptStore.addElementInfo(pageId, option);
    if (ok) {
      elementActiveStore.setElementActive(option.id);
    }

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
      message.error(t('elements.image.errors.onlyImage'));
      return LIST_IGNORE; // 阻止文件被添加到列表
    }
    const isLt3M = file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
      message.error(t('elements.image.errors.sizeLimit'));
      return LIST_IGNORE; // 阻止文件被添加到列表
    }
    // 返回 false 阻止自动上传，但允许文件被添加到列表
    // 预览图的创建在 handleUploadChange 中处理
    return false;
  });

  return (
    <>
      <PanelButton
        icon={<Pic theme="outline" size="24" fill="currentColor" />}
        title={t('elements.image.button')}
        onClick={handleClick}
      />
      <Modal
        title={t('elements.image.insertImage')}
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
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
                placeholder={t('elements.image.placeholder.url')}
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
                <p className="ant-upload-text">{t('elements.image.uploadHint.dragText')}</p>
                <p className="ant-upload-hint">
                  {t('elements.image.uploadHint.hint')}
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
