# WebPPT

Next.js 15 + React 19 PPT 编辑器（客户端单页应用）。

## 开发

```bash
npm install
npm run dev
```

打开 [http://localhost:5174](http://localhost:5174)。

## 构建

```bash
npm run build
npm start
```

## 目录说明

- `app/`：Next.js App Router 入口（layout / page）
- `src/views/`：编辑器 UI 区块（原 `src/pages`，避免与 Next Pages Router 冲突）
- `src/app-shell.tsx`：客户端壳（antd / i18n / 编辑器）

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器（端口 5174） |
| `npm run build` | 生产构建 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | ESLint |

## 技术栈

- Next.js 15 (App Router)
- React 19 + React Compiler
- Zustand / Ant Design / Less CSS Modules / Tailwind
