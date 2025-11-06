# 🚀 分支管理快速开始

## 📋 快速概览

Easy Bible 使用**双分支策略**：

- **`main`** - 开发主分支（用于代码开发）
- **`content-sync`** - 生产环境内容分支（自动同步并部署）

## ⚡ 快速开始

### 1️⃣ 初始化 content-sync 分支

**使用 npm 脚本（推荐）**：
```bash
npm run branch:init
```

**或使用 PowerShell 脚本**：
```powershell
.\scripts\setup-branches.ps1 init
```

**或手动创建**：
```bash
# 确保在 main 分支
git checkout main
git pull origin main

# 创建并推送 content-sync 分支
git checkout -b content-sync
git push -u origin content-sync

# 返回 main 分支
git checkout main
```

### 2️⃣ 查看分支状态

```bash
npm run branch:status
```

这会显示：
- 本地和远程分支列表
- content-sync 和 main 的差异
- 待合并的提交

### 3️⃣ 同步分支

定期同步所有分支以保持最新：

```bash
npm run branch:sync
```

### 4️⃣ 开发新功能

在 main 分支进行开发：

```bash
# 切换到 main 分支
git checkout main

# 开发代码...
# 提交更改
git add .
git commit -m "Add new feature"
git push origin main
```

注意：推送到 main 分支不会触发部署

## 📊 工作流程图

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions                        │
│                  (每天 2:00 UTC 运行)                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ content-sync  │ ◄─── 自动同步文章
              │    分支       │      (生产环境)
              └───────┬───────┘
                      │
                      │ 自动触发部署
                      ▼
              ┌───────────────┐
              │ Cloudflare    │ ◄─── 自动部署
              │    Pages      │      新内容上线
              └───────────────┘

              ┌───────────────┐
              │     main      │ ◄─── 开发分支
              │     分支      │      (不部署)
              └───────────────┘
```

## 🔧 常用命令

### 查看分支
```bash
# 查看所有分支
git branch -a

# 查看当前分支
git branch --show-current

# 查看分支状态
npm run branch:status
```

### 切换分支
```bash
# 切换到 main
git checkout main

# 切换到 content-sync
git checkout content-sync
```

### 查看差异
```bash
# 查看 content-sync 和 main 的差异
git diff main..content-sync

# 查看待合并的提交
git log main..content-sync --oneline
```

### 手动合并
```bash
# 方式 1: 使用脚本（推荐）
npm run branch:merge

# 方式 2: 手动合并
git checkout main
git merge content-sync
git push origin main
```

## 🤖 GitHub Actions 配置

### 自动同步设置

GitHub Actions 已配置为：
- ✅ 每天凌晨 2:00 UTC（北京时间 10:00）自动运行
- ✅ 在 `content-sync` 分支上同步文章
- ✅ 自动提交和推送到 `content-sync` 分支

### 手动触发同步

**在 GitHub 网页上**：
1. 访问仓库的 Actions 页面
2. 选择 "Sync Articles to App Directory"
3. 点击 "Run workflow"
4. 选择 `content-sync` 分支
5. （可选）勾选 "Create PR to main branch"
6. 点击 "Run workflow"

**使用 GitHub CLI**：
```bash
gh workflow run "Sync Articles to App Directory"
```

### 自动创建 PR

如果希望自动创建 PR 到 main 分支，在手动触发时勾选 "Create PR to main branch" 选项。

## 📝 日常工作流程

### 场景 1: 自动化内容同步（推荐）

1. **等待自动同步**
   - GitHub Actions 每天自动运行
   - 自动同步一篇新文章到 `content-sync` 分支

2. **查看同步结果**
   ```bash
   npm run branch:status
   ```

3. **定期合并到 main**（每周或每月）
   ```bash
   npm run branch:merge
   ```

### 场景 2: 手动添加内容

1. **在 content-sync 分支工作**
   ```bash
   git checkout content-sync
   ```

2. **添加或修改文章**
   ```bash
   # 编辑 articles/ 目录中的文件
   ```

3. **运行同步脚本**
   ```bash
   node scripts/sync-articles.js
   ```

4. **提交更改**
   ```bash
   git add .
   git commit -m "Add new article"
   git push origin content-sync
   ```

5. **合并到 main**
   ```bash
   git checkout main
   npm run branch:merge
   ```

### 场景 3: 代码开发

1. **从 main 创建功能分支**
   ```bash
   git checkout main
   git checkout -b feature/my-feature
   ```

2. **开发和测试**
   ```bash
   # 编辑代码
   npm test
   ```

3. **提交和推送**
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/my-feature
   ```

4. **创建 PR 到 main**
   - 在 GitHub 上创建 Pull Request
   - 审核后合并

## ⚠️ 注意事项

### 1. 不要直接在 main 分支修改内容

❌ **错误做法**：
```bash
git checkout main
# 编辑文章...
git commit -m "Add article"
git push origin main
```

✅ **正确做法**：
```bash
git checkout content-sync
# 编辑文章...
git commit -m "Add article"
git push origin content-sync
# 然后合并到 main
```

### 2. 定期同步分支

避免分支差异过大：
```bash
# 每周运行一次
npm run branch:sync
npm run branch:merge
```

### 3. 解决合并冲突

如果合并时出现冲突：
```bash
# 1. 查看冲突文件
git status

# 2. 手动编辑冲突文件
# 编辑器会显示冲突标记 <<<<<<<, =======, >>>>>>>

# 3. 标记为已解决
git add .
git commit -m "Resolve merge conflicts"

# 4. 推送
git push origin main
```

## 🔍 故障排除

### 问题 1: 分支不存在

```bash
# 重新初始化
npm run branch:init
```

### 问题 2: 分支落后太多

```bash
# 同步分支
npm run branch:sync

# 或手动更新
git checkout content-sync
git merge main
git push origin content-sync
```

### 问题 3: GitHub Actions 失败

1. 检查 Actions 日志
2. 确保 `content-sync` 分支存在
3. 确保 `articles/` 目录存在
4. 运行本地测试：
   ```bash
   npm test
   npm run test:sync
   ```

## 📚 相关文档

- [完整分支策略](./BRANCH_STRATEGY.md) - 详细的分支管理说明
- [文章同步指南](./ARTICLE_SYNC_GUIDE.md) - 文章同步详细说明
- [测试指南](./TESTING_GUIDE.md) - 测试相关文档

## 💡 最佳实践

1. ✅ 让 GitHub Actions 自动处理内容同步
2. ✅ 定期（每周/每月）合并 content-sync 到 main
3. ✅ 在合并前运行测试
4. ✅ 审核内容后再合并到 main
5. ✅ 保持分支同步，避免差异过大

---

**最后更新**: 2025-11-06

