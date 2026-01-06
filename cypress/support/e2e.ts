/// <reference types="cypress" />

// 导入 Cypress 类型定义和命令
import "./commands";
import "./index.d.ts";

// 处理未捕获的异常（全局处理）
Cypress.on("uncaught:exception", (err) => {
  // 如果是 tenantId 相关的错误，忽略它
  if (err.message.includes("tenantId is required")) {
    return false; // 返回 false 表示忽略这个错误
  }
  // 如果是 about:blank 相关的错误，提供更清晰的提示
  if (
    err.message.includes("about:blank") ||
    err.message.includes("无法连接到开发服务器")
  ) {
    console.error(
      "\n❌ 错误：无法连接到开发服务器\n" +
        "请确保开发服务器正在运行：\n" +
        "  运行命令: npm run dev\n" +
        "  服务器地址: http://localhost:5173\n"
    );
    return true; // 抛出错误以停止测试
  }
  // 其他错误正常抛出
  return true;
});

// 注意：在运行 Cypress 测试之前，请确保开发服务器正在运行
// 运行命令: npm run dev
// 然后在另一个终端运行: npm run test:e2e:open
