import Index from "@/pages/index";
import "animate.css";
import { ConfigProvider } from "antd";
import "react-contexify/dist/ReactContexify.css";
import "./App.css";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#f25f00", // 主题色
          fontSizeSM: 12, // small 尺寸字体大小
        },
        components: {
          Button: {
            colorPrimary: "#f25f00",
            primaryShadow: "0 2px 0 rgba(242, 95, 0, 0.1)",
            contentFontSizeSM: 12,
          },
          Select: {
            colorPrimary: "#f25f00",
            fontSize: 12, // 设置 Select 字体大小为 12px
            optionFontSize: 12, // 设置选项字体大小为 12px
            optionSelectedBg: "#fff2e6", // 选中项背景色
            optionSelectedColor: "#f25f00", // 选中项文字颜色 - 主题色
            optionActiveBg: "#fff2e6", // 激活项背景色
          },
          Input: {
            colorPrimary: "#f25f00",
            activeBorderColor: "#f25f00",
            hoverBorderColor: "#ff7b33",
          },
          InputNumber: {
            colorPrimary: "#f25f00",
            activeBorderColor: "#f25f00",
            hoverBorderColor: "#ff7b33",
            fontSize: 12, // 设置 InputNumber 字体大小为 12px
          },
          Tooltip: {
            fontSize: 12,
            colorBgSpotlight: "rgba(0, 0, 0, 0.85)",
            colorTextLightSolid: "#fff",
          },
          Popover: {
            colorPrimary: "#f25f00",
            fontSize: 14,
          },
          Dropdown: {
            fontSize: 12,
          },
          Menu: {
            colorPrimary: "#f25f00",
            itemSelectedBg: "#fff2e6", // 选中项背景色
            itemSelectedColor: "#f25f00", // 选中项文字颜色 - 主题色
            itemActiveBg: "#fff2e6", // 激活项背景色
          },
          Modal: {
            colorPrimary: "#f25f00",
          },
        },
      }}
    >
      <Index />
    </ConfigProvider>
  );
}

export default App;
