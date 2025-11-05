# 📖 简单圣经 (Easy Bible)

一个基于 Nextra 框架构建的现代化圣经在线阅读平台。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![Nextra](https://img.shields.io/badge/Nextra-4.6.0-blue)

## ✨ 功能特点

- 🔍 **强大的搜索功能** - 快速查找任何经文
- 📱 **响应式设计** - 在任何设备上都能完美阅读
- 🌓 **深色模式** - 支持深色/浅色主题切换,保护您的眼睛
- 📖 **清晰的导航** - 轻松浏览各卷书和章节
- ⚡ **快速加载** - 基于 Next.js 的优化性能
- ♿ **无障碍访问** - 遵循 Web 无障碍标准
- 🎨 **美观的界面** - 现代化的设计风格

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 或 pnpm

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/easy-bible.git
cd easy-bible

# 安装依赖
npm install
```

### 运行

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 运行生产版本
npm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

## 📁 项目结构

```
Easy Bible/
├── app/                           # Next.js App Router 目录
│   ├── _meta.ts                   # 根导航配置
│   ├── layout.jsx                 # 根布局组件
│   ├── page.mdx                   # 首页
│   ├── about/                     # 关于页面
│   │   └── page.mdx
│   ├── old-testament/             # 旧约圣经
│   │   ├── _meta.ts              # 旧约导航配置
│   │   ├── page.mdx              # 旧约概览
│   │   ├── genesis/              # 创世记
│   │   │   └── page.mdx
│   │   └── psalms/               # 诗篇
│   │       └── page.mdx
│   └── new-testament/             # 新约圣经
│       ├── _meta.ts              # 新约导航配置
│       ├── page.mdx              # 新约概览
│       ├── john/                 # 约翰福音
│       │   └── page.mdx
│       └── romans/               # 罗马书
│           └── page.mdx
├── mdx-components.tsx             # MDX 组件配置
├── next.config.mjs                # Next.js 配置
├── package.json                   # 项目依赖
├── theme.config.jsx               # Nextra 主题配置
└── README.md                      # 项目说明
```

## 🛠️ 技术栈

- **[Next.js](https://nextjs.org/)** - React 框架
- **[Nextra](https://nextra.site/)** - 文档站点生成器
- **[React](https://react.dev/)** - UI 库
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS 框架
- **[MDX](https://mdxjs.com/)** - Markdown + JSX

## 📖 内容结构

### 旧约圣经

- **创世记** - 宇宙、地球和人类的起源
- **诗篇** - 诗歌和祷告集

### 新约圣经

- **约翰福音** - 耶稣是神的儿子
- **罗马书** - 因信称义的核心教义

## 🎯 添加新内容

### 添加新书卷

1. 在 `app/old-testament/` 或 `app/new-testament/` 下创建新目录
2. 在目录中创建 `page.mdx` 文件
3. 在对应的 `_meta.ts` 文件中添加导航配置

示例:

```bash
# 创建新书卷目录
mkdir app/old-testament/exodus

# 创建内容文件
touch app/old-testament/exodus/page.mdx
```

在 `app/old-testament/_meta.ts` 中添加:

```typescript
export default {
  genesis: '创世记',
  exodus: '出埃及记',  // 新添加
  psalms: '诗篇'
}
```

### MDX 文件格式

```mdx
# 书卷标题

书卷简介...

## 📚 书卷概览

- **作者**: 作者名
- **写作时间**: 时间
- **主题**: 主题

## 🌟 主要内容

内容描述...

## 📖 精选经文

> **1** 经文内容...
```

## 🎨 自定义主题

编辑 `theme.config.jsx` 文件来自定义网站外观:

```jsx
export default {
  logo: <span>📖 简单圣经</span>,
  project: {
    link: 'https://github.com/yourusername/easy-bible'
  },
  // ... 更多配置
}
```

## 📝 开发指南

### 本地开发

```bash
# 启动开发服务器
npm run dev
```

开发服务器支持热重载,修改文件后会自动刷新页面。

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm start
```

### 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. Vercel 会自动检测 Next.js 并部署

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Nextra](https://nextra.site/) - 优秀的文档框架
- [Next.js](https://nextjs.org/) - 强大的 React 框架
- [Vercel](https://vercel.com/) - 出色的部署平台

## 📧 联系方式

如有问题或建议,请通过以下方式联系:

- GitHub Issues: [https://github.com/yourusername/easy-bible/issues](https://github.com/yourusername/easy-bible/issues)
- Email: contact@example.com

---

**愿神的话语成为您脚前的灯，路上的光。** 📖✨

