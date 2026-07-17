import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // 测试文件位置
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    // 支持文件扩展名
    supportFile: "cypress/support/e2e.ts",
    // 基础 URL（与 next dev -p 5174 一致）
    baseUrl: "http://localhost:5174",
    // 视口大小
    viewportWidth: 1920,
    viewportHeight: 1080,
    // 视频录制
    video: true,
    // 截图
    screenshotOnRunFailure: true,
    // 设置超时时间
    defaultCommandTimeout: 10000,
    // 请求超时时间
    requestTimeout: 10000,
    // 响应超时时间
    responseTimeout: 10000,
    // 页面加载超时时间
    pageLoadTimeout: 30000,
    // 设置环境变量
    env: {
      // 可以在这里添加自定义环境变量
    },
    // 设置浏览器
    setupNodeEvents(on, config) {
      // 在测试开始前检查服务器是否可用
      on("task", {
        async checkServer() {
          try {
            const response = await fetch(
              config.baseUrl || "http://localhost:5174"
            );
            return { available: response.ok };
          } catch (error) {
            return { available: false, error: (error as Error).message };
          }
        },
      });
      return config;
    },
    // 阻止导航到 about:blank
    chromeWebSecurity: false,
  },
});
