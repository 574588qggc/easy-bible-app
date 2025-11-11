#!/usr/bin/env node

/**
 * 工作流触发监控脚本
 * 
 * 用于实时监控 GitHub Actions 工作流的触发情况
 * 特别关注 sync-articles 是否触发 deploy 工作流
 */

const { execSync } = require('child_process');

// 监控配置
const MONITOR_CONFIG = {
  checkInterval: 30, // 30秒检查一次
  maxRunTime: 1800, // 30分钟最大运行时间
  syncWorkflowName: 'Sync Articles to App Directory',
  deployWorkflowName: 'Deploy to Cloudflare Pages',
};

/**
 * 执行命令并返回结果
 */
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'pipe',
      ...options 
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout?.trim() || '' };
  }
}

/**
 * 获取最新的工作流运行记录
 */
function getLatestWorkflowRuns() {
  const command = 'gh run list --limit 10 --json createdAt,name,event,status,conclusion,headBranch,url';
  const result = runCommand(command, { silent: true });
  
  if (!result.success) {
    console.error('❌ 无法获取工作流运行记录:', result.error);
    return null;
  }
  
  try {
    return JSON.parse(result.output);
  } catch (error) {
    console.error('❌ 解析工作流数据失败:', error.message);
    return null;
  }
}

/**
 * 格式化时间显示
 */
function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * 显示工作流运行状态
 */
function displayWorkflowStatus(runs) {
  console.log('\n📊 最新工作流运行状态:');
  console.log('=' .repeat(80));
  
  const syncRuns = runs.filter(run => run.name === MONITOR_CONFIG.syncWorkflowName);
  const deployRuns = runs.filter(run => run.name === MONITOR_CONFIG.deployWorkflowName);
  
  console.log('\n🔄 同步工作流 (Sync Articles):');
  if (syncRuns.length === 0) {
    console.log('  📭 暂无运行记录');
  } else {
    syncRuns.slice(0, 3).forEach((run, index) => {
      const status = run.status === 'completed' ? 
        (run.conclusion === 'success' ? '✅' : '❌') : '🔄';
      const time = formatTime(run.createdAt);
      console.log(`  ${status} ${time} - ${run.status} (${run.event})`);
    });
  }
  
  console.log('\n🚀 部署工作流 (Deploy):');
  if (deployRuns.length === 0) {
    console.log('  📭 暂无运行记录');
  } else {
    deployRuns.slice(0, 3).forEach((run, index) => {
      const status = run.status === 'completed' ? 
        (run.conclusion === 'success' ? '✅' : '❌') : '🔄';
      const time = formatTime(run.createdAt);
      console.log(`  ${status} ${time} - ${run.status} (${run.event})`);
    });
  }
}

/**
 * 检查是否有新的工作流触发
 */
function checkForNewTriggers(previousRuns, currentRuns) {
  const previousSyncTimes = previousRuns
    .filter(run => run.name === MONITOR_CONFIG.syncWorkflowName)
    .map(run => run.createdAt);
  
  const previousDeployTimes = previousRuns
    .filter(run => run.name === MONITOR_CONFIG.deployWorkflowName)
    .map(run => run.createdAt);
  
  const newSyncRuns = currentRuns
    .filter(run => run.name === MONITOR_CONFIG.syncWorkflowName)
    .filter(run => !previousSyncTimes.includes(run.createdAt));
  
  const newDeployRuns = currentRuns
    .filter(run => run.name === MONITOR_CONFIG.deployWorkflowName)
    .filter(run => !previousDeployTimes.includes(run.createdAt));
  
  return { newSyncRuns, newDeployRuns };
}

/**
 * 主监控函数
 */
function startMonitoring() {
  console.log('🔍 GitHub Actions 工作流触发监控');
  console.log('=' .repeat(50));
  console.log(`⏰ 检查间隔: ${MONITOR_CONFIG.checkInterval} 秒`);
  console.log(`⏱️  最大运行时间: ${MONITOR_CONFIG.maxRunTime / 60} 分钟`);
  console.log(`🎯 监控目标: 观察同步任务是否触发部署工作流`);
  console.log('=' .repeat(50));
  
  // 获取初始状态
  let previousRuns = getLatestWorkflowRuns();
  if (!previousRuns) {
    console.error('❌ 无法获取初始工作流状态，监控终止');
    process.exit(1);
  }
  
  displayWorkflowStatus(previousRuns);
  
  const startTime = Date.now();
  let checkCount = 0;
  
  const monitorInterval = setInterval(() => {
    checkCount++;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    console.log(`\n🔍 检查 #${checkCount} (运行时间: ${Math.floor(elapsed/60)}:${(elapsed%60).toString().padStart(2, '0')})`);
    
    const currentRuns = getLatestWorkflowRuns();
    if (!currentRuns) {
      console.log('⚠️  无法获取当前工作流状态，继续监控...');
      return;
    }
    
    const { newSyncRuns, newDeployRuns } = checkForNewTriggers(previousRuns, currentRuns);
    
    // 检查新的同步任务
    if (newSyncRuns.length > 0) {
      console.log('\n🆕 检测到新的同步任务!');
      newSyncRuns.forEach(run => {
        const time = formatTime(run.createdAt);
        console.log(`  🔄 ${time} - ${run.status} (触发方式: ${run.event})`);
      });
    }
    
    // 检查新的部署任务
    if (newDeployRuns.length > 0) {
      console.log('\n🎉 检测到新的部署任务!');
      newDeployRuns.forEach(run => {
        const time = formatTime(run.createdAt);
        console.log(`  🚀 ${time} - ${run.status} (触发方式: ${run.event})`);
      });
      
      // 分析触发关系
      const recentSyncTime = newSyncRuns.length > 0 ? 
        new Date(newSyncRuns[0].createdAt).getTime() : 0;
      const deployTime = new Date(newDeployRuns[0].createdAt).getTime();
      
      if (recentSyncTime > 0 && deployTime > recentSyncTime && (deployTime - recentSyncTime) < 300000) {
        console.log('✅ 确认: 同步任务成功触发了部署工作流! 🎯');
      }
    }
    
    // 更新状态
    previousRuns = currentRuns;
    
    // 检查超时
    if (elapsed >= MONITOR_CONFIG.maxRunTime) {
      clearInterval(monitorInterval);
      console.log('\n⏰ 监控时间结束');
      console.log('📊 监控总结: 请查看上述日志了解工作流触发情况');
      process.exit(0);
    }
    
  }, MONITOR_CONFIG.checkInterval * 1000);
  
  // 处理 Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(monitorInterval);
    console.log('\n\n👋 监控已停止');
    process.exit(0);
  });
}

// 运行监控
if (require.main === module) {
  startMonitoring();
}

module.exports = { startMonitoring };
