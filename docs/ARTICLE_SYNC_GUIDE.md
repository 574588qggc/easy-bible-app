# 📚 文章同步指南

本文档说明如何使用自动化脚本将 `articles/` 目录中的文章同步到 `app/articles/` 目录。

## 🎯 功能特点

- ✅ **动态生成 _meta.ts**：只包含实际存在的文章
- ✅ **保持格式一致**：完全保持原始 meta 文件的格式（单引号、trailing comma、缩进等）
- ✅ **保持目录结构**：完整复制文章目录结构
- ✅ **智能同步**：自动检测哪些文章存在，避免404错误
- ✅ **自动化运行**：支持定时、手动和文件变更触发

## 📁 目录结构

### 源目录（articles/）
```
articles/
├── _meta.ts                          # 根 meta 文件（列出所有卷）
├── volume-i-creation-and-fall/
│   ├── _meta.ts                      # 该卷的 meta 文件
│   ├── light-and-chaos.../
│   │   └── page.md
│   ├── adam-and-eve.../
│   │   └── page.md
│   └── ...
├── volume-ii-the-origin-of-faith/
│   ├── _meta.ts
│   └── ...
└── ...
```

### 目标目录（app/articles/）
```
app/articles/
├── _meta.ts                          # 动态生成（只包含已同步的卷）
├── volume-i-creation-and-fall/
│   ├── _meta.ts                      # 动态生成（只包含已同步的文章）
│   ├── light-and-chaos.../
│   │   └── page.md
│   └── ...
└── ...
```

## 🚀 使用方法

### 方法一：GitHub Actions 自动运行

#### 1. 定时自动同步
工作流已配置为每天凌晨 2:00 (UTC) 自动运行，无需手动操作。

#### 2. 手动触发同步
1. 进入 GitHub repository
2. 点击 **Actions** 标签
3. 选择 **"Sync Articles to App Directory"**
4. 点击 **"Run workflow"**
5. 选择是否启用 **Dry Run**（预览模式）
6. 点击 **"Run workflow"** 确认

#### 3. 文件变更自动触发
当您推送代码到 `main` 分支，且修改了 `articles/` 目录下的文件时，会自动触发同步。

### 方法二：本地运行脚本

```bash
# 在项目根目录运行
node scripts/sync-articles.js
```

## 🔧 工作原理

### 同步流程

1. **读取源 meta 文件**
   - 读取 `articles/_meta.ts` 获取所有卷的列表
   - 读取每个卷的 `_meta.ts` 获取文章列表

2. **检查文章是否存在**
   - 遍历每个卷的文章列表
   - 检查文章目录是否实际存在

3. **复制存在的文章**
   - 将存在的文章目录完整复制到 `app/articles/`
   - 保持原始目录结构

4. **生成新的 meta 文件**
   - 只包含已复制的文章
   - 保持原始格式（单引号、trailing comma、缩进等）

### Meta 文件格式

脚本会严格保持原始格式：

```typescript
export default {
  'article-key-1': '📖 Article Title 1',
  'article-key-2': '✨ Article Title 2',
  'article-key-3': '🌟 Article Title 3',
}
```

**格式特点**：
- 使用单引号 `'`
- 每行末尾有逗号（trailing comma）
- 2个空格缩进
- 文件末尾有空行

## 📊 示例场景

### 场景一：渐进式发布文章

**初始状态**：
```
articles/volume-i-creation-and-fall/
├── _meta.ts (列出5篇文章)
├── light-and-chaos.../  ✅ 存在
├── adam-and-eve.../     ❌ 不存在
├── cain-and-abel.../    ❌ 不存在
├── noah-and-flood.../   ❌ 不存在
└── tower-of-babel.../   ❌ 不存在
```

**同步后**：
```
app/articles/volume-i-creation-and-fall/
├── _meta.ts (只列出1篇文章)
└── light-and-chaos.../  ✅ 已复制
```

生成的 `_meta.ts`：
```typescript
export default {
  'light-and-chaos-the-seven-days-of-creation': '🌟 1. Light and Chaos： The Seven Days of Creation',
}
```

### 场景二：逐步添加文章

当您在 `articles/` 中添加新文章后：

1. 创建新文章目录和 `page.md`
2. 推送到 GitHub（或等待定时任务）
3. 自动同步脚本运行
4. 新文章被复制到 `app/articles/`
5. `_meta.ts` 自动更新，包含新文章

## ⚙️ 配置选项

### 修改同步频率

编辑 `.github/workflows/sync-articles.yml`：

```yaml
schedule:
  - cron: '0 2 * * *'  # 每天 2:00 AM UTC
  # - cron: '0 2 * * 1'  # 每周一 2:00 AM UTC
  # - cron: '0 2 1 * *'  # 每月1号 2:00 AM UTC
```

### 修改源/目标目录

编辑 `scripts/sync-articles.js`：

```javascript
const SOURCE_DIR = 'articles';      // 源目录
const TARGET_DIR = 'app/articles';  // 目标目录
```

## 🔍 Dry Run 模式

使用 Dry Run 模式可以预览变更而不实际提交：

1. 手动触发工作流
2. 勾选 **"Dry run"** 选项
3. 查看 Actions 日志中的变更预览
4. 不会创建 commit 或推送代码

## 📝 查看同步日志

### GitHub Actions 日志
1. 进入 **Actions** 标签
2. 选择最近的工作流运行
3. 查看详细日志

### 同步摘要
每次运行后会生成摘要，包括：
- 同步的卷数量
- 复制的文章数量
- 变更的文件列表

## ⚠️ 注意事项

1. **备份重要数据**
   - 脚本会覆盖 `app/articles/` 中的同名文件
   - 建议保留 `articles/` 作为源文件

2. **Meta 文件格式**
   - 确保 `_meta.ts` 格式正确
   - 使用单引号和 trailing comma

3. **文章目录命名**
   - 目录名应与 `_meta.ts` 中的 key 完全匹配
   - 使用小写字母和连字符

4. **Git 权限**
   - 确保 `GITHUB_TOKEN` 有推送权限
   - 工作流会自动创建 commit

## 🐛 故障排除

### 问题：同步后文章不显示

**检查**：
1. 确认文章目录存在于 `articles/` 中
2. 确认目录名与 `_meta.ts` 中的 key 匹配
3. 确认文章目录中有 `page.md` 文件

### 问题：Meta 文件格式错误

**解决**：
1. 检查是否使用单引号
2. 检查是否有 trailing comma
3. 检查缩进是否为2个空格

### 问题：工作流运行失败

**检查**：
1. 查看 Actions 日志中的错误信息
2. 确认 Node.js 版本兼容（需要 v20）
3. 确认文件路径正确

## 📞 获取帮助

如果遇到问题：
1. 查看 GitHub Actions 日志
2. 检查本文档的故障排除部分
3. 在 repository 中创建 Issue

## 🎉 最佳实践

1. **定期检查同步结果**
   - 查看 Actions 运行状态
   - 验证网站上的文章显示正常

2. **使用 Dry Run 测试**
   - 重大变更前先使用 Dry Run
   - 确认变更符合预期

3. **保持源文件整洁**
   - 删除不需要的文章目录
   - 保持 `_meta.ts` 与实际文件同步

4. **版本控制**
   - 每次同步都会创建 commit
   - 可以随时回滚到之前的版本

