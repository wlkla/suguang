# 与过去自己对话 🕰️

一个让你能与过去的自己进行对话的智能应用，通过AI分析你的思想轨迹，探索内心的成长历程。

## ✨ 功能特性

- 🤖 **AI引导记录** - 智能引导记录当前想法、情感和生活感悟
- 💭 **时光对话** - 与过去版本的自己进行深度对话
- 📊 **思想分析** - 分析思想变化趋势和成长轨迹
- 🔍 **影响探索** - 探索思想变化的内在和外在原因
- 📝 **记忆管理** - 完整的想法记录和管理系统
- 🔐 **安全认证** - JWT身份认证保护个人隐私

## 🛠️ 技术栈

### 前端
- **React 18** + TypeScript - 现代化UI框架
- **Tailwind CSS** - 实用优先的CSS框架
- **React Router** - 客户端路由
- **Axios** - HTTP客户端

### 后端
- **Node.js** + Express - 服务器框架
- **TypeScript** - 类型安全
- **Prisma** - 现代化数据库ORM
- **SQLite** - 轻量级数据库
- **JWT** - 身份认证
- **bcryptjs** - 密码加密

### AI集成
- **OpenAI API** - AI对话和分析功能（可选）

## 📁 项目结构

```
memory-dialogue/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/      # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── utils/          # 工具函数
│   │   └── types/          # TypeScript类型定义
│   ├── public/             # 静态资源
│   └── package.json
├── backend/                  # Node.js后端API
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── lib/            # 工具库
│   │   └── server.ts       # 服务器入口
│   ├── prisma/
│   │   └── schema.prisma   # 数据库模型
│   └── package.json
├── database/                 # SQLite数据库文件
├── docs/                     # 项目文档
│   └── database-design.md
├── .env                      # 环境变量配置
└── package.json              # 根项目配置
```

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd memory-dialogue
```

### 2. 安装根目录依赖
```bash
npm install
```

### 3. 安装所有项目依赖
```bash
npm run install:all
```

### 4. 环境配置
复制环境变量文件：
```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env` 文件，配置必要的环境变量。

### 5. 数据库设置
```bash
cd backend
npm run generate  # 生成Prisma客户端
npm run migrate   # 运行数据库迁移
```

### 6. 启动开发服务器
返回根目录：
```bash
cd ..
npm run dev
```

这将同时启动：
- 前端开发服务器 (http://localhost:3000)
- 后端API服务器 (http://localhost:3001)

## 📋 API接口文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取用户信息

### 记忆记录
- `POST /api/memory` - 创建记忆记录
- `GET /api/memory` - 获取记忆记录列表
- `GET /api/memory/:id` - 获取单个记忆记录
- `PUT /api/memory/:id` - 更新记忆记录
- `DELETE /api/memory/:id` - 删除记忆记录
- `GET /api/memory/search?q=keyword` - 搜索记忆记录

### 对话功能
- `POST /api/chat/start` - 开始新对话
- `POST /api/chat/:id/message` - 发送消息
- `GET /api/chat/:id` - 获取对话历史
- `GET /api/chat` - 获取对话列表

### 思想分析
- `POST /api/analysis/generate` - 生成分析报告
- `GET /api/analysis` - 获取分析历史
- `GET /api/analysis/:id` - 获取特定分析
- `DELETE /api/analysis/:id` - 删除分析

## 🎯 使用流程

1. **注册账号** - 创建你的专属账户
2. **记录想法** - 通过AI引导或自由记录当前的想法和感受
3. **积累记忆** - 持续记录，建立你的思想档案
4. **开启对话** - 选择过往记录，与过去的自己开始对话
5. **分析成长** - 生成思想分析报告，发现成长轨迹

## 🔧 开发命令

```bash
# 开发环境
npm run dev                    # 启动前后端开发服务器
npm run dev:frontend          # 只启动前端
npm run dev:backend           # 只启动后端

# 构建
npm run build                 # 构建前后端
npm run build:frontend       # 构建前端
npm run build:backend        # 构建后端

# 数据库
cd backend && npm run migrate # 数据库迁移
cd backend && npm run studio  # 打开Prisma Studio
cd backend && npm run generate # 生成Prisma客户端
```

## 🎨 核心页面

- **首页** (`/`) - 应用介绍和功能概览
- **记录页** (`/record`) - AI引导记录想法和感受
- **对话页** (`/chat`) - 与过去自己进行对话
- **分析页** (`/analysis`) - 思想变化分析和洞察
- **登录/注册** (`/login`, `/register`) - 用户认证

## 📊 数据库设计

核心数据表：
- **users** - 用户信息
- **memory_records** - 记忆记录
- **conversations** - 对话记录
- **thought_analysis** - 思想分析结果

详细设计请参考 [数据库设计文档](./docs/database-design.md)

## 🚧 待开发功能

- [ ] OpenAI API集成实现真实AI对话
- [ ] 高级思想分析算法
- [ ] 数据可视化图表
- [ ] 记录分享功能
- [ ] 移动端适配
- [ ] 多语言支持

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目使用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

## 💝 致谢

- React 和 Node.js 生态系统
- Tailwind CSS 提供的优秀设计系统
- Prisma 提供的现代化数据库工具

---

*通过与过去的自己对话，发现内心的成长轨迹。✨*