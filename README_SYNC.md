# 📚 文章自动同步系统

## ✅ 已完成配置

本项目已成功配置文章自动同步系统，可以将 `articles/` 目录中的文章自动同步到 `app/articles/` 目录。

### 🎯 核心功能

- ✅ **动态生成 _meta.ts**：只包含实际存在的文章，避免404错误
- ✅ **保持格式一致**：完全保持原始 meta 文件格式（单引号、trailing comma、缩进）
- ✅ **保持目录结构**：完整复制文章目录结构
- ✅ **智能同步**：自动检测哪些文章存在
- ✅ **自动化运行**：支持定时、手动和文件变更触发

### 📁 已创建的文件

```
.
├── scripts/
│   ├── sync-articles.js          # 同步脚本（核心）
│   └── test-sync.js               # 测试脚本
├── .github/workflows/
│   └── sync-articles.yml          # GitHub Actions 工作流
├── docs/
│   ├── ARTICLE_SYNC_GUIDE.md      # 完整使用指南
│   └── QUICK_START.md             # 快速开始指南
├── app/
│   ├── _meta.ts                   # 应用导航配置（已更新）
│   └── articles/                  # 同步后的文章目录
│       ├── _meta.ts               # 动态生成
│       ├── volume-i-creation-and-fall/
│       │   ├── _meta.ts           # 动态生成
│       │   └── ...
│       └── ...
└── README_SYNC.md                 # 本文件
```

## 🚀 快速使用

### 本地测试

```bash
# 1. 测试环境
node scripts/test-sync.js

# 2. 运行同步
node scripts/sync-articles.js

# 3. 查看结果
ls app/articles/
cat app/articles/_meta.ts
```

### GitHub Actions

#### 自动触发
- ⏰ **定时**：每天凌晨 2:00 (UTC) 自动运行
- 📝 **文件变更**：推送到 `main` 分支且修改了 `articles/` 目录

#### 手动触发
1. 进入 GitHub → Actions
2. 选择 "Sync Articles to App Directory"
3. 点击 "Run workflow"

## 📊 同步结果

### 初次同步统计

```
✅ 同步完成！
📊 总计：7/7 卷已同步
📄 文章：27 篇
📁 目标目录：app/articles
```

### 生成的文件

所有 `_meta.ts` 文件已正确生成，格式与原始文件完全一致：

**app/articles/_meta.ts**：
```typescript
export default {
  'volume-i-creation-and-fall': '📖 Volume I： Creation and Fall',
  'volume-ii-the-origin-of-faith': '📖 Volume II： The Origin of Faith',
  'volume-iii-exodus-and-the-law': '📖 Volume III： Exodus and the Law',
  'volume-iv-kingdom-and-war': '📖 Volume IV： Kingdom and War',
  'volume-v-exile-and-hope': '📖 Volume V： Exile and Hope',
  'volume-vi-redemption-and-rebirth': '📖 Volume VI： Redemption and Rebirth',
  'volume-vii-legacy-and-revelation': '📖 Volume VII： Legacy and Revelation',
}
```

## 🎯 使用场景

### 场景 1：渐进式发布

如果您想逐步发布文章：

1. 在 `articles/` 中只保留要发布的文章目录
2. 运行同步脚本
3. 生成的 `_meta.ts` 只包含已发布的文章
4. 不会出现404错误

**示例**：
```
articles/volume-i-creation-and-fall/
├── _meta.ts (列出5篇文章)
├── article-1/ ✅ 存在
├── article-2/ ❌ 不存在
└── article-3/ ✅ 存在

同步后 →

app/articles/volume-i-creation-and-fall/
├── _meta.ts (只列出2篇文章)
├── article-1/ ✅
└── article-3/ ✅
```

### 场景 2：添加新文章

```bash
# 1. 在 articles/ 中创建新文章
mkdir -p articles/volume-i-creation-and-fall/new-article
echo "# New Article" > articles/volume-i-creation-and-fall/new-article/page.md

# 2. 更新 _meta.ts
# 编辑 articles/volume-i-creation-and-fall/_meta.ts
# 添加: 'new-article': 'New Article Title',

# 3. 提交并推送（自动触发同步）
git add .
git commit -m "Add new article"
git push
```

### 场景 3：批量同步

如果所有文章都准备好了，直接推送即可，系统会自动同步所有内容。

## 📖 详细文档

- **[快速开始指南](docs/QUICK_START.md)** - 5分钟快速上手
- **[完整使用指南](docs/ARTICLE_SYNC_GUIDE.md)** - 详细功能说明
- **[同步脚本](scripts/sync-articles.js)** - 核心实现代码
- **[工作流配置](.github/workflows/sync-articles.yml)** - GitHub Actions 配置

## 🔍 验证同步

### 检查文件结构

```bash
# 查看同步的卷
ls app/articles/

# 输出：
# volume-i-creation-and-fall/
# volume-ii-the-origin-of-faith/
# volume-iii-exodus-and-the-law/
# volume-iv-kingdom-and-war/
# volume-v-exile-and-hope/
# volume-vi-redemption-and-rebirth/
# volume-vii-legacy-and-revelation/
# _meta.ts
```

### 检查 meta 文件

```bash
# 查看根 meta 文件
cat app/articles/_meta.ts

# 查看某个卷的 meta 文件
cat app/articles/volume-i-creation-and-fall/_meta.ts
```

### 在网站上查看

部署后访问：
```
https://your-site.pages.dev/articles
```

导航菜单应该显示：
```
📚 圣经故事
  ├─ 📖 Volume I: Creation and Fall
  │   ├─ 🌟 1. Light and Chaos...
  │   ├─ 2. Adam and Eve...
  │   └─ ...
  ├─ 📖 Volume II: The Origin of Faith
  └─ ...
```

## ⚙️ 配置选项

### 修改同步频率

编辑 `.github/workflows/sync-articles.yml`：

```yaml
schedule:
  - cron: '0 2 * * *'    # 每天 2:00 AM UTC
  # - cron: '0 2 * * 1'  # 每周一 2:00 AM UTC
  # - cron: '0 2 1 * *'  # 每月1号 2:00 AM UTC
```

### 修改源/目标目录

编辑 `scripts/sync-articles.js`：

```javascript
const SOURCE_DIR = 'articles';      // 源目录
const TARGET_DIR = 'app/articles';  // 目标目录
```

## ⚠️ 重要提示

1. **备份数据**
   - 同步会覆盖 `app/articles/` 中的文件
   - 始终保留 `articles/` 作为源文件

2. **格式要求**
   - `_meta.ts` 使用单引号和 trailing comma
   - 文章目录名与 meta 中的 key 必须匹配

3. **必需文件**
   - 每个文章目录必须有 `page.md` 文件
   - 每个卷必须有 `_meta.ts` 文件

## 🐛 故障排除

### 同步后文章不显示

```bash
# 检查文章是否存在
ls articles/volume-i-creation-and-fall/

# 检查是否有 page.md
find articles -name "page.md"

# 重新运行同步
node scripts/sync-articles.js
```

### GitHub Actions 失败

1. 查看 Actions 日志
2. 检查错误信息
3. 确认 Node.js 版本（需要 v20）

## 📞 获取帮助

如果遇到问题：
1. 查看 [完整使用指南](docs/ARTICLE_SYNC_GUIDE.md)
2. 查看 GitHub Actions 日志
3. 运行测试脚本：`node scripts/test-sync.js`

## 🎉 总结

✅ **系统已完全配置并测试通过**

- 📝 同步脚本：正常工作
- 🤖 GitHub Actions：已配置
- 📊 格式验证：完全一致
- 🧪 测试结果：全部通过

现在您可以：
1. 在 `articles/` 中管理文章
2. 自动同步到 `app/articles/`
3. 动态生成 `_meta.ts` 文件
4. 渐进式发布内容
5. 避免404错误

**祝您使用愉快！** 🚀

---

*最后更新：2025-11-04*
*版本：1.0.0*

