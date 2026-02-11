# 使用 json-render 管理组件渲染

## 概述

这份文档展示如何使用 `json-render` 来替代传统的 if-else 组件渲染方式，使代码更简洁、可维护、易扩展。

## 🎯 问题：传统的 if-else 渲染方式

### 当前代码（Canvas/index.tsx）

```tsx
const renderElements = (isEditMode: boolean) => {
  return currentPage.elements.map((element) => {
    if (element.type === "text") {
      return <Text {...element} mode={mode} onSelect={...} />;
    } else if (element.type === "table") {
      return <Table {...element} mode={mode} onSelect={...} />;
    } else if (element.type === "icon") {
      return <Icon {...element} mode={mode} onSelect={...} />;
    } else if (element.type === "image") {
      return <Image {...element} mode={mode} onSelect={...} />;
    } else if (element.type === "mindmap") {
      return <MindMap {...element} mode={mode} onSelect={...} />;
    } else if (element.type === "chart") {
      return <Chart {...element} mode={mode} onSelect={...} />;
    }
    return null;
  }).filter(Boolean);
};
```

### 问题

- ❌ **代码冗长**：每个组件类型需要一个 if-else 分支（~80 行）
- ❌ **难以维护**：添加新组件需要修改多处代码
- ❌ **缺乏类型验证**：运行时没有数据验证
- ❌ **不易扩展**：无法轻松支持 AI 生成组件

## ✅ 解决方案：使用 json-render

### 新代码

```tsx
// 只需 3 行代码！
const renderElements = (isEditMode: boolean) => {
  return (
    <ElementRenderer
      elements={currentPage.elements}
      mode={mode}
      onElementSelect={isEditMode ? handleElementSelect : undefined}
    />
  );
};
```

## 📦 核心文件

### 1. `src/utils/elementRenderer.tsx`

这是核心渲染工具，包含：

#### **组件目录定义**
```tsx
export const pptElementCatalog = createCatalog({
  components: {
    Text: { props: z.object({...}) },
    Table: { props: z.object({...}) },
    Icon: { props: z.object({...}) },
    Image: { props: z.object({...}) },
    MindMap: { props: z.object({...}) },
    Chart: { props: z.object({...}) },
  },
});
```

#### **组件映射**
```tsx
export const pptComponentMap = {
  Text: (props) => <Text {...props} type="text" />,
  Table: (props) => <Table {...props} type="table" />,
  Icon: (props) => <Icon {...props} type="icon" />,
  Image: (props) => <Image {...props} type="image" />,
  MindMap: (props) => <MindMap {...props} type="mindmap" />,
  Chart: (props) => <Chart {...props} type="chart" />,
};
```

#### **渲染组件**
```tsx
export const ElementRenderer = ({ elements, mode, onElementSelect }) => {
  const trees = convertElementsToTrees(elements, mode, onElementSelect);
  return trees.map(tree => <Renderer tree={tree} components={pptComponentMap} />);
};
```

### 2. `src/examples/JsonRenderCanvasExample.tsx`

完整的对比示例，展示三种渲染方式：
- ✅ **ElementRenderer**（推荐）
- ✅ **Manual Renderer**（更灵活）
- ⚠️ **传统 if-else**（对比用）

## 🚀 使用方法

### 方式 1: 使用 ElementRenderer（推荐）

```tsx
import { ElementRenderer } from '@/utils/elementRenderer';

function Canvas() {
  const currentPage = useCurrentPage();
  
  return (
    <div className="canvas">
      <ElementRenderer
        elements={currentPage.elements}
        mode="edit"
        onElementSelect={(id) => console.log('Selected:', id)}
      />
    </div>
  );
}
```

### 方式 2: 手动使用 Renderer（更灵活）

```tsx
import { convertElementsToTrees, pptComponentMap } from '@/utils/elementRenderer';
import { Renderer } from '@json-render/react';

function Canvas() {
  const currentPage = useCurrentPage();
  const trees = convertElementsToTrees(currentPage.elements, 'edit');
  
  return (
    <>
      {trees.map(tree => (
        <Renderer 
          key={tree.props.id} 
          tree={tree} 
          components={pptComponentMap} 
        />
      ))}
    </>
  );
}
```

## 📊 对比分析

| 特性 | json-render | if-else |
|------|-------------|---------|
| **代码行数** | ~5 行 | ~80 行 |
| **添加新组件** | 只需在 catalog 添加 | 需要添加 if-else 分支 |
| **类型安全** | ✅ Zod 运行时验证 | ⚠️ 仅 TypeScript |
| **可维护性** | ✅ 高（声明式） | ⚠️ 中（命令式） |
| **AI 集成** | ✅ 原生支持 | ❌ 需自行实现 |
| **性能** | ✅ 相同 | ✅ 相同 |
| **学习成本** | ⚠️ 中等 | ✅ 低 |

## 🔧 如何集成到现有项目

### 步骤 1: 替换 Canvas 渲染逻辑

**文件：`src/pages/Canvas/index.tsx`**

```tsx
// 原来的代码（第 502-583 行）
const renderElements = useMemoizedFn((isEditMode: boolean) => {
  if (!currentPage) return null;
  // ... 大量 if-else ...
});

// 替换为：
import { ElementRenderer } from '@/utils/elementRenderer';

const renderElements = useMemoizedFn((isEditMode: boolean) => {
  if (!currentPage) return null;
  
  return (
    <ElementRenderer
      elements={currentPage.elements}
      mode={mode}
      onElementSelect={isEditMode ? handleElementSelect : undefined}
    />
  );
});
```

### 步骤 2: 测试

```bash
npm run dev
```

打开任意页面，验证：
- ✅ 所有元素正常渲染
- ✅ 点击选择功能正常
- ✅ 编辑/预览/播放模式切换正常

## 🎨 添加新组件类型

### 1. 在 catalog 中定义

```tsx
// src/utils/elementRenderer.tsx
export const pptElementCatalog = createCatalog({
  components: {
    // ... 现有组件
    SmartArt: {
      props: z.object({
        id: z.string(),
        layout: z.enum(['vertical', 'horizontal', 'circular']),
        nodes: z.array(z.any()),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      }),
    },
  },
});
```

### 2. 添加到组件映射

```tsx
import { SmartArt } from '@/element/SmartArt';

export const pptComponentMap = {
  // ... 现有组件
  SmartArt: (props) => <SmartArt {...props} type="smartart" />,
};
```

### 3. 更新类型映射

```tsx
export function convertElementToTree(element, mode, onSelect) {
  const typeMap = {
    // ... 现有映射
    smartart: 'SmartArt',
  };
  // ...
}
```

完成！新组件自动可用。

## 🤖 AI 集成示例

json-render 天然支持 AI 生成组件：

```tsx
import { streamUI } from 'ai/rsc';

async function generateSlide(prompt: string) {
  const result = await streamUI({
    model: openai('gpt-4'),
    prompt: `Create a PPT slide with: ${prompt}`,
    // 使用我们的 catalog 作为约束
    schema: pptElementCatalog,
  });
  
  // AI 生成的元素自动符合我们的类型定义
  return result.elements;
}
```

## 📝 完整示例

查看 `src/examples/JsonRenderCanvasExample.tsx` 获取：
- ✅ 三种渲染方式的完整对比
- ✅ 交互式演示
- ✅ 性能对比
- ✅ 代码示例

## 🎯 最佳实践

### ✅ 推荐

1. **使用 ElementRenderer** - 最简单直接
2. **在 catalog 中定义所有组件** - 保证类型安全
3. **将转换逻辑集中管理** - 便于维护
4. **复用 componentMap** - 避免重复代码

### ❌ 避免

1. **混用 if-else 和 json-render** - 保持一致性
2. **跳过 catalog 定义** - 失去类型验证优势
3. **直接修改 componentMap** - 使用配置文件

## 📚 相关资源

- **核心工具**: `src/utils/elementRenderer.tsx`
- **使用示例**: `src/examples/JsonRenderCanvasExample.tsx`
- **数据结构**: `src/mock/index.ts`
- **官方文档**: https://json-render.dev/

## 🐛 常见问题

### Q: 性能如何？
A: 与 if-else 方式相同。json-render 只是改变了渲染逻辑的组织方式，不影响性能。

### Q: 会影响现有功能吗？
A: 不会。ElementRenderer 是对现有组件的封装，功能完全一致。

### Q: 可以逐步迁移吗？
A: 可以！两种方式可以共存，建议从新功能开始使用 json-render。

### Q: 如何调试？
A: 使用浏览器开发者工具，或在 convertElementToTree 中添加 console.log。

## 🎉 总结

使用 json-render 管理组件渲染带来了：

- ✅ **代码减少 90%**（从 ~80 行到 ~5 行）
- ✅ **更易维护**（声明式配置）
- ✅ **类型安全**（Zod 验证）
- ✅ **易于扩展**（添加新组件只需 3 步）
- ✅ **AI 就绪**（原生支持 AI 生成）

**立即开始使用：**

```tsx
import { ElementRenderer } from '@/utils/elementRenderer';

<ElementRenderer elements={elements} mode="edit" />
```
