import "@ant-design/v5-patch-for-react-19";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n"; // 导入国际化配置
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <App />
);
