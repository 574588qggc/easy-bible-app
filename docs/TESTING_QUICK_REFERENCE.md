# 🚀 测试快速参考

## 常用命令

```bash
# 运行所有单元测试
npm test

# 运行环境测试
npm run test:sync

# 运行同步脚本
node scripts/sync-articles.js

# 直接运行测试文件
node scripts/sync-articles.test.js
node scripts/test-sync.js
```

## 测试状态

| 测试 | 命令 | 状态 |
|------|------|------|
| 单元测试 | `npm test` | ✅ 14/14 通过 |
| 环境测试 | `npm run test:sync` | ✅ 6/6 通过 |

## 快速诊断

### 问题：测试失败
```bash
# 1. 查看详细错误
npm test

# 2. 检查文件结构
npm run test:sync

# 3. 验证 articles 目录
ls articles/
ls articles/_meta.ts
```

### 问题：同步失败
```bash
# 1. 运行环境测试
npm run test:sync

# 2. 检查源目录
ls articles/

# 3. 检查目标目录
ls app/articles/

# 4. 手动运行同步
node scripts/sync-articles.js
```

### 问题：GitHub Actions 失败
```bash
# 1. 本地运行测试
npm test

# 2. 检查 articles 目录是否存在
ls articles/_meta.ts

# 3. 查看 GitHub Actions 日志
gh run list
gh run view <run-id> --log
```

## 测试覆盖

- ✅ Meta 文件解析
- ✅ Meta 文件生成
- ✅ 目录操作
- ✅ 增量同步
- ✅ 格式规范
- ✅ 特殊字符
- ✅ 边界情况
- ✅ 实际项目验证

## 项目统计

- **总卷数**: 7
- **总文章数**: 27
- **已同步**: 5 篇
- **待同步**: 22 篇

## 文档链接

- 📖 [完整测试指南](./TESTING_GUIDE.md)
- 📊 [测试结果报告](../TEST_RESULTS.md)
- 🔄 [同步指南](./ARTICLE_SYNC_GUIDE.md)
- 🚀 [快速开始](./QUICK_START.md)

## 常见问题

**Q: 如何添加新测试？**  
A: 在 `scripts/sync-articles.test.js` 中添加新的测试函数，然后在 `runAllTests()` 中调用。

**Q: 测试数据存放在哪里？**  
A: 测试使用临时目录 `test-temp/`，测试完成后自动清理。

**Q: 如何调试失败的测试？**  
A: 查看测试输出的错误消息和堆栈跟踪，检查对应的测试用例代码。

**Q: 测试会影响实际数据吗？**  
A: 不会。测试使用独立的临时目录，不会修改 `articles/` 或 `app/articles/` 中的实际数据。

## 最佳实践

1. ✅ 每次修改代码后运行测试
2. ✅ 提交前确保所有测试通过
3. ✅ 添加新功能时编写对应测试
4. ✅ 定期运行环境测试验证项目结构

---

**最后更新**: 2025-11-06

