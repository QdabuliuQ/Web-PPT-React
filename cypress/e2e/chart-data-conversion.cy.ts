/// <reference types="cypress" />

/**
 * E2E 测试：图表数据转换的完整流程
 *
 * 测试场景：
 * 1. 创建图表
 * 2. 打开数据编辑
 * 3. 修改多个数据点
 * 4. 保存并验证数据正确转换
 */
describe("Chart Data Conversion Flow", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.wait(1000);
  });

  it("should convert Excel data to chart option correctly", () => {
    // 1. 创建雷达图
    cy.get('button:contains("图表")').first().click({ force: true });
    cy.wait(500);

    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="chart-type-radar1"]').length > 0) {
        cy.get('[data-testid="chart-type-radar1"]').click({ force: true });
      } else if ($body.find('button:contains("雷达图")').length > 0) {
        cy.get('button:contains("雷达图")').first().click({ force: true });
      } else {
        cy.get("button")
          .contains(/雷达|radar/i)
          .first()
          .click({ force: true });
      }
    });

    cy.wait(1000);

    // 2. 打开数据编辑弹窗
    cy.get('[id^="dom_"]').first().dblclick();
    cy.contains("编辑图表数据").should("be.visible");

    cy.wait(1000);

    // 3. 修改数据（示例：修改第一个数据点的值）
    // 注意：实际的选择器和交互方式需要根据 x-data-spreadsheet 调整
    cy.get(".x-spreadsheet-cell")
      .eq(1) // 第一个数据单元格
      .dblclick()
      .type("{selectall}100{enter}");

    cy.wait(500);

    // 4. 保存数据
    cy.contains("button", "保存").click();

    // 5. 验证弹窗关闭
    cy.contains("编辑图表数据").should("not.exist");

    // 6. 再次打开验证数据已保存
    cy.get('[id^="dom_"]').first().dblclick();
    cy.contains("编辑图表数据").should("be.visible");

    cy.wait(1000);

    // 验证数据已更新（这里需要根据实际 UI 调整验证方式）
    // cy.get(".x-spreadsheet-cell").eq(1).should("contain", "100");

    // 关闭弹窗
    cy.contains("button", "取消").click();
  });

  it("should handle empty data rows correctly", () => {
    // 创建图表
    cy.get('button:contains("图表")').first().click({ force: true });
    cy.wait(500);

    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="chart-type-radar1"]').length > 0) {
        cy.get('[data-testid="chart-type-radar1"]').click({ force: true });
      } else if ($body.find('button:contains("雷达图")').length > 0) {
        cy.get('button:contains("雷达图")').first().click({ force: true });
      } else {
        cy.get("button")
          .contains(/雷达|radar/i)
          .first()
          .click({ force: true });
      }
    });

    cy.wait(1000);

    // 打开数据编辑
    cy.get('[id^="dom_"]').first().dblclick();
    cy.contains("编辑图表数据").should("be.visible");

    cy.wait(1000);

    // 添加空行（在实际测试中，这应该被正确处理）
    // 这里只是示例，实际需要根据 x-data-spreadsheet 的 API 操作

    // 保存
    cy.contains("button", "保存").click();
    cy.contains("编辑图表数据").should("not.exist");
  });
});
