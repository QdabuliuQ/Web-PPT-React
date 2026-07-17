"use client";

import "@ant-design/v5-patch-for-react-19";
import Index from "@/views/index";
import { initPPTStore } from "@/utils/initStore";
import "animate.css";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
import { useTranslation } from "react-i18next";
import "react-contexify/dist/ReactContexify.css";
import "@/i18n";

// 在模块加载时同步初始化数据，确保在组件渲染前完成
initPPTStore();

function AppShell() {
  const { i18n } = useTranslation();

  // 根据当前语言选择antd的语言包
  const antdLocale = i18n.language === "zh-CN" ? zhCN : enUS;

  return (
    <ConfigProvider
      locale={antdLocale}
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

export default AppShell;
