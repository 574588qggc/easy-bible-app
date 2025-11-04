/**
 * 测试同步脚本
 * 用于验证同步功能是否正常工作
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'articles';
const TARGET_DIR = 'app/articles';

console.log('🧪 Testing article sync functionality...\n');

// 测试 1: 检查源目录
console.log('Test 1: Checking source directory...');
if (fs.existsSync(SOURCE_DIR)) {
  console.log('✅ Source directory exists:', SOURCE_DIR);
  
  const rootMeta = path.join(SOURCE_DIR, '_meta.ts');
  if (fs.existsSync(rootMeta)) {
    console.log('✅ Root _meta.ts exists');
  } else {
    console.log('❌ Root _meta.ts not found');
  }
} else {
  console.log('❌ Source directory not found:', SOURCE_DIR);
}

// 测试 2: 列出所有卷
console.log('\nTest 2: Listing volumes...');
const volumes = fs.readdirSync(SOURCE_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`Found ${volumes.length} volumes:`);
volumes.forEach(vol => console.log(`  - ${vol}`));

// 测试 3: 检查每个卷的 _meta.ts
console.log('\nTest 3: Checking volume meta files...');
volumes.forEach(vol => {
  const metaPath = path.join(SOURCE_DIR, vol, '_meta.ts');
  if (fs.existsSync(metaPath)) {
    console.log(`✅ ${vol}/_meta.ts exists`);
    
    // 读取并显示文章数量
    const content = fs.readFileSync(metaPath, 'utf-8');
    const matches = content.match(/'[^']+'/g);
    if (matches) {
      const articleCount = matches.length / 2; // 每个条目有2个引号对
      console.log(`   └─ Contains ${articleCount} articles`);
    }
  } else {
    console.log(`❌ ${vol}/_meta.ts not found`);
  }
});

// 测试 4: 检查文章目录
console.log('\nTest 4: Checking article directories...');
let totalArticles = 0;
volumes.forEach(vol => {
  const volPath = path.join(SOURCE_DIR, vol);
  const articles = fs.readdirSync(volPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  totalArticles += articles.length;
  console.log(`${vol}: ${articles.length} article directories`);
});

console.log(`\nTotal article directories: ${totalArticles}`);

// 测试 5: 检查目标目录
console.log('\nTest 5: Checking target directory...');
if (fs.existsSync(TARGET_DIR)) {
  console.log('✅ Target directory exists:', TARGET_DIR);
  
  const targetVolumes = fs.readdirSync(TARGET_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`Currently synced volumes: ${targetVolumes.length}`);
  targetVolumes.forEach(vol => console.log(`  - ${vol}`));
} else {
  console.log('⚠️  Target directory does not exist yet:', TARGET_DIR);
  console.log('   (This is normal if sync has not been run)');
}

// 测试 6: 验证 meta 文件格式
console.log('\nTest 6: Validating meta file format...');
const sampleMeta = path.join(SOURCE_DIR, '_meta.ts');
if (fs.existsSync(sampleMeta)) {
  const content = fs.readFileSync(sampleMeta, 'utf-8');
  
  const checks = {
    'Has export default': content.includes('export default'),
    'Uses single quotes': content.includes("'"),
    'Has trailing commas': content.includes("',"),
    'Proper indentation': content.includes('  '),
  };
  
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(passed ? `✅ ${check}` : `❌ ${check}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('🎉 Test completed!');
console.log('='.repeat(60));
console.log('\nNext steps:');
console.log('1. Run: node scripts/sync-articles.js');
console.log('2. Check the app/articles directory');
console.log('3. Verify the generated _meta.ts files');
console.log('='.repeat(60) + '\n');

