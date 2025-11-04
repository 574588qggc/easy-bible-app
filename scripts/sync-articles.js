const fs = require('fs');
const path = require('path');

// 配置
const SOURCE_DIR = 'articles';
const TARGET_DIR = 'app/articles';

/**
 * 读取并解析 _meta.ts 文件
 * 保持原始格式，包括单引号、trailing comma 等
 */
function parseMetaFile(metaPath) {
  if (!fs.existsSync(metaPath)) {
    console.log(`⚠️  Meta file not found: ${metaPath}`);
    return null;
  }

  const content = fs.readFileSync(metaPath, 'utf-8');
  
  // 提取 export default { ... } 中的内容
  const match = content.match(/export default\s*{([^}]+)}/s);
  if (!match) {
    console.log(`⚠️  Invalid meta file format: ${metaPath}`);
    return null;
  }

  const entries = [];
  const lines = match[1].split('\n');

  for (const line of lines) {
    // 匹配格式：'key': 'value',
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
 * 保持与原始文件完全相同的格式
 */
function generateMetaFile(entries, outputPath) {
  if (!entries || entries.length === 0) {
    console.log(`⚠️  No entries to write for: ${outputPath}`);
    return;
  }

  const lines = ['export default {'];

  for (const entry of entries) {
    // 保持原始格式：单引号、trailing comma、2空格缩进
    lines.push(`  '${entry.key}': '${entry.value}',`);
  }

  lines.push('}');
  lines.push(''); // 末尾空行

  const content = lines.join('\n');
  
  // 确保目录存在
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`✅ Generated: ${outputPath}`);
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

  // 如果目标已存在，先删除
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }

  // 复制整个目录
  fs.cpSync(source, target, { recursive: true });
  return true;
}

/**
 * 同步单个卷（volume）
 * @param {string} volumeName - 卷名称
 * @param {object} syncState - 同步状态对象 { foundNewArticle: boolean }
 * @returns {object} - { hasVolume: boolean, syncedNewArticle: boolean }
 */
function syncVolume(volumeName, syncState) {
  console.log(`\n📚 Processing volume: ${volumeName}`);

  const sourceVolumePath = path.join(SOURCE_DIR, volumeName);
  const targetVolumePath = path.join(TARGET_DIR, volumeName);

  // 检查源卷是否存在
  if (!directoryExists(sourceVolumePath)) {
    console.log(`⚠️  Source volume not found: ${sourceVolumePath}`);
    return { hasVolume: false, syncedNewArticle: false };
  }

  // 读取源 _meta.ts
  const sourceMetaPath = path.join(sourceVolumePath, '_meta.ts');
  const allEntries = parseMetaFile(sourceMetaPath);

  if (!allEntries || allEntries.length === 0) {
    console.log(`⚠️  No valid entries in _meta.ts for ${volumeName}`);
    return { hasVolume: false, syncedNewArticle: false };
  }

  // 创建目标卷目录
  if (!fs.existsSync(targetVolumePath)) {
    fs.mkdirSync(targetVolumePath, { recursive: true });
  }

  // 检查并复制文章
  const existingEntries = [];
  let newArticleSynced = false;

  for (const entry of allEntries) {
    const articleDir = entry.key;
    const sourceArticlePath = path.join(sourceVolumePath, articleDir);
    const targetArticlePath = path.join(targetVolumePath, articleDir);

    // 检查源文章是否存在
    if (!directoryExists(sourceArticlePath)) {
      console.log(`  ⊘ Skipped (source not found): ${articleDir}`);
      continue;
    }

    // 检查目标文章是否已存在
    const alreadyExists = directoryExists(targetArticlePath);

    if (alreadyExists) {
      // 文章已存在，添加到 meta 列表
      console.log(`  ✓ Already exists: ${articleDir}`);
      existingEntries.push(entry);
    } else if (!syncState.foundNewArticle) {
      // 这是一篇新文章，且还没有同步过新文章
      console.log(`  🆕 Syncing new article: ${articleDir}`);
      const success = copyDirectory(sourceArticlePath, targetArticlePath);

      if (success) {
        console.log(`  ✅ Successfully synced: ${articleDir}`);
        existingEntries.push(entry);
        syncState.foundNewArticle = true;
        newArticleSynced = true;
      } else {
        console.log(`  ✗ Failed to sync: ${articleDir}`);
      }
    } else {
      // 已经同步了一篇新文章，跳过其他新文章
      console.log(`  ⏭️  Skipped (will sync next time): ${articleDir}`);
    }
  }

  // 生成目标 _meta.ts（包含所有已存在的文章）
  if (existingEntries.length > 0) {
    const targetMetaPath = path.join(targetVolumePath, '_meta.ts');
    generateMetaFile(existingEntries, targetMetaPath);

    const totalArticles = allEntries.filter(e =>
      directoryExists(path.join(sourceVolumePath, e.key))
    ).length;
    console.log(`📊 Summary: ${existingEntries.length}/${totalArticles} articles in sync`);

    return { hasVolume: true, syncedNewArticle: newArticleSynced };
  } else {
    console.log(`⚠️  No articles in this volume`);
    return { hasVolume: false, syncedNewArticle: false };
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 Starting incremental article synchronization...\n');
  console.log('📌 Mode: ONE ARTICLE PER RUN\n');
  console.log(`📂 Source: ${SOURCE_DIR}`);
  console.log(`📂 Target: ${TARGET_DIR}\n`);

  // 创建目标根目录
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    console.log(`✅ Created target directory: ${TARGET_DIR}\n`);
  }

  // 读取根 _meta.ts
  const rootMetaPath = path.join(SOURCE_DIR, '_meta.ts');
  const rootEntries = parseMetaFile(rootMetaPath);

  if (!rootEntries || rootEntries.length === 0) {
    console.error('❌ Error: Root _meta.ts not found or invalid');
    process.exit(1);
  }

  console.log(`📋 Found ${rootEntries.length} volumes in root _meta.ts\n`);

  // 同步状态：追踪是否已经同步了一篇新文章
  const syncState = { foundNewArticle: false };

  // 同步每个卷
  const existingVolumes = [];
  let volumesWithContent = 0;
  let newArticleSynced = false;

  for (const entry of rootEntries) {
    const volumeName = entry.key;
    const result = syncVolume(volumeName, syncState);

    if (result.hasVolume) {
      // 检查目标卷是否存在且有内容
      const targetVolumePath = path.join(TARGET_DIR, volumeName);
      if (directoryExists(targetVolumePath)) {
        existingVolumes.push(entry);
        volumesWithContent++;
      }
    }

    if (result.syncedNewArticle) {
      newArticleSynced = true;
    }

    // 如果已经同步了一篇新文章，可以提前结束（优化性能）
    if (syncState.foundNewArticle) {
      console.log(`\n⏭️  Skipping remaining volumes (already synced one new article)`);

      // 但仍需要将剩余已存在的卷添加到 meta
      for (let i = rootEntries.indexOf(entry) + 1; i < rootEntries.length; i++) {
        const remainingVolume = rootEntries[i];
        const targetVolumePath = path.join(TARGET_DIR, remainingVolume.key);
        if (directoryExists(targetVolumePath)) {
          existingVolumes.push(remainingVolume);
        }
      }
      break;
    }
  }

  // 生成根 _meta.ts（只包含已有内容的卷）
  if (existingVolumes.length > 0) {
    const targetRootMetaPath = path.join(TARGET_DIR, '_meta.ts');
    generateMetaFile(existingVolumes, targetRootMetaPath);

    console.log('\n' + '='.repeat(60));
    if (newArticleSynced) {
      console.log('✅ Synchronization completed - ONE NEW ARTICLE SYNCED!');
    } else {
      console.log('✅ Synchronization completed - ALL ARTICLES ALREADY SYNCED!');
    }
    console.log('='.repeat(60));
    console.log(`📊 Volumes with content: ${volumesWithContent}/${rootEntries.length}`);
    console.log(`📁 Target directory: ${TARGET_DIR}`);
    if (newArticleSynced) {
      console.log(`🆕 New article synced: YES (1 article)`);
    } else {
      console.log(`🆕 New article synced: NO (all up to date)`);
    }
    console.log('='.repeat(60) + '\n');
  } else {
    console.error('\n❌ Error: No volumes were successfully synced');
    process.exit(1);
  }
}

// 运行主函数
try {
  main();
} catch (error) {
  console.error('\n❌ Fatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
}

