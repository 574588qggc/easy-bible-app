# 🚀 部署策略更新说明

## 📋 重要变更

**更新时间**: 2025-11-06

### ⚡ 核心变更

我们已经调整了分支策略，现在：

- ✅ **content-sync 分支** → 生产环境（自动部署）
- ✅ **main 分支** → 开发环境（不部署）

---

## 🔄 新的工作流程

### 之前的策略 ❌

```
定时任务 → content-sync 分支 → 手动合并到 main → 部署
```

**问题**：
- 需要手动审核和合并
- 内容发布不够及时
- main 分支混合了开发和生产内容

### 现在的策略 ✅

```
定时任务 → content-sync 分支 → 自动部署到生产环境
开发工作 → main 分支 → 不部署（开发测试）
```

**优势**：
- ✅ 内容自动上线，无需手动干预
- ✅ 开发和生产环境完全分离
- ✅ main 分支专注于代码开发
- ✅ content-sync 分支专注于内容发布

---

## 📊 分支对比

| 特性 | main 分支 | content-sync 分支 |
|------|----------|------------------|
| **用途** | 代码开发 | 生产环境内容 |
| **更新方式** | 手动提交 | GitHub Actions 自动 |
| **部署** | ❌ 不部署 | ✅ 自动部署 |
| **内容** | 开发代码、测试功能 | 同步的文章内容 |
| **稳定性** | 可能不稳定 | 稳定的生产内容 |

---

## 🔧 配置变更详情

### 1. 部署工作流（deploy.yml）

**之前**：
```yaml
on:
  push:
    branches:
      - main  # 监听 main 分支
```

**现在**：
```yaml
on:
  push:
    branches:
      - content-sync  # 监听 content-sync 分支
```

### 2. 同步工作流（sync-articles.yml）

**保持不变**：
- 仍然在 content-sync 分支工作
- 每天自动同步一篇文章
- 自动提交和推送

**新增效果**：
- 推送到 content-sync 后自动触发部署
- 新文章自动上线

---

## 🎯 使用场景

### 场景 1: 自动发布新文章 ✅

```
每天 2:00 UTC
    ↓
GitHub Actions 运行
    ↓
同步一篇新文章到 content-sync
    ↓
自动提交和推送
    ↓
自动触发部署
    ↓
新文章上线！
```

**无需任何手动操作！**

### 场景 2: 开发新功能 ✅

```bash
# 在 main 分支开发
git checkout main

# 开发代码
# 编辑文件...

# 提交更改
git add .
git commit -m "Add new feature"
git push origin main

# 不会触发部署，可以安全测试
```

### 场景 3: 手动添加内容 ✅

```bash
# 切换到 content-sync 分支
git checkout content-sync

# 添加或编辑文章
# 编辑 articles/ 目录...

# 运行同步脚本
node scripts/sync-articles.js

# 提交并推送
git add .
git commit -m "Add new article"
git push origin content-sync

# 自动触发部署！
```

### 场景 4: 将开发代码合并到生产 ✅

```bash
# 当 main 分支的新功能开发完成并测试通过后
git checkout content-sync
git merge main
git push origin content-sync

# 自动部署新功能到生产环境
```

---

## 📝 日常工作流程

### 作为内容管理者

**你不需要做任何事情！**

- ✅ GitHub Actions 每天自动同步文章
- ✅ 自动部署到生产环境
- ✅ 新内容自动上线

### 作为开发者

**在 main 分支自由开发**：

```bash
# 1. 切换到 main 分支
git checkout main

# 2. 开发新功能
# 编辑代码...

# 3. 提交和推送
git add .
git commit -m "Develop new feature"
git push origin main

# 4. 测试完成后，合并到 content-sync
git checkout content-sync
git merge main
git push origin content-sync  # 这会触发部署
```

---

## ⚠️ 重要注意事项

### 1. 不要在 main 分支添加生产内容

❌ **错误做法**：
```bash
git checkout main
# 添加文章到 articles/
git push origin main  # 不会部署！
```

✅ **正确做法**：
```bash
git checkout content-sync
# 添加文章到 articles/
git push origin content-sync  # 会自动部署！
```

### 2. 开发代码在 main 分支

✅ **正确做法**：
```bash
git checkout main
# 开发新功能
git push origin main  # 不会部署，安全测试
```

### 3. 合并方向

**开发 → 生产**：
```bash
git checkout content-sync
git merge main  # 将开发代码合并到生产
git push origin content-sync  # 部署
```

**不要反向合并**（除非你知道自己在做什么）：
```bash
# ❌ 不推荐
git checkout main
git merge content-sync  # 可能会混淆开发和生产内容
```

---

## 🔍 验证部署

### 检查 GitHub Actions

1. 访问: https://github.com/574588qggc/easy-bible-app/actions
2. 查看 "Deploy to Cloudflare Pages" 工作流
3. 确认在 content-sync 分支推送后触发

### 检查 Cloudflare Pages

1. 访问 Cloudflare Pages 控制台
2. 查看最新部署
3. 确认部署来自 content-sync 分支

---

## 📚 相关文档

- [分支策略完整说明](./BRANCH_STRATEGY.md)
- [快速开始指南](./BRANCH_QUICK_START.md)
- [设置完成总结](./BRANCH_SETUP_COMPLETE.md)

---

## 🎉 总结

### 新策略的优势

1. **✅ 自动化程度更高**
   - 内容自动同步
   - 自动部署
   - 无需手动干预

2. **✅ 开发更灵活**
   - main 分支可以自由开发
   - 不用担心影响生产环境
   - 测试更安全

3. **✅ 职责更清晰**
   - content-sync = 生产环境
   - main = 开发环境
   - 不会混淆

4. **✅ 发布更及时**
   - 新文章每天自动上线
   - 不需要等待手动合并
   - 用户能更快看到新内容

---

**最后更新**: 2025-11-06  
**状态**: ✅ 已生效

