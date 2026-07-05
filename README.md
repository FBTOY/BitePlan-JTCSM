# 家庭厨房助手

根据你的厨房状态（食材、工具、烹饪水平、时间、忌口），让 AI 生成一份详细、标准的烹饪方案，并一步步清单化地引导你完成。

## 功能

- 固定化厨房档案：人数、时间、水平、忌口。
- 储备管理：维护现有食材、配料/调料、工具；生成菜谱时自动带入。
- 一键入库：在生成的菜谱中点击食材/配料，直接加入储备。
- AI 生成菜谱：支持 Kimi（Moonshot）和 Claude（Anthropic），在应用内配置 API Key。
- 清单式跟做：每个步骤配备 checklist，支持进度追踪。
- 完成反馈：收集评分、难度、口味与建议。
- 历史菜单：查看过往烹饪记录与反馈。

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:3000，然后在「设置」中配置 Kimi 或 Claude 的 API Key。

## 常用命令

- `npm run dev` — 开发服务器
- `npm run build` — 生产构建
- `npm run start` — 生产服务器
- `npm run lint` — 代码检查
- `npm test` — 运行测试
- `npm run test:watch` — 监听模式运行测试

## 技术栈

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Anthropic SDK + OpenAI SDK（用于 Moonshot/Kimi）
- Zod
- Jest + React Testing Library

## 数据存储

当前 MVP 使用浏览器 `localStorage` 保存厨房档案、储备、AI 服务配置、当前烹饪会话和历史记录，无需后端数据库。
