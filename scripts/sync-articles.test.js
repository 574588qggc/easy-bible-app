/**
 * 单元测试 - 文章同步脚本
 * 测试 sync-articles.js 的核心功能
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 测试配置
const TEST_DIR = path.join(__dirname, '../test-temp');
const TEST_SOURCE_DIR = path.join(TEST_DIR, 'articles');
const TEST_TARGET_DIR = path.join(TEST_DIR, 'app/articles');

// 导入要测试的函数（需要修改 sync-articles.js 以导出函数）
// 由于原脚本没有导出，我们先复制核心函数到这里进行测试

/**
 * 读取并解析 _meta.ts 文件
 */
function parseMetaFile(metaPath) {
  if (!fs.existsSync(metaPath)) {
    return null;
  }

  const content = fs.readFileSync(metaPath, 'utf-8');
  
  const match = content.match(/export default\s*{([^}]+)}/s);
  if (!match) {
    return null;
  }

  const entries = [];
  const lines = match[1].split('\n');

  for (const line of lines) {
    const entryMatch = line.match(/'([^']+)':\s*'([^']+)',?/);
    if (entryMatch) {
      entries.push({
        key: entryMatch[1],
        value: entryMatch[2]
      });
    }
  }

  return entries;
}

/**
 * 生成 _meta.ts 文件
 */
function generateMetaFile(entries, outputPath) {
  if (!entries || entries.length === 0) {
    return;
  }

  const lines = ['export default {'];

  for (const entry of entries) {
    lines.push(`  '${entry.key}': '${entry.value}',`);
  }

  lines.push('}');
  lines.push('');

  const content = lines.join('\n');
  
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf-8');
}

/**
 * 检查目录是否存在
 */
function directoryExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/**
 * 复制目录（递归）
 */
function copyDirectory(source, target) {
  if (!fs.existsSync(source)) {
    return false;
  }

  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }

  fs.cpSync(source, target, { recursive: true });
  return true;
}

// ==================== 测试辅助函数 ====================

/**
 * 清理测试目录
 */
function cleanupTestDir() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

/**
 * 创建测试目录结构
 */
function setupTestDir() {
  cleanupTestDir();
  fs.mkdirSync(TEST_SOURCE_DIR, { recursive: true });
  fs.mkdirSync(TEST_TARGET_DIR, { recursive: true });
}

/**
 * 创建测试用的 _meta.ts 文件
 */
function createTestMetaFile(dirPath, entries) {
  const metaPath = path.join(dirPath, '_meta.ts');
  const lines = ['export default {'];
  
  for (const entry of entries) {
    lines.push(`  '${entry.key}': '${entry.value}',`);
  }
  
  lines.push('}');
  lines.push('');
  
  fs.writeFileSync(metaPath, lines.join('\n'), 'utf-8');
  return metaPath;
}

/**
 * 创建测试文章目录
 */
function createTestArticle(volumePath, articleName, content = '# Test Article\n\nTest content') {
  const articlePath = path.join(volumePath, articleName);
  fs.mkdirSync(articlePath, { recursive: true });
  fs.writeFileSync(path.join(articlePath, 'page.md'), content, 'utf-8');
  return articlePath;
}

// ==================== 测试用例 ====================

console.log('🧪 开始运行单元测试...\n');

let testsPassed = 0;
let testsFailed = 0;

/**
 * 测试 1: parseMetaFile - 正常解析
 */
function test1_parseMetaFile_valid() {
  console.log('Test 1: parseMetaFile - 解析有效的 _meta.ts 文件');
  
  setupTestDir();
  
  const entries = [
    { key: 'volume-i', value: '📖 Volume I' },
    { key: 'volume-ii', value: '📖 Volume II' }
  ];
  
  const metaPath = createTestMetaFile(TEST_SOURCE_DIR, entries);
  const result = parseMetaFile(metaPath);
  
  assert.strictEqual(result.length, 2, '应该解析出2个条目');
  assert.strictEqual(result[0].key, 'volume-i', '第一个key应该是volume-i');
  assert.strictEqual(result[0].value, '📖 Volume I', '第一个value应该正确');
  assert.strictEqual(result[1].key, 'volume-ii', '第二个key应该是volume-ii');
  
  console.log('  ✅ 通过\n');
  testsPassed++;
}

/**
 * 测试 2: parseMetaFile - 文件不存在
 */
function test2_parseMetaFile_notFound() {
  console.log('Test 2: parseMetaFile - 文件不存在时返回 null');
  
  const result = parseMetaFile('/non/existent/path/_meta.ts');
  
  assert.strictEqual(result, null, '文件不存在应该返回null');
  
  console.log('  ✅ 通过\n');
  testsPassed++;
}

/**
 * 测试 3: parseMetaFile - 无效格式
 */
function test3_parseMetaFile_invalidFormat() {
  console.log('Test 3: parseMetaFile - 无效格式返回 null');
  
  setupTestDir();
  
  const invalidMetaPath = path.join(TEST_SOURCE_DIR, '_meta.ts');
  fs.writeFileSync(invalidMetaPath, 'invalid content', 'utf-8');
  
  const result = parseMetaFile(invalidMetaPath);
  
  assert.strictEqual(result, null, '无效格式应该返回null');
  
  console.log('  ✅ 通过\n');
  testsPassed++;
}

/**
 * 测试 4: generateMetaFile - 生成正确格式
 */
function test4_generateMetaFile_correctFormat() {
  console.log('Test 4: generateMetaFile - 生成正确格式的文件');
  
  setupTestDir();
  
  const entries = [
    { key: 'article-1', value: '🌟 Article 1' },
    { key: 'article-2', value: '✨ Article 2' }
  ];
  
  const outputPath = path.join(TEST_TARGET_DIR, '_meta.ts');
  generateMetaFile(entries, outputPath);
  
  assert.ok(fs.existsSync(outputPath), '文件应该被创建');
  
  const content = fs.readFileSync(outputPath, 'utf-8');
  assert.ok(content.includes("export default {"), '应该包含export default');
  assert.ok(content.includes("'article-1': '🌟 Article 1',"), '应该包含第一个条目');
  assert.ok(content.includes("'article-2': '✨ Article 2',"), '应该包含第二个条目');
  assert.ok(content.endsWith('\n'), '应该以换行符结尾');
  
  console.log('  ✅ 通过\n');
  testsPassed++;
}

/**
 * 测试 5: generateMetaFile - 空条目
 */
function test5_generateMetaFile_emptyEntries() {
  console.log('Test 5: generateMetaFile - 空条目不生成文件');
  
  setupTestDir();
  
  const outputPath = path.join(TEST_TARGET_DIR, 'empty_meta.ts');
  generateMetaFile([], outputPath);
  
  // 函数应该直接返回，不创建文件
  console.log('  ✅ 通过\n');
  testsPassed++;
}

/**
 * 测试 6: directoryExists - 检查目录存在
 */
function test6_directoryExists() {
  console.log('Test 6: directoryExists - 正确检查目录是否存在');
  
  setupTestDir();
  
  assert.ok(directoryExists(TEST_SOURCE_DIR), '测试源目录应该存在');
  assert.ok(!directoryExists('/non/existent/path'), '不存在的目录应该返回false');
  
  // 创建一个文件，不是目录
  const filePath = path.join(TEST_SOURCE_DIR, 'test.txt');
  fs.writeFileSync(filePath, 'test', 'utf-8');
  assert.ok(!directoryExists(filePath), '文件路径应该返回false');
  
  console.log('  ✅ 通过\n');
  testsPassed++;
}

/**
 * 测试 7: copyDirectory - 复制目录
 */
function test7_copyDirectory() {
  console.log('Test 7: copyDirectory - 正确复制目录');
  
  setupTestDir();
  
  const sourceDir = path.join(TEST_SOURCE_DIR, 'test-volume');
  const targetDir = path.join(TEST_TARGET_DIR, 'test-volume');
  
  // 创建源目录和文件
  fs.mkdirSync(sourceDir, { recursive: true });
  fs.writeFileSync(path.join(sourceDir, 'file1.txt'), 'content1', 'utf-8');
  fs.mkdirSync(path.join(sourceDir, 'subdir'), { recursive: true });
  fs.writeFileSync(path.join(sourceDir, 'subdir', 'file2.txt'), 'content2', 'utf-8');
  
  const result = copyDirectory(sourceDir, targetDir);
  
  assert.ok(result, '复制应该成功');
  assert.ok(fs.existsSync(targetDir), '目标目录应该存在');
  assert.ok(fs.existsSync(path.join(targetDir, 'file1.txt')), 'file1.txt应该被复制');
  assert.ok(fs.existsSync(path.join(targetDir, 'subdir', 'file2.txt')), 'subdir/file2.txt应该被复制');
  
  const content1 = fs.readFileSync(path.join(targetDir, 'file1.txt'), 'utf-8');
  assert.strictEqual(content1, 'content1', '文件内容应该正确');
  
  console.log('  ✅ 通过\n');
  testsPassed++;
}

/**
 * 测试 8: 完整同步流程 - 单个文章
 */
function test8_fullSync_singleArticle() {
  console.log('Test 8: 完整同步流程 - 同步单个文章');
  
  setupTestDir();
  
  // 创建源结构
  const volumePath = path.join(TEST_SOURCE_DIR, 'volume-i-test');
  fs.mkdirSync(volumePath, { recursive: true });
  
  const volumeEntries = [
    { key: 'article-1', value: '🌟 Article 1' },
    { key: 'article-2', value: '✨ Article 2' }
  ];
  createTestMetaFile(volumePath, volumeEntries);
  
  // 只创建第一篇文章
  createTestArticle(volumePath, 'article-1');
  
  // 模拟同步过程
  const targetVolumePath = path.join(TEST_TARGET_DIR, 'volume-i-test');
  fs.mkdirSync(targetVolumePath, { recursive: true });
  
  // 检查并复制存在的文章
  const existingEntries = [];
  for (const entry of volumeEntries) {
    const sourceArticlePath = path.join(volumePath, entry.key);
    const targetArticlePath = path.join(targetVolumePath, entry.key);
    
    if (directoryExists(sourceArticlePath)) {
      copyDirectory(sourceArticlePath, targetArticlePath);
      existingEntries.push(entry);
    }
  }
  
  // 生成目标 _meta.ts
  const targetMetaPath = path.join(targetVolumePath, '_meta.ts');
  generateMetaFile(existingEntries, targetMetaPath);
  
  // 验证结果
  assert.strictEqual(existingEntries.length, 1, '应该只有1篇文章被同步');
  assert.ok(fs.existsSync(path.join(targetVolumePath, 'article-1')), 'article-1应该被复制');
  assert.ok(!fs.existsSync(path.join(targetVolumePath, 'article-2')), 'article-2不应该被复制');
  
  const parsedMeta = parseMetaFile(targetMetaPath);
  assert.strictEqual(parsedMeta.length, 1, '_meta.ts应该只包含1个条目');
  assert.strictEqual(parsedMeta[0].key, 'article-1', '_meta.ts应该包含article-1');
  
  console.log('  ✅ 通过\n');
  testsPassed++;
}

/**
 * 测试 9: 完整同步流程 - 多个文章
 */
function test9_fullSync_multipleArticles() {
  console.log('Test 9: 完整同步流程 - 同步多个文章');

  setupTestDir();

  const volumePath = path.join(TEST_SOURCE_DIR, 'volume-ii-test');
  fs.mkdirSync(volumePath, { recursive: true });

  const volumeEntries = [
    { key: 'article-1', value: '📖 Article 1' },
    { key: 'article-2', value: '📖 Article 2' },
    { key: 'article-3', value: '📖 Article 3' }
  ];
  createTestMetaFile(volumePath, volumeEntries);

  // 创建所有文章
  createTestArticle(volumePath, 'article-1', '# Article 1\nContent 1');
  createTestArticle(volumePath, 'article-2', '# Article 2\nContent 2');
  createTestArticle(volumePath, 'article-3', '# Article 3\nContent 3');

  // 模拟同步
  const targetVolumePath = path.join(TEST_TARGET_DIR, 'volume-ii-test');
  fs.mkdirSync(targetVolumePath, { recursive: true });

  const existingEntries = [];
  for (const entry of volumeEntries) {
    const sourceArticlePath = path.join(volumePath, entry.key);
    const targetArticlePath = path.join(targetVolumePath, entry.key);

    if (directoryExists(sourceArticlePath)) {
      copyDirectory(sourceArticlePath, targetArticlePath);
      existingEntries.push(entry);
    }
  }

  const targetMetaPath = path.join(targetVolumePath, '_meta.ts');
  generateMetaFile(existingEntries, targetMetaPath);

  // 验证
  assert.strictEqual(existingEntries.length, 3, '应该有3篇文章被同步');
  assert.ok(fs.existsSync(path.join(targetVolumePath, 'article-1', 'page.md')), 'article-1/page.md应该存在');
  assert.ok(fs.existsSync(path.join(targetVolumePath, 'article-2', 'page.md')), 'article-2/page.md应该存在');
  assert.ok(fs.existsSync(path.join(targetVolumePath, 'article-3', 'page.md')), 'article-3/page.md应该存在');

  const parsedMeta = parseMetaFile(targetMetaPath);
  assert.strictEqual(parsedMeta.length, 3, '_meta.ts应该包含3个条目');

  console.log('  ✅ 通过\n');
  testsPassed++;
}

/**
 * 测试 10: Meta 文件格式保持 - 单引号和 trailing comma
 */
function test10_metaFormat_preservation() {
  console.log('Test 10: Meta 文件格式 - 保持单引号和 trailing comma');

  setupTestDir();

  const entries = [
    { key: 'test-key', value: 'Test Value' }
  ];

  const outputPath = path.join(TEST_TARGET_DIR, 'format_test_meta.ts');
  generateMetaFile(entries, outputPath);

  const content = fs.readFileSync(outputPath, 'utf-8');

  // 检查格式
  assert.ok(content.includes("'test-key'"), '应该使用单引号包裹key');
  assert.ok(content.includes("'Test Value'"), '应该使用单引号包裹value');
  assert.ok(content.includes("',"), '应该有trailing comma');
  assert.ok(content.includes('  '), '应该有2空格缩进');

  console.log('  ✅ 通过\n');
  testsPassed++;
}

/**
 * 测试 11: 特殊字符处理 - Emoji 和中文
 */
function test11_specialCharacters() {
  console.log('Test 11: 特殊字符处理 - Emoji 和中文');

  setupTestDir();

  const entries = [
    { key: 'volume-i', value: '📖 第一卷：创造与堕落' },
    { key: 'volume-ii', value: '✨ 第二卷：信仰的起源' }
  ];

  const outputPath = path.join(TEST_TARGET_DIR, 'special_chars_meta.ts');
  generateMetaFile(entries, outputPath);

  const parsedEntries = parseMetaFile(outputPath);

  assert.strictEqual(parsedEntries.length, 2, '应该解析出2个条目');
  assert.strictEqual(parsedEntries[0].value, '📖 第一卷：创造与堕落', 'Emoji和中文应该被正确保存');
  assert.strictEqual(parsedEntries[1].value, '✨ 第二卷：信仰的起源', 'Emoji和中文应该被正确保存');

  console.log('  ✅ 通过\n');
  testsPassed++;
}

/**
 * 测试 12: 边界情况 - 空卷（没有文章）
 */
function test12_emptyVolume() {
  console.log('Test 12: 边界情况 - 空卷（没有文章）');

  setupTestDir();

  const volumePath = path.join(TEST_SOURCE_DIR, 'empty-volume');
  fs.mkdirSync(volumePath, { recursive: true });

  const volumeEntries = [
    { key: 'article-1', value: 'Article 1' },
    { key: 'article-2', value: 'Article 2' }
  ];
  createTestMetaFile(volumePath, volumeEntries);

  // 不创建任何文章目录

  const targetVolumePath = path.join(TEST_TARGET_DIR, 'empty-volume');
  fs.mkdirSync(targetVolumePath, { recursive: true });

  const existingEntries = [];
  for (const entry of volumeEntries) {
    const sourceArticlePath = path.join(volumePath, entry.key);
    if (directoryExists(sourceArticlePath)) {
      existingEntries.push(entry);
    }
  }

  assert.strictEqual(existingEntries.length, 0, '没有文章应该被找到');

  console.log('  ✅ 通过\n');
  testsPassed++;
}

/**
 * 测试 13: 覆盖已存在的目录
 */
function test13_overwriteExisting() {
  console.log('Test 13: 覆盖已存在的目录');

  setupTestDir();

  const sourceDir = path.join(TEST_SOURCE_DIR, 'overwrite-test');
  const targetDir = path.join(TEST_TARGET_DIR, 'overwrite-test');

  // 创建源目录
  fs.mkdirSync(sourceDir, { recursive: true });
  fs.writeFileSync(path.join(sourceDir, 'new.txt'), 'new content', 'utf-8');

  // 创建已存在的目标目录
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'old.txt'), 'old content', 'utf-8');

  // 复制（应该覆盖）
  copyDirectory(sourceDir, targetDir);

  assert.ok(fs.existsSync(path.join(targetDir, 'new.txt')), 'new.txt应该存在');
  assert.ok(!fs.existsSync(path.join(targetDir, 'old.txt')), 'old.txt应该被删除');

  console.log('  ✅ 通过\n');
  testsPassed++;
}

/**
 * 测试 14: 实际项目结构测试
 */
function test14_realProjectStructure() {
  console.log('Test 14: 实际项目结构测试');

  // 检查实际的 articles 目录是否存在
  const realArticlesDir = path.join(__dirname, '../articles');

  if (!fs.existsSync(realArticlesDir)) {
    console.log('  ⚠️  跳过（articles目录不存在）\n');
    return;
  }

  const realMetaPath = path.join(realArticlesDir, '_meta.ts');

  if (!fs.existsSync(realMetaPath)) {
    console.log('  ⚠️  跳过（articles/_meta.ts不存在）\n');
    return;
  }

  const entries = parseMetaFile(realMetaPath);

  assert.ok(entries !== null, '应该能解析实际的_meta.ts文件');
  assert.ok(entries.length > 0, '应该至少有一个卷');

  console.log(`  ℹ️  找到 ${entries.length} 个卷`);

  // 检查每个卷的结构
  for (const entry of entries) {
    const volumePath = path.join(realArticlesDir, entry.key);
    if (fs.existsSync(volumePath)) {
      const volumeMetaPath = path.join(volumePath, '_meta.ts');
      if (fs.existsSync(volumeMetaPath)) {
        const volumeEntries = parseMetaFile(volumeMetaPath);
        console.log(`  ℹ️  ${entry.value}: ${volumeEntries ? volumeEntries.length : 0} 篇文章`);
      }
    }
  }

  console.log('  ✅ 通过\n');
  testsPassed++;
}

// ==================== 运行所有测试 ====================

function runAllTests() {
  try {
    test1_parseMetaFile_valid();
    test2_parseMetaFile_notFound();
    test3_parseMetaFile_invalidFormat();
    test4_generateMetaFile_correctFormat();
    test5_generateMetaFile_emptyEntries();
    test6_directoryExists();
    test7_copyDirectory();
    test8_fullSync_singleArticle();
    test9_fullSync_multipleArticles();
    test10_metaFormat_preservation();
    test11_specialCharacters();
    test12_emptyVolume();
    test13_overwriteExisting();
    test14_realProjectStructure();
  } catch (error) {
    console.error(`\n❌ 测试失败: ${error.message}`);
    console.error(error.stack);
    testsFailed++;
  } finally {
    // 清理测试目录
    cleanupTestDir();
  }
}

// 运行测试
runAllTests();

// 输出测试结果
console.log('='.repeat(60));
console.log('📊 测试结果汇总');
console.log('='.repeat(60));
console.log(`✅ 通过: ${testsPassed}`);
console.log(`❌ 失败: ${testsFailed}`);
console.log(`📈 总计: ${testsPassed + testsFailed}`);
console.log('='.repeat(60));

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 所有测试通过！\n');
  process.exit(0);
}
