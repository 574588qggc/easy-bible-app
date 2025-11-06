# Cloudflare Pages 部署指南

本项目已配置为可以部署到 Cloudflare Pages。按照以下步骤完成部署：

## 前置要求

- Cloudflare 账户
- GitHub 账户（已连接到此仓库）
- Node.js 20+ 和 npm

## 部署步骤

### 1. 获取 Cloudflare 凭证

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Account Settings** > **API Tokens**
3. 创建一个新的 API Token，权限设置为：
   - **Permissions**: `Cloudflare Pages - Edit`
   - **Account Resources**: 选择你的账户
4. 复制生成的 Token

### 2. 获取 Account ID

1. 在 Cloudflare Dashboard 中，进入 **Account Settings**
2. 在右侧找到 **Account ID**，复制它

### 3. 配置 GitHub Secrets

1. 进入你的 GitHub 仓库
2. 进入 **Settings** > **Secrets and variables** > **Actions**
3. 创建以下 secrets：
   - `CLOUDFLARE_API_TOKEN`: 粘贴你的 Cloudflare API Token
   - `CLOUDFLARE_ACCOUNT_ID`: 粘贴你的 Account ID

### 4. 推送代码到 GitHub

```bash
git add .
git commit -m "Add Cloudflare Pages deployment configuration"
git push origin main
```

### 5. 在 Cloudflare Pages 中创建项目

1. 登录 Cloudflare Dashboard
2. 进入 **Pages**
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权 GitHub 并选择 `Easy-Bible` 仓库
6. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
7. 点击 **Save and Deploy**

### 6. 自动部署

现在，每当你推送代码到 `main` 分支时，GitHub Actions 会自动：
1. 构建项目
2. 部署到 Cloudflare Pages

## 项目配置说明

- **next.config.mjs**: 已配置 `output: 'export'` 用于静态导出
- **.github/workflows/deploy.yml**: GitHub Actions 工作流配置
- **_redirects**: 处理 SPA 路由的重定向规则
- **.nojekyll**: 防止 Jekyll 处理文件

## 自定义域名

1. 在 Cloudflare Pages 项目设置中
2. 进入 **Custom domains**
3. 添加你的自定义域名
4. 按照说明更新 DNS 记录

## 故障排除

### 构建失败

检查 GitHub Actions 日志：
1. 进入仓库的 **Actions** 标签
2. 查看最新的工作流运行
3. 检查错误信息

### 页面显示 404

确保 `_redirects` 文件在构建输出中。检查 Cloudflare Pages 的构建日志。

### 样式或资源加载失败

检查 `next.config.mjs` 中的 `basePath` 配置是否正确。

## 本地测试

在部署前，可以本地测试静态导出：

```bash
npm run build
npx serve out
```

然后访问 `http://localhost:3000` 查看构建结果。

