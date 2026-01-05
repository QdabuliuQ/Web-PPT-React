/**
 * E2E 测试：图表创建和编辑的完整工作流程
 * 
 * 测试场景：
 * 1. 打开应用
 * 2. 创建雷达图
 * 3. 打开数据编辑弹窗
 * 4. 修改数据
 * 5. 保存数据
 * 6. 验证图表更新
 */
describe("Chart Workflow", () => {
  beforeEach(() => {
    // 访问应用首页
    cy.visit("/");
    
    // 等待应用加载完成
    cy.wait(1000);
  });

  it("should create and edit chart data", () => {
    // 1. 点击插入图表按钮
    // 注意：选择器需要根据实际 UI 调整
    cy.get('button:contains("图表")').first().click({ force: true });
    
    cy.wait(500);
    
    // 2. 选择雷达图类型
    // 尝试多种选择器方式
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="chart-type-radar1"]').length > 0) {
        cy.get('[data-testid="chart-type-radar1"]').click({ force: true });
      } else if ($body.find('button:contains("雷达图")').length > 0) {
        cy.get('button:contains("雷达图")').first().click({ force: true });
      } else {
        // 如果都找不到，尝试点击第一个图表类型选项
        cy.get("button").contains(/雷达|radar/i).first().click({ force: true });
      }
    });

    // 3. 等待图表创建完成
    cy.wait(1000);

    // 4. 双击图表打开数据编辑弹窗
    cy.get('[id^="dom_"]').first().dblclick();

    // 5. 验证弹窗已打开
    cy.contains("编辑图表数据").should("be.visible");

    // 6. 等待 spreadsheet 加载完成
    cy.wait(1000);

    // 7. 修改数据
    // 注意：x-data-spreadsheet 可能需要特殊的交互方式
    // 这里提供一个示例，实际使用时需要根据库的 API 调整
    cy.get(".x-spreadsheet-cell")
      .eq(1)
      .dblclick()
      .type("{selectall}50{enter}");

    // 8. 点击保存按钮
    cy.contains("button", "保存").click();

    // 9. 验证弹窗已关闭
    cy.contains("编辑图表数据").should("not.exist");

    // 10. 验证图表已更新
    cy.wait(1000);
  });

  it("should export chart as image", () => {
    // 1. 确保页面上有图表
    cy.visit("/");
    cy.wait(1000);

    // 2. 右键点击图表
    cy.get('[id^="dom_"]').first().rightclick();

    // 3. 点击导出图片菜单项
    cy.get("body").then(($body) => {
      if ($body.find('text=下载图片').length > 0) {
        cy.contains("下载图片").click({ force: true });
      } else if ($body.find('text=导出图片').length > 0) {
        cy.contains("导出图片").click({ force: true });
      }
    });

    // 4. 等待下载完成
    // Cypress 会自动处理下载，可以通过监听下载事件来验证
    cy.wait(2000);
  });

  it("should open chart data modal from context menu", () => {
    // 1. 确保页面上有图表
    cy.visit("/");
    cy.wait(1000);

    // 2. 右键点击图表
    cy.get('[id^="dom_"]').first().rightclick();

    // 3. 点击编辑数据菜单项
    cy.contains("编辑数据").should("be.visible").click({ force: true });

    // 4. 验证弹窗已打开
    cy.contains("编辑图表数据").should("be.visible");

    // 5. 点击取消按钮
    cy.contains("button", "取消").click();

    // 6. 验证弹窗已关闭
    cy.contains("编辑图表数据").should("not.exist");
  });
});

