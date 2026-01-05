/// <reference types="cypress" />

/**
 * 自定义 Cypress 命令
 * 可以在这里添加项目中常用的自定义命令
 */

// 示例：等待元素可见的自定义命令
Cypress.Commands.add("waitForVisible", (selector: string, timeout = 10000) => {
  cy.get(selector, { timeout }).should("be.visible");
});

// 示例：点击并等待加载完成
Cypress.Commands.add("clickAndWait", (selector: string) => {
  cy.get(selector).click();
  cy.wait(500); // 等待操作完成
});

// 安全访问页面，检查服务器是否可用
Cypress.Commands.add(
  "visitSafe",
  (url: string, options?: Partial<Cypress.VisitOptions>) => {
    const baseUrl = Cypress.config("baseUrl") || "http://localhost:5173";

    // 先检查服务器是否可用
    cy.request({
      url: baseUrl,
      failOnStatusCode: false,
      timeout: 5000,
    }).then((response) => {
      if (response.status === 0) {
        throw new Error(
          `\n❌ 无法连接到开发服务器 ${baseUrl}\n` +
            `请确保开发服务器正在运行：\n` +
            `  运行命令: npm run dev\n` +
            `  然后在另一个终端运行测试\n`
        );
      }
    });

    // 访问页面
    cy.visit(url, {
      ...options,
      failOnStatusCode: false,
    });

    // 验证页面已正确加载（不是 about:blank）
    cy.url({ timeout: 10000 }).should((currentUrl) => {
      if (currentUrl.includes("about:blank")) {
        throw new Error(
          `\n❌ 页面被导航到 about:blank\n` +
            `请检查：\n` +
            `1. 开发服务器是否在 ${baseUrl} 运行\n` +
            `2. 运行命令: npm run dev\n` +
            `3. 检查端口是否正确（默认是 5173）\n`
        );
      }
    });
  }
);

// 类型声明 - 使用接口合并而不是命名空间
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      waitForVisible(selector: string, timeout?: number): Chainable<void>;
      clickAndWait(selector: string): Chainable<void>;
      visitSafe(
        url: string,
        options?: Partial<Cypress.VisitOptions>
      ): Chainable<void>;
    }
  }
}

export {};
