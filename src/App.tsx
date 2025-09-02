import Index from "@/pages/index";
import { ConfigProvider } from "antd";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#f25f00", // 主题色
        },
        components: {
          Button: {
            colorPrimary: "#f25f00",
            primaryShadow: "0 2px 0 rgba(242, 95, 0, 0.1)",
          },
          Select: {
            colorPrimary: "#f25f00",
          },
          Input: {
            colorPrimary: "#f25f00",
            activeBorderColor: "#f25f00",
            hoverBorderColor: "#ff7b33",
          },
        },
      }}
    >
      <Index />
    </ConfigProvider>
  );
}

export default App;
