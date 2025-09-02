import { memo, type FC } from "react";
import { HexColorPicker } from "react-colorful";

// react-colorful 自定义样式
const colorPickerStyles = `
  .react-colorful {
    width: 100%;
    height: 180px;
  }
  
  .react-colorful__saturation {
    border-radius: 8px 8px 0 0;
  }
  
  .react-colorful__hue {
    height: 24px;
    border-radius: 0 0 8px 8px;
  }
  
  .react-colorful__pointer {
    width: 18px;
    height: 18px;
    border-width: 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .react-colorful__saturation-pointer {
    width: 16px;
    height: 16px;
    border-width: 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

interface IColorPanelProps {
  value?: string;
  onChange?: (color: string) => void;
}

// 预设颜色配置 - 从浅到深
const presetColors = [
  // 红色系
  [
    "#ffebe6",
    "#ffccc7",
    "#ffa39e",
    "#ff7875",
    "#ff4d4f",
    "#f5222d",
    "#cf1322",
    "#a8071a",
  ],
  // 橙色系
  [
    "#fff7e6",
    "#ffe7ba",
    "#ffd591",
    "#ffc069",
    "#ffa940",
    "#fa8c16",
    "#d46b08",
    "#ad4e00",
  ],
  // 黄色系
  [
    "#feffe6",
    "#fffbe6",
    "#fff1b8",
    "#ffec3d",
    "#fadb14",
    "#d4b106",
    "#ad8b00",
    "#876800",
  ],
  // 绿色系
  [
    "#f6ffed",
    "#d9f7be",
    "#b7eb8f",
    "#95de64",
    "#73d13d",
    "#52c41a",
    "#389e0d",
    "#237804",
  ],
  // 蓝色系
  [
    "#e6f7ff",
    "#bae7ff",
    "#91d5ff",
    "#69c0ff",
    "#40a9ff",
    "#1890ff",
    "#096dd9",
    "#0050b3",
  ],
  // 紫色系
  [
    "#f9f0ff",
    "#efdbff",
    "#d3adf7",
    "#b37feb",
    "#9254de",
    "#722ed1",
    "#531dab",
    "#391085",
  ],
  // 灰色系
  [
    "#fafafa",
    "#f5f5f5",
    "#e8e8e8",
    "#d9d9d9",
    "#bfbfbf",
    "#8c8c8c",
    "#595959",
    "#262626",
  ],
];

export const ColorPanel: FC<IColorPanelProps> = memo(
  ({ value = "#000000", onChange }) => {
    const handleColorChange = (color: string) => {
      onChange?.(color);
    };

    const handlePresetClick = (color: string) => {
      onChange?.(color);
    };

    return (
      <div className="bg-white min-w-[220px]">
        <style>{colorPickerStyles}</style>
        {/* 自定义颜色选择器 */}
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex flex-col items-center">
            <HexColorPicker color={value} onChange={handleColorChange} />
            <div className="mt-3 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border-2 border-gray-200 shadow-sm"
                style={{ backgroundColor: value }}
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-20 text-xs font-mono px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        {/* 预设颜色面板 */}
        <div className="mb-4">
          <div className="space-y-1">
            {presetColors.map((colorRow, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {colorRow.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className={`w-6 h-6 rounded cursor-pointer transition-all duration-200 relative ${
                      value === color
                        ? "border-2 border-primary shadow-lg scale-110 z-10"
                        : "border border-gray-300 hover:border-gray-400 hover:shadow-md hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handlePresetClick(color)}
                    title={color}
                  >
                    {value === color && (
                      <div className="absolute inset-0 rounded border-2 border-white shadow-inner" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

ColorPanel.displayName = "ColorPanel";

export default ColorPanel;
