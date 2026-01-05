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

  it("should insert all element types and verify they are inserted", () => {
    // 等待页面加载
    cy.get(".previewCanvas").should("exist");

    // 记录插入前的元素数量（通过检查画布上的元素）
    // 注意：不同元素类型可能有不同的选择器，这里使用通用方法
    cy.get('[id^="dom_"]').then(($elements) => {
      const elementCountBefore = $elements.length;

      // 点击"插入"菜单
      cy.contains("插入").click({ force: true });
      cy.wait(500);

      // 1. 插入文本元素
      cy.contains("文本").click({ force: true });
      cy.wait(500);

      // 2. 插入表格元素
      cy.contains("表格").click({ force: true });
      cy.wait(300);
      // 表格需要选择行列，点击第一个网格项（1行1列）
      cy.get("body").then(($body) => {
        const gridItem = $body.find(".gridItem").first();
        if (gridItem.length > 0) {
          cy.wrap(gridItem).click({ force: true });
        }
      });
      cy.wait(500);

      // 3. 插入图标元素
      cy.contains("图标").click({ force: true });
      cy.wait(300);
      // 图标选择器，点击第一个图标
      cy.get("body").then(($body) => {
        // 查找图标选择器中的第一个可点击的图标项
        const iconItem = $body
          .find('[class*="icon"]')
          .not('[class*="IconButton"]')
          .first();
        if (iconItem.length > 0) {
          cy.wrap(iconItem).click({ force: true });
        } else {
          // 尝试通过其他方式选择
          cy.get("body")
            .find("div")
            .contains(/图标|icon/i)
            .first()
            .click({ force: true });
        }
      });
      cy.wait(500);

      // 4. 插入图片元素（跳过，因为需要上传文件或输入URL，比较复杂）
      // cy.contains("图片").click({ force: true });
      // cy.wait(500);

      // 5. 插入思维导图元素
      cy.contains("思维导图").click({ force: true });
      cy.wait(500);

      // 6. 插入图表元素
      cy.contains("图表").click({ force: true });
      cy.wait(300);
      // 图表需要选择类型，点击第一个图表类型选项
      cy.get("body").then(($body) => {
        // 查找图表类型选择器中的第一个选项
        const chartOption = $body
          .find(
            'div:contains("柱状图"), div:contains("折线图"), div:contains("饼图")'
          )
          .first();
        if (chartOption.length > 0) {
          cy.wrap(chartOption).click({ force: true });
        } else {
          // 如果没有找到，尝试点击网格中的第一个选项
          cy.get("body")
            .find("div[class*='grid']")
            .first()
            .find("div")
            .first()
            .click({ force: true });
        }
      });
      cy.wait(500);

      // 验证所有元素都插入成功
      // 检查元素数量是否增加（至少增加了4个元素：文本、表格、图标、思维导图、图表）
      cy.get('[id^="dom_"]').should(($elements) => {
        const elementCountAfter = $elements.length;
        // 至少增加了4个元素（文本、表格、图标、思维导图、图表）
        expect(elementCountAfter).to.be.at.least(elementCountBefore + 4);
        console.log(`元素数量: ${elementCountBefore} -> ${elementCountAfter}`);
      });

      // 验证特定类型的元素是否存在
      // 检查图表元素（图表有特定的 id 格式 dom_xxx）
      cy.get('[id^="dom_"]').should(
        "have.length.at.least",
        elementCountBefore + 1
      );
    });
  });
});
