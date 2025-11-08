#!/usr/bin/env node

/**
 * GitHub Actions 工作流触发测试脚本
 * 
 * 用于测试和验证工作流触发机制
 * 特别是检查 sync-articles 推送后是否能触发 deploy 工作流
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  testBranch: 'content-sync',
  testFile: 'test-trigger.md',
  testDir: 'app/articles/test',
  maxWaitTime: 300, // 5分钟
  checkInterval: 30, // 30秒
};

/**
 * 执行命令并返回结果
 */
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout };
  }
}

/**
 * 获取最新的工作流运行
 */
function getLatestWorkflowRuns() {
  console.log('📊 检查最新的工作流运行...');
  
  const result = runCommand('gh run list --limit 5 --json createdAt,name,headBranch,event,status,conclusion', { silent: true });
  
  if (!result.success) {
    console.error('❌ 无法获取工作流运行信息:', result.error);
    return null;
  }
  
  try {
    const runs = JSON.parse(result.output);
    console.log('\n📋 最新的工作流运行:');
    runs.forEach((run, index) => {
      const time = new Date(run.createdAt).toLocaleString();
      console.log(`${index + 1}. ${run.name} (${run.event}) - ${run.status} - ${time}`);
    });
    
    return runs;
  } catch (error) {
    console.error('❌ 解析工作流数据失败:', error.message);
    return null;
  }
}

/**
 * 创建测试文件并推送
 */
function createTestCommit() {
  console.log('\n🧪 创建测试提交...');
  
  // 确保在正确的分支
  const branchResult = runCommand(`git checkout ${TEST_CONFIG.testBranch}`, { silent: true });
  if (!branchResult.success) {
    console.error(`❌ 无法切换到 ${TEST_CONFIG.testBranch} 分支`);
    return false;
  }
  
  // 创建测试目录
  const testDir = TEST_CONFIG.testDir;
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // 创建测试文件
  const testFilePath = path.join(testDir, TEST_CONFIG.testFile);
  const testContent = `# 工作流触发测试

这是一个测试文件，用于验证 GitHub Actions 工作流触发机制。

- 创建时间: ${new Date().toISOString()}
- 测试目的: 验证推送到 content-sync 分支是否能触发 deploy 工作流
- 测试分支: ${TEST_CONFIG.testBranch}

## 测试步骤

1. 创建此测试文件
2. 提交并推送到 ${TEST_CONFIG.testBranch} 分支
3. 监控 GitHub Actions 是否触发 deploy 工作流
4. 记录结果并清理测试文件

---

**注意**: 此文件是自动化测试的一部分，测试完成后会被删除。
`;

  fs.writeFileSync(testFilePath, testContent, 'utf8');
  console.log(`✅ 创建测试文件: ${testFilePath}`);
  
  // 添加并提交
  const addResult = runCommand(`git add ${testFilePath}`, { silent: true });
  if (!addResult.success) {
    console.error('❌ 无法添加测试文件到 Git');
    return false;
  }
  
  const commitMessage = `🧪 Test: Workflow trigger test - ${new Date().toISOString()}

This is an automated test to verify if push events trigger the deploy workflow.

Test details:
- Branch: ${TEST_CONFIG.testBranch}
- File: ${testFilePath}
- Purpose: Verify workflow triggering mechanism
`;

  const commitResult = runCommand(`git commit -m "${commitMessage}"`, { silent: true });
  if (!commitResult.success) {
    console.error('❌ 无法提交测试文件');
    return false;
  }
  
  console.log('✅ 测试文件已提交');
  
  // 推送到远程
  const pushResult = runCommand(`git push origin ${TEST_CONFIG.testBranch}`, { silent: true });
  if (!pushResult.success) {
    console.error('❌ 无法推送到远程分支:', pushResult.error);
    return false;
  }
  
  console.log(`✅ 已推送到 origin/${TEST_CONFIG.testBranch}`);
  return true;
}

/**
 * 监控工作流触发
 */
function monitorWorkflowTrigger(baselineRuns) {
  console.log('\n⏱️  开始监控工作流触发...');
  console.log(`⏰ 最大等待时间: ${TEST_CONFIG.maxWaitTime} 秒`);
  console.log(`🔄 检查间隔: ${TEST_CONFIG.checkInterval} 秒`);
  
  const startTime = Date.now();
  let checkCount = 0;
  
  const checkInterval = setInterval(() => {
    checkCount++;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    console.log(`\n🔍 检查 #${checkCount} (已等待 ${elapsed}s)...`);
    
    const currentRuns = getLatestWorkflowRuns();
    if (!currentRuns) {
      console.log('⚠️  无法获取当前工作流状态，继续等待...');
      return;
    }
    
    // 检查是否有新的 deploy 工作流运行
    const newDeployRuns = currentRuns.filter(run => 
      run.name === 'Deploy to Cloudflare Pages' &&
      new Date(run.createdAt) > new Date(baselineRuns[0]?.createdAt || 0)
    );
    
    if (newDeployRuns.length > 0) {
      clearInterval(checkInterval);
      console.log('\n🎉 检测到新的部署工作流!');
      newDeployRuns.forEach(run => {
        const time = new Date(run.createdAt).toLocaleString();
        console.log(`✅ ${run.name} - ${run.status} - ${time}`);
      });
      
      console.log('\n✅ 测试结果: 工作流触发机制正常工作!');
      cleanupTest();
      return;
    }
    
    // 检查超时
    if (elapsed >= TEST_CONFIG.maxWaitTime) {
      clearInterval(checkInterval);
      console.log('\n⏰ 等待超时!');
      console.log('❌ 测试结果: 推送后没有触发 deploy 工作流');
      console.log('\n🔍 这证实了我们的诊断: GitHub Actions 的 GITHUB_TOKEN 限制');
      cleanupTest();
      return;
    }
    
  }, TEST_CONFIG.checkInterval * 1000);
}

/**
 * 清理测试文件
 */
function cleanupTest() {
  console.log('\n🧹 清理测试文件...');
  
  const testFilePath = path.join(TEST_CONFIG.testDir, TEST_CONFIG.testFile);
  
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
    console.log(`🗑️  删除测试文件: ${testFilePath}`);
    
    // 提交删除
    const addResult = runCommand(`git add ${testFilePath}`, { silent: true });
    const commitResult = runCommand(`git commit -m "🧹 Clean up: Remove workflow trigger test file"`, { silent: true });
    const pushResult = runCommand(`git push origin ${TEST_CONFIG.testBranch}`, { silent: true });
    
    if (addResult.success && commitResult.success && pushResult.success) {
      console.log('✅ 测试文件清理完成');
    } else {
      console.log('⚠️  测试文件清理可能不完整，请手动检查');
    }
  }
  
  // 尝试删除测试目录（如果为空）
  try {
    if (fs.existsSync(TEST_CONFIG.testDir)) {
      fs.rmdirSync(TEST_CONFIG.testDir);
      console.log(`🗑️  删除测试目录: ${TEST_CONFIG.testDir}`);
    }
  } catch (error) {
    // 目录不为空，忽略错误
  }
}

/**
 * 主测试函数
 */
function main() {
  console.log('🧪 GitHub Actions 工作流触发测试');
  console.log('=' .repeat(50));
  console.log('📋 测试目的: 验证推送到 content-sync 分支是否能触发 deploy 工作流');
  console.log('🎯 预期结果: 如果使用 GITHUB_TOKEN，应该不会触发');
  console.log('=' .repeat(50));
  
  // 获取基线工作流状态
  const baselineRuns = getLatestWorkflowRuns();
  if (!baselineRuns) {
    console.error('❌ 无法获取基线工作流状态，测试终止');
    process.exit(1);
  }
  
  // 创建测试提交
  if (!createTestCommit()) {
    console.error('❌ 创建测试提交失败，测试终止');
    process.exit(1);
  }
  
  // 监控工作流触发
  monitorWorkflowTrigger(baselineRuns);
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = {
  runCommand,
  getLatestWorkflowRuns,
  createTestCommit,
  monitorWorkflowTrigger,
  cleanupTest
};
