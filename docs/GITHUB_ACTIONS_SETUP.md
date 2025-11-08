# GitHub Actions 设置指南

## 🔧 解决工作流触发问题

### 问题描述

当 GitHub Actions 工作流使用 `GITHUB_TOKEN` 推送代码时，为了防止无限循环，GitHub 不会触发其他工作流。这导致我们的自动同步任务推送到 `content-sync` 分支后，不会自动触发部署工作流。

### 解决方案：使用 Personal Access Token (PAT)

我们需要创建一个 Personal Access Token 并将其添加到 GitHub Secrets 中。

## 📋 设置步骤

### 1. 创建 Personal Access Token

1. 访问 GitHub Settings: https://github.com/settings/tokens
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 填写以下信息：
   - **Note**: `Easy Bible Auto Sync Token`
   - **Expiration**: 选择合适的过期时间（建议 90 days 或 1 year）
   - **Scopes**: 勾选以下权限：
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)

4. 点击 **"Generate token"**
5. **重要**: 复制生成的 token（只会显示一次）

### 2. 添加到 GitHub Secrets

1. 访问你的仓库: https://github.com/574588qggc/easy-bible-app
2. 点击 **Settings** 标签
3. 在左侧菜单中点击 **Secrets and variables** → **Actions**
4. 点击 **"New repository secret"**
5. 填写：
   - **Name**: `PAT_TOKEN`
   - **Secret**: 粘贴刚才复制的 token
6. 点击 **"Add secret"**

### 3. 验证设置

设置完成后，下次自动同步任务运行时，应该能够正确触发部署工作流。

## 🧪 测试工作流触发

你可以使用我们提供的测试脚本来验证设置是否正确：

```bash
# 运行工作流触发测试
node tests/workflow-trigger-test.js
```

## 📊 工作流配置说明

### sync-articles.yml 修改

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    ref: content-sync
    # 使用 PAT_TOKEN 以确保推送能触发其他工作流
    # 如果 PAT_TOKEN 不存在，回退到 GITHUB_TOKEN
    token: ${{ secrets.PAT_TOKEN || secrets.GITHUB_TOKEN }}
    fetch-depth: 0
```

### 工作原理

1. **有 PAT_TOKEN**: 使用 PAT 推送，能触发其他工作流 ✅
2. **无 PAT_TOKEN**: 使用 GITHUB_TOKEN，不会触发其他工作流 ❌

## 🔒 安全注意事项

1. **Token 权限**: 只授予必要的权限
2. **Token 过期**: 定期更新 token
3. **访问控制**: 只有仓库管理员能访问 secrets
4. **监控使用**: 定期检查 token 的使用情况

## 🚨 故障排除

### 问题：设置 PAT_TOKEN 后仍然不触发

**可能原因**:
1. Token 权限不足
2. Token 已过期
3. Secret 名称错误

**解决方法**:
1. 检查 token 权限是否包含 `repo` 和 `workflow`
2. 重新生成 token
3. 确认 secret 名称为 `PAT_TOKEN`

### 问题：如何验证 PAT_TOKEN 是否生效

**方法**:
1. 查看工作流日志，确认使用的是 PAT_TOKEN
2. 运行测试脚本验证触发机制
3. 手动触发同步任务，观察是否触发部署

## 📈 预期效果

设置完成后，自动化流程应该是：

```
定时任务 (每天 2:00 UTC)
    ↓
同步文章到 content-sync 分支
    ↓
使用 PAT_TOKEN 推送
    ↓
自动触发部署工作流 ✅
    ↓
部署到 Cloudflare Pages
```

## 📝 相关文档

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Triggering a workflow from a workflow](https://docs.github.com/en/actions/using-workflows/triggering-a-workflow#triggering-a-workflow-from-a-workflow)
