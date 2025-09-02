import { TextBold } from "@icon-park/react";
import { Button } from "antd";
import { type FC } from "react";
interface ITextPanelProps {
  title: string;
}

export const TextPanel: FC<ITextPanelProps> = () => {
  return (
    <div>
      <div className="">
        <Button
          type="text"
          icon={<TextBold theme="outline" size="15" fill="#333" />}
        />
      </div>
    </div>
  );
};

export const TextPanelTitle = "文本工具";
export const TextPanelKey = "text";
