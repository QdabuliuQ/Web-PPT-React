import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5174, // 与 Cypress baseUrl 保持一致
    strictPort: true, // 如果端口被占用，不自动尝试其他端口
  },
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "babel-plugin-react-compiler",
            {
              target: "18", // 指定 React 18 版本
            },
          ],
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/components": resolve(__dirname, "./src/components"),
      "@/pages": resolve(__dirname, "./src/pages"),
      "@/hooks": resolve(__dirname, "./src/hooks"),
      "@/store": resolve(__dirname, "./src/store"),
      "@/utils": resolve(__dirname, "./src/utils"),
      "@/types": resolve(__dirname, "./src/types"),
      "@/constants": resolve(__dirname, "./src/constants"),
      "@/services": resolve(__dirname, "./src/services"),
      "@/assets": resolve(__dirname, "./src/assets"),
    },
  },
});
