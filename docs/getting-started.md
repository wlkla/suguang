# 快速启动指南 🚀

## 第一次运行项目

### 前置要求
- Node.js 16+ 
- npm 或 yarn

### 启动步骤

#### 1. 安装项目依赖
```bash
# 在项目根目录下
npm install
npm run install:all
```

#### 2. 配置环境变量
```bash
# 复制环境变量模板
cp backend/.env.example backend/.env

# 编辑配置（可选，默认配置即可运行）
nano backend/.env
```

#### 3. 初始化数据库
```bash
cd backend
npm run generate    # 生成Prisma客户端
npm run migrate      # 创建数据库表
cd ..
```

#### 4. 启动开发服务器
```bash
npm run dev
```

成功启动后可访问：
- 前端: http://localhost:3000
- 后端API: http://localhost:3001
- 健康检查: http://localhost:3001/health

## 使用指南

### 1. 注册账号
- 访问 http://localhost:3000/register
- 输入用户名、邮箱和密码完成注册

### 2. 开始记录想法
- 点击"记录想法"或访问 `/record`
- 可以选择"AI引导模式"让AI帮助你深入思考
- 记录你的想法、心情和标签

### 3. 与过去对话
- 访问"对话过去"页面 (`/chat`)
- 选择一段历史记录
- 开始与过去的自己进行对话

### 4. 分析思想变化
- 访问"思想分析"页面 (`/analysis`)
- 选择时间范围生成分析报告
- 查看情绪趋势、关键时刻和影响因素

## 开发相关命令

```bash
# 开发环境
npm run dev                    # 启动前后端开发服务器
npm run dev:frontend          # 只启动前端
npm run dev:backend           # 只启动后端

# 构建
npm run build                 # 构建整个项目
npm run build:frontend       # 只构建前端
npm run build:backend        # 只构建后端

# 数据库管理
cd backend
npm run studio               # 打开Prisma Studio数据库管理界面
npm run migrate              # 运行数据库迁移
npm run generate             # 重新生成Prisma客户端
```

## 常见问题

### Q: 端口被占用怎么办？
A: 修改 `.env` 文件中的 `PORT` 配置，或者关闭占用端口的程序。

### Q: 数据库连接失败？
A: 确保执行了 `npm run migrate` 来创建数据库文件。

### Q: 前端页面空白？
A: 检查控制台错误，确保后端API正常运行在3001端口。

### Q: 想要重置数据库？
A: 删除 `database/memory-dialogue.db` 文件，然后重新运行 `npm run migrate`。

## 下一步

项目运行成功后，你可以：

1. **体验核心功能** - 注册账号并开始记录想法
2. **自定义配置** - 根据需要修改UI样式或功能逻辑
3. **集成AI服务** - 添加OpenAI API Key实现真实的AI对话
4. **数据分析增强** - 改进思想分析算法
5. **功能扩展** - 添加更多创新功能

祝你使用愉快！ 🎉