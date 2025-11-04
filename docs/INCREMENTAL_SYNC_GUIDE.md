# 📝 增量同步功能说明

## 🎯 功能概述

同步脚本已修改为**增量模式**，每次运行只同步**一篇新文章**，实现渐进式发布。

---

## 🔄 工作原理

### 核心逻辑

```
每次运行脚本时：
1. 遍历所有卷（volumes）
2. 对于每个卷，遍历其中的文章
3. 检查文章是否已存在于 app/articles/
   ├─ 已存在 → 跳过，添加到 _meta.ts
   ├─ 不存在 → 同步这篇文章
   └─ 同步后 → 停止处理，跳过剩余文章
4. 更新 _meta.ts 文件
```

### 📊 执行流程图

```
开始
  ↓
遍历 Volume I
  ├─ Article 1: 已存在 ✓
  ├─ Article 2: 已存在 ✓
  ├─ Article 3: 不存在 → 同步 🆕
  └─ 停止！跳过 Article 4, 5
  ↓
跳过 Volume II, III, IV...
  ↓
更新所有 _meta.ts
  ↓
结束
```

---

## 🚀 使用示例

### 场景 1：首次同步

**初始状态**：
- `articles/` 有 27 篇文章
- `app/articles/` 为空

**第 1 次运行**：
```bash
node scripts/sync-articles.js
```
输出：
```
🆕 Syncing new article: light-and-chaos-the-seven-days-of-creation
✅ Successfully synced: light-and-chaos-the-seven-days-of-creation
⏭️  Skipping remaining volumes (already synced one new article)
✅ Synchronization completed - ONE NEW ARTICLE SYNCED!
```

**第 2 次运行**：
```bash
node scripts/sync-articles.js
```
输出：
```
🆕 Syncing new article: adam-and-eve-the-forbidden-fruit-and-the-banishment
✅ Successfully synced: adam-and-eve-the-forbidden-fruit-and-the-banishment
⏭️  Skipping remaining volumes (already synced one new article)
✅ Synchronization completed - ONE NEW ARTICLE SYNCED!
```

**第 3-27 次运行**：
- 每次同步一篇新文章
- 直到所有文章都同步完成

**第 28 次运行**：
```bash
node scripts/sync-articles.js
```
输出：
```
✅ Synchronization completed - ALL ARTICLES ALREADY SYNCED!
🆕 New article synced: NO (all up to date)
```

---

### 场景 2：添加新文章

**当前状态**：
- `app/articles/` 已有 27 篇文章（全部同步）

**操作**：
```bash
# 1. 在 articles/ 中添加新文章
mkdir articles/volume-i-creation-and-fall/new-article
echo "# New Article" > articles/volume-i-creation-and-fall/new-article/page.md

# 2. 更新 _meta.ts
# 编辑 articles/volume-i-creation-and-fall/_meta.ts
# 添加: 'new-article': 'New Article Title',

# 3. 运行同步
node scripts/sync-articles.js
```

输出：
```
🆕 Syncing new article: new-article
✅ Successfully synced: new-article
✅ Synchronization completed - ONE NEW ARTICLE SYNCED!
```

---

### 场景 3：批量添加多篇文章

**操作**：
```bash
# 添加 3 篇新文章
mkdir articles/volume-i-creation-and-fall/article-a
mkdir articles/volume-i-creation-and-fall/article-b
mkdir articles/volume-ii-the-origin-of-faith/article-c

# 更新对应的 _meta.ts 文件
```

**同步过程**：

**第 1 次运行**：
```bash
node scripts/sync-articles.js
# 只同步 article-a
```

**第 2 次运行**：
```bash
node scripts/sync-articles.js
# 只同步 article-b
```

**第 3 次运行**：
```bash
node scripts/sync-articles.js
# 只同步 article-c
```

---

## 📋 日志说明

### 文章状态标识

| 标识 | 说明 |
|------|------|
| `✓ Already exists` | 文章已存在，跳过 |
| `🆕 Syncing new article` | 正在同步新文章 |
| `✅ Successfully synced` | 同步成功 |
| `⏭️ Skipped (will sync next time)` | 跳过（下次同步） |
| `⊘ Skipped (source not found)` | 源文件不存在 |

### 完成状态

| 消息 | 说明 |
|------|------|
| `ONE NEW ARTICLE SYNCED!` | 成功同步了一篇新文章 |
| `ALL ARTICLES ALREADY SYNCED!` | 所有文章都已同步 |

---

## 🔧 与 GitHub Actions 集成

### 自动化流程

当配合 GitHub Actions 使用时：

```yaml
# .github/workflows/sync-articles.yml
on:
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨 2:00 运行
```

**效果**：
- 每天自动同步一篇新文章
- 如果有 10 篇新文章，需要 10 天全部发布
- 实现渐进式、可控的内容发布

### 手动触发

如果想加快发布速度：

1. 进入 GitHub → Actions
2. 选择 "Sync Articles to App Directory"
3. 点击 "Run workflow"
4. 多次手动触发，每次同步一篇

---

## 🎯 优势

### 1. **渐进式发布**
- ✅ 每天发布一篇新内容
- ✅ 保持网站更新频率
- ✅ 避免一次性发布大量内容

### 2. **可控性**
- ✅ 可以随时停止发布
- ✅ 可以手动控制发布速度
- ✅ 可以预览每篇文章的效果

### 3. **安全性**
- ✅ 每次只修改一篇文章
- ✅ 出错影响范围小
- ✅ 易于回滚

### 4. **SEO 友好**
- ✅ 定期更新内容
- ✅ 搜索引擎更容易索引
- ✅ 提高网站活跃度

---

## 🔍 技术细节

### 同步状态追踪

脚本使用**目录存在性检查**来判断文章是否已同步：

```javascript
const alreadyExists = directoryExists(targetArticlePath);

if (alreadyExists) {
  // 已同步，跳过
} else if (!syncState.foundNewArticle) {
  // 未同步，且还没同步过新文章，执行同步
  copyDirectory(sourceArticlePath, targetArticlePath);
  syncState.foundNewArticle = true;
} else {
  // 未同步，但已经同步了一篇，跳过
}
```

### _meta.ts 更新策略

每次运行都会更新 `_meta.ts`，包含：
- ✅ 所有已存在的文章
- ✅ 刚刚同步的新文章
- ❌ 不包含未同步的文章

这确保了导航菜单始终只显示已发布的内容。

---

## 📊 对比：旧版 vs 新版

| 特性 | 旧版（全量同步） | 新版（增量同步） |
|------|----------------|----------------|
| **每次同步数量** | 所有文章 | 1 篇文章 |
| **发布速度** | 一次性全部发布 | 渐进式发布 |
| **适用场景** | 初始化、批量更新 | 日常更新、定期发布 |
| **GitHub Actions** | 每次推送全部同步 | 每天同步一篇 |
| **控制粒度** | 粗粒度 | 细粒度 |

---

## 🛠️ 故障排查

### 问题 1：脚本显示"已全部同步"，但实际还有文章未同步

**原因**：可能是 `articles/` 中的文章目录不存在或 `_meta.ts` 未更新

**解决**：
```bash
# 检查源文章是否存在
ls articles/volume-i-creation-and-fall/

# 检查 _meta.ts 是否包含该文章
cat articles/volume-i-creation-and-fall/_meta.ts
```

### 问题 2：想要一次性同步所有文章

**解决方案 1**：多次手动运行脚本
```bash
# 运行 27 次（假设有 27 篇文章）
for i in {1..27}; do node scripts/sync-articles.js; done
```

**解决方案 2**：临时使用旧版脚本
```bash
# 备份当前脚本
cp scripts/sync-articles.js scripts/sync-articles-incremental.js

# 从 Git 历史恢复旧版
git show HEAD~1:scripts/sync-articles.js > scripts/sync-articles-full.js

# 运行全量同步
node scripts/sync-articles-full.js

# 恢复增量版本
mv scripts/sync-articles-incremental.js scripts/sync-articles.js
```

### 问题 3：想要跳过某篇文章

**解决**：
```bash
# 创建一个空目录占位
mkdir app/articles/volume-i-creation-and-fall/article-to-skip

# 下次运行时会跳过这篇文章
node scripts/sync-articles.js
```

---

## 📚 相关文档

- **[README_SYNC.md](../README_SYNC.md)** - 同步系统总览
- **[QUICK_START.md](QUICK_START.md)** - 快速开始指南
- **[ARTICLE_SYNC_GUIDE.md](ARTICLE_SYNC_GUIDE.md)** - 完整使用指南

---

## 🎉 总结

增量同步功能让您可以：
- 🚀 每天自动发布一篇新文章
- 🎯 精确控制发布节奏
- 📊 保持网站持续更新
- 🛡️ 降低发布风险

**建议使用场景**：
- ✅ 日常内容更新
- ✅ 定期发布计划
- ✅ 渐进式内容上线

**不建议使用场景**：
- ❌ 初始化大量文章（建议临时使用全量同步）
- ❌ 紧急批量更新（建议手动多次运行）

---

*最后更新: 2025-11-04*  
*版本: 2.0.0 (增量同步)*

