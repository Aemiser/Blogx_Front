# Blogx Vue

一个基于 Vue 3 构建的现代化博客平台，支持文章管理、用户系统、后台管理等功能。

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: SCSS
- **Markdown**: md-editor-v3, marked
- **HTTP 请求**: Axios

## 功能特性

### 用户功能
- 用户注册登录
- 文章浏览与阅读
- 文章收藏
- 评论系统
- 个人资料与设置
- 浏览历史
- 关注/粉丝
- AI 聊天助手
- 消息通知

### 后台管理
- 数据统计仪表盘
- 文章管理（发布、编辑、审核）
- 用户管理
- 图片管理
- 网站设置
- 操作日志

## 项目结构

```
src/
├── api/           # API 请求封装
├── components/    # 通用组件
├── composables/   # Vue 组合式函数
├── plugins/       # Vue 插件
├── router/        # 路由配置
├── stores/        # Pinia 状态管理
├── styles/        # 全局样式
├── types/         # TypeScript 类型定义
├── utils/         # 工具函数
└── views/         # 页面组件
    ├── admin/     # 后台管理页面
    ├── article/   # 文章相关页面
    ├── center/    # 用户中心页面
    ├── chat/      # AI 聊天页面
    ├── home/      # 首页
    ├── message/   # 消息页面
    ├── search/    # 搜索页面
    ├── settings/  # 设置页面
    └── user/      # 用户认证页面
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 代码检查与修复

```bash
npm run lint
```

## 许可证

MIT
