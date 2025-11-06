# Cloudflare Pages 快速部署指南

## 🚀 快速开始（5分钟）

### 第1步：获取 Cloudflare 凭证

1. 访问 https://dash.cloudflare.com
2. 登录你的 Cloudflare 账户
3. 进入 **Account Settings** > **API Tokens**
4. 点击 **Create Token**
5. 选择 **Edit Cloudflare Pages** 模板
6. 点击 **Create Token** 并复制 Token

### 第2步：获取 Account ID

1. 在 Cloudflare Dashboard 中
2. 进入 **Account Settings**
3. 复制 **Account ID**（在右侧面板）

### 第3步：配置 GitHub Secrets

1. 进入 GitHub 仓库：https://github.com/574588qggc/Easy-Bible
2. 点击 **Settings** > **Secrets and variables** > **Actions**
3. 点击 **New repository secret**
4. 创建两个 secrets：

   **Secret 1:**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: 粘贴你的 Cloudflare API Token

   **Secret 2:**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: 粘贴你的 Account ID

### 第4步：推送代码

```bash
git add .
git commit -m "Add Cloudflare Pages deployment"
git push origin main
```

### 第5步：在 Cloudflare 创建项目

1. 访问 https://dash.cloudflare.com/pages
2. 点击 **Create a project**
3. 选择 **Connect to Git**
4. 授权 GitHub 并选择 `Easy-Bible` 仓库
5. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
6. 点击 **Save and Deploy**

### 第6步：完成！

部署完成后，你会获得一个 `*.pages.dev` 的 URL。

## 📝 后续推送

现在，每当你推送代码到 `main` 分支时，会自动：
1. 运行 GitHub Actions 构建
2. 部署到 Cloudflare Pages

## 🔗 自定义域名（可选）

1. 在 Cloudflare Pages 项目中
2. 进入 **Custom domains**
3. 添加你的域名
4. 按照说明更新 DNS 记录

## ✅ 验证部署

访问你的 Cloudflare Pages URL，应该能看到 Easy Bible 网站。

## 📚 详细文档

查看 `CLOUDFLARE_DEPLOYMENT.md` 获取更多信息。

