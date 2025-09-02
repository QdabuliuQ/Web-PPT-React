import { ColorPanel } from "@/components";
import {
  Add,
  ColorCard,
  Reduce,
  Strikethrough,
  TextBold,
  TextItalic,
  TextUnderline,
} from "@icon-park/react";
import { Button, Popover, Select, Tooltip } from "antd";
import { type FC, useState } from "react";
interface ITextPanelProps {
  title: string;
}

const fontSize = Array.from({ length: (50 - 12) / 2 + 1 }, (_, i) => {
  const size = 12 + i * 2;
  return { label: size, value: size };
});
export const TextPanel: FC<ITextPanelProps> = () => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    // 这里可以添加实际的颜色应用逻辑
    console.log("选择的颜色:", color);
  };

  return (
    <div className="h-full">
      <div className="h-full flex flex-col justify-between">
        <div className="flex gap-[6px]">
          <Select style={{ width: 100 }} size="small" options={fontSize} />
          <Tooltip title="增大字号">
            <Button
              size="small"
              type="text"
              icon={<Add theme="outline" size="13" fill="#333" />}
            />
          </Tooltip>
          <Tooltip title="减小字号">
            <Button
              size="small"
              type="text"
              icon={<Reduce theme="outline" size="13" fill="#333" />}
            />
          </Tooltip>
        </div>
        <div className="flex gap-[5px]">
          <Tooltip title="加粗" placement="bottom">
            <Button
              size="small"
              type="text"
              icon={<TextBold theme="outline" size="13" fill="#333" />}
            />
          </Tooltip>
          <Tooltip title="倾斜" placement="bottom">
            <Button
              size="small"
              type="text"
              icon={<TextItalic theme="outline" size="13" fill="#333" />}
            />
          </Tooltip>
          <Tooltip title="下划线" placement="bottom">
            <Button
              size="small"
              type="text"
              icon={<TextUnderline theme="outline" size="13" fill="#333" />}
            />
          </Tooltip>
          <Tooltip title="删除线" placement="bottom">
            <Button
              size="small"
              type="text"
              icon={<Strikethrough theme="outline" size="13" fill="#333" />}
            />
          </Tooltip>
          <Popover
            content={
              <ColorPanel value={currentColor} onChange={handleColorChange} />
            }
            trigger="click"
            open={colorPickerOpen}
            onOpenChange={setColorPickerOpen}
            placement="bottomLeft"
          >
            <Button
              size="small"
              type="text"
              icon={
                <ColorCard
                  theme="multi-color"
                  size="14"
                  fill={["#333", "#f25f00", "#FFF", "#43CCF8"]}
                />
              }
            />
          </Popover>
        </div>
      </div>
    </div>
  );
};

export const TextPanelTitle = "文本工具";
export const TextPanelKey = "text";
