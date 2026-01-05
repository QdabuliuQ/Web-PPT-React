# Cypress 测试指南

本项目使用 [Cypress](https://www.cypress.io/) 进行端到端（E2E）测试和组件测试。

## 安装

```bash
npm install
```

## 运行测试

### E2E 测试（完整功能流程测试）

```bash
# 打开 Cypress 测试运行器（交互式界面）
npm run test:e2e:open

# 在无头模式下运行所有 E2E 测试
npm run test:e2e:headless

# 运行所有 E2E 测试（默认模式）
npm run test:e2e
```

### 组件测试

```bash
# 打开 Cypress 组件测试运行器
npx cypress open --component

# 运行组件测试
npx cypress run --component
```

## 测试文件结构

```
cypress/
├── e2e/                    # E2E 测试文件
│   ├── chart-workflow.cy.ts          # 图表工作流程测试
│   ├── page-management.cy.ts         # 页面管理测试
│   └── chart-data-conversion.cy.ts    # 图表数据转换测试
├── component/              # 组件测试文件
│   └── Chart.cy.tsx        # 图表组件测试
├── fixtures/               # 测试数据
│   └── example.json
└── support/                # 支持文件
    ├── commands.ts         # 自定义命令
    ├── e2e.ts             # E2E 测试支持
    └── component.tsx       # 组件测试支持
```

## 编写 E2E 测试

### 基本示例

```typescript
describe("功能名称", () => {
  beforeEach(() => {
    // 每个测试前的设置
    cy.visit("/");
    cy.wait(1000);
  });

  it("应该完成某个功能", () => {
    // 1. 访问页面
    cy.visit("/");
    
    // 2. 查找元素并交互
    cy.get('button:contains("图表")').click();
    
    // 3. 验证结果
    cy.contains("编辑图表数据").should("be.visible");
  });
});
```

### 测试完整功能流程示例

```typescript
describe("Chart Workflow", () => {
  it("should create and edit chart data", () => {
    // 1. 访问应用
    cy.visit("/");
    
    // 2. 创建图表
    cy.get('button:contains("图表")').click();
    cy.get('[data-testid="chart-type-radar1"]').click();
    
    // 3. 打开数据编辑
    cy.get('[id^="dom_"]').first().dblclick();
    
    // 4. 验证弹窗打开
    cy.contains("编辑图表数据").should("be.visible");
    
    // 5. 修改数据
    cy.get(".x-spreadsheet-cell").eq(1).dblclick().type("50{enter}");
    
    // 6. 保存
    cy.contains("button", "保存").click();
    
    // 7. 验证弹窗关闭
    cy.contains("编辑图表数据").should("not.exist");
  });
});
```

## 自定义命令

在 `cypress/support/commands.ts` 中定义的自定义命令：

```typescript
// 等待元素可见
cy.waitForVisible("selector", 10000);

// 点击并等待
cy.clickAndWait("selector");
```

## 最佳实践

### 1. 使用 data-testid

在关键元素上添加 `data-testid` 属性，使测试更稳定：

```tsx
<button data-testid="add-chart">添加图表</button>
```

```typescript
cy.get('[data-testid="add-chart"]').click();
```

### 2. 等待策略

```typescript
// ✅ 好的做法：等待特定条件
cy.contains("编辑图表数据").should("be.visible");

// ❌ 不好的做法：固定等待
cy.wait(5000);
```

### 3. 测试隔离

每个测试应该是独立的，不依赖其他测试的状态：

```typescript
beforeEach(() => {
  // 重置状态
  cy.visit("/");
  // 清理数据等
});
```

### 4. 选择器优先级

1. `data-testid` - 最稳定
2. `data-cy` - Cypress 推荐
3. 文本内容 - `contains()`
4. CSS 选择器 - 最后选择

## 调试测试

### 使用 Cypress 测试运行器

```bash
npm run test:e2e:open
```

在测试运行器中：
- 点击测试文件运行
- 查看实时 DOM 快照
- 使用浏览器开发者工具
- 暂停测试进行调试

### 调试技巧

```typescript
// 暂停测试
cy.pause();

// 打印调试信息
cy.log("当前状态");

// 截图
cy.screenshot("debug-screenshot");
```

## 配置说明

### cypress.config.ts

主要配置项：
- `baseUrl`: 测试基础 URL
- `viewportWidth/viewportHeight`: 视口大小
- `defaultCommandTimeout`: 命令超时时间
- `video`: 是否录制视频
- `screenshotOnRunFailure`: 失败时截图

## CI/CD 集成

在 CI/CD 中运行测试：

```yaml
# .github/workflows/cypress.yml
- name: Run Cypress tests
  run: |
    npm run dev &
    npm run test:e2e:headless
```

## 更多资源

- [Cypress 官方文档](https://docs.cypress.io/)
- [Cypress 最佳实践](https://docs.cypress.io/guides/references/best-practices)
- [Cypress 示例](https://example.cypress.io/)

