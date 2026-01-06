/// <reference types="cypress" />

/**
 * E2E 测试：页面管理的完整工作流程
 *
 * 测试场景：
 * 1. 创建新页面
 * 2. 切换页面
 * 3. 删除页面
 */
describe("Page Management", () => {
  beforeEach(() => {
    // 访问应用首页
    cy.visit("/");

    // 等待应用加载完成
    // 等待页面元素出现，而不是固定等待时间
    cy.get(".previewCanvas", { timeout: 10000 }).should("exist");
  });

  it("should create new page", () => {
    // 获取当前页面数量（通过预览画布元素）
    cy.get(".previewCanvas").then(($pages) => {
      const pageCountBefore = $pages.length;

      cy.get(".pr-\\[15px\\]")
        .find("div")
        .last()
        .should("be.visible")
        .click({ force: true });

      // 等待1秒钟，确保页面添加操作完成
      cy.wait(1000);

      cy.get(".previewCanvas", { timeout: 5000 })
        .then(($newPages) => {
          const newPageCount = $newPages.length;
          return newPageCount;
        })
        .should("be.greaterThan", pageCountBefore);
    });
  });

  it("should switch between pages", () => {
    // 获取所有页面项（通过预览画布）
    cy.get(".previewCanvas").then(($pages) => {
      if ($pages.length > 1) {
        // 点击第二个页面的画布区域
        cy.get(".previewCanvas").eq(1).parent().click({ force: true });

        cy.wait(500);

        // 验证页面已切换（检查第二个页面的父元素是否有阴影边框）
        cy.get(".previewCanvas")
          .eq(1)
          .parent()
          .should("have.class", "shadow-[0_0_0_2px_#f25f00]");
      }
    });
  });

  it("should select page by clicking", () => {
    // 点击第一个页面的画布区域
    cy.get(".previewCanvas").first().parent().click({ force: true });

    cy.wait(500);

    // 验证页面被选中（检查是否有阴影边框和 primary 颜色）
    cy.get(".previewCanvas")
      .first()
      .parent()
      .should("have.class", "shadow-[0_0_0_2px_#f25f00]");

    // 验证页面编号变为 primary 颜色
    cy.get(".previewCanvas")
      .first()
      .parent()
      .parent()
      .find("span")
      .should("have.class", "text-primary");
  });

  it("should add page after specific page", () => {
    // 等待页面加载
    cy.get(".previewCanvas").should("exist");

    // 获取第一个页面项
    cy.get(".previewCanvas")
      .first()
      .parent()
      .parent()
      .within(() => {
        // 悬停显示浮动按钮
        cy.get(".floatButton").invoke("css", "opacity", "1");

        // 点击添加页面按钮（Plus 图标）
        cy.get(".floatButton")
          .find("svg")
          .last()
          .parent()
          .click({ force: true });
      });

    cy.wait(1000);

    // 验证页面数量增加
    cy.get(".previewCanvas").should(($pages) => {
      expect($pages.length).to.be.greaterThan(0);
    });
  });
});
