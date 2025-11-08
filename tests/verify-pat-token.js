#!/usr/bin/env node

/**
 * PAT Token 验证脚本
 * 
 * 用于验证 PAT_TOKEN 是否正确设置，以及工作流是否能正确触发
 */

const { execSync } = require('child_process');

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
 * 检查 GitHub Secrets
 */
function checkGitHubSecrets() {
  console.log('🔍 检查 GitHub Secrets...');
  
  // 注意：出于安全考虑，我们无法直接读取 secrets 的值
  // 但我们可以检查工作流文件是否正确配置
  
  const result = runCommand('gh secret list', { silent: true });
  
  if (!result.success) {
    console.log('⚠️  无法获取 secrets 列表，请确保已安装并配置 GitHub CLI');
    return false;
  }
  
  const secrets = result.output;
  console.log('📋 当前 Secrets:');
  console.log(secrets);
  
  if (secrets.includes('PAT_TOKEN')) {
    console.log('✅ PAT_TOKEN 已设置');
    return true;
  } else {
    console.log('❌ PAT_TOKEN 未设置');
    console.log('\n📝 请按照以下步骤设置 PAT_TOKEN:');
    console.log('1. 访问 https://github.com/settings/tokens');
    console.log('2. 创建新的 Personal Access Token');
    console.log('3. 授予 repo 和 workflow 权限');
    console.log('4. 将 token 添加到仓库 secrets 中，名称为 PAT_TOKEN');
    return false;
  }
}

/**
 * 检查工作流配置
 */
function checkWorkflowConfig() {
  console.log('\n🔍 检查工作流配置...');
  
  try {
    const fs = require('fs');
    const syncWorkflow = fs.readFileSync('.github/workflows/sync-articles.yml', 'utf8');
    
    if (syncWorkflow.includes('secrets.PAT_TOKEN')) {
      console.log('✅ sync-articles.yml 已配置使用 PAT_TOKEN');
      return true;
    } else {
      console.log('❌ sync-articles.yml 未配置 PAT_TOKEN');
      return false;
    }
  } catch (error) {
    console.log('❌ 无法读取工作流文件:', error.message);
    return false;
  }
}

/**
 * 手动触发同步任务进行测试
 */
function triggerSyncWorkflow() {
  console.log('\n🚀 手动触发同步工作流进行测试...');
  
  const result = runCommand('gh workflow run "Sync Articles to App Directory" --ref content-sync', { silent: true });
  
  if (result.success) {
    console.log('✅ 同步工作流已触发');
    console.log('📊 请在 GitHub Actions 页面监控工作流运行情况');
    console.log('🔗 https://github.com/574588qggc/easy-bible-app/actions');
    return true;
  } else {
    console.log('❌ 无法触发同步工作流:', result.error);
    return false;
  }
}

/**
 * 获取最近的工作流运行
 */
function getRecentWorkflowRuns() {
  console.log('\n📊 获取最近的工作流运行...');
  
  const result = runCommand('gh run list --limit 5 --json createdAt,name,event,status,conclusion', { silent: true });
  
  if (!result.success) {
    console.log('❌ 无法获取工作流运行信息');
    return;
  }
  
  try {
    const runs = JSON.parse(result.output);
    console.log('\n📋 最近的工作流运行:');
    runs.forEach((run, index) => {
      const time = new Date(run.createdAt).toLocaleString();
      const status = run.conclusion || run.status;
      console.log(`${index + 1}. ${run.name} (${run.event}) - ${status} - ${time}`);
    });
  } catch (error) {
    console.log('❌ 解析工作流数据失败:', error.message);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔧 PAT Token 验证工具');
  console.log('=' .repeat(50));
  console.log('📋 此工具将验证 PAT_TOKEN 设置和工作流配置');
  console.log('=' .repeat(50));
  
  let allChecksPass = true;
  
  // 检查 GitHub Secrets
  if (!checkGitHubSecrets()) {
    allChecksPass = false;
  }
  
  // 检查工作流配置
  if (!checkWorkflowConfig()) {
    allChecksPass = false;
  }
  
  // 获取当前工作流状态
  getRecentWorkflowRuns();
  
  if (allChecksPass) {
    console.log('\n🎉 所有检查通过！');
    console.log('✅ PAT_TOKEN 已正确设置');
    console.log('✅ 工作流配置正确');
    
    console.log('\n🧪 是否要手动触发同步工作流进行测试？');
    console.log('💡 这将帮助验证修复是否生效');
    
    // 在实际使用中，你可以取消注释下面的行来自动触发测试
    // triggerSyncWorkflow();
    
  } else {
    console.log('\n❌ 存在配置问题，请按照上述提示进行修复');
  }
  
  console.log('\n📚 更多信息请参考: docs/GITHUB_ACTIONS_SETUP.md');
}

// 运行验证
if (require.main === module) {
  main();
}

module.exports = {
  checkGitHubSecrets,
  checkWorkflowConfig,
  triggerSyncWorkflow,
  getRecentWorkflowRuns
};
