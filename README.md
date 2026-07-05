# 今天吃什么 BitePlan

根据你的厨房状态（食材、工具、烹饪水平、时间、忌口），让 AI 生成一份详细、标准的烹饪方案，并一步步清单化地引导你完成。

## 功能

- **账号登录**：注册/登录后，历史、储备、设置等数据保存在服务端 SQLite，并可同步到本地。
- **厨房档案**：人数、时间、水平、忌口。
- **储备管理**：维护现有食材、配料/调料、工具；生成菜谱时自动带入，菜谱中可一键加入储备。
- **AI 生成菜谱**：支持 Kimi（Moonshot）和 Claude（Anthropic），在应用内配置 API Key。
- **偏好设置**：设置重量/容积单位规范，支持「只使用质量单位」选项。
- **步骤压缩**：AI 生成后自动将短时间连续步骤合并，并提供下一步提示。
- **清单式跟做**：每个步骤配备 checklist，进度条展示每步标题，可随时查看全流程。
- **完成反馈**：收集评分、难度、口味与建议。
- **历史菜单**：查看过往烹饪记录与反馈。

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:3000，然后：

1. 注册或登录账号（可选，登录后数据可云端保存）。
2. 在「设置」中配置 Kimi 或 Claude 的 API Key。
3. 在「设置」中调整单位偏好。
4. 在首页填写厨房档案，开始生成菜谱。

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
- better-sqlite3（用户数据）
- bcryptjs（密码哈希）
- cookie（会话 Cookie）
- Zod
- Jest + React Testing Library

## 数据存储

- 登录用户：数据保存在 `data/biteplan.db`（SQLite），同时在浏览器 `localStorage` 中保留副本。
- 未登录用户：数据仅保存在 `localStorage` 中。
