#!/usr/bin/env node

/**
 * PAT Token 测试脚本
 * 用于验证 PAT token 的有效性和权限
 */

const https = require('https');

const TOKEN = process.argv[2];

if (!TOKEN) {
  console.error('❌ 请提供 PAT token 作为参数');
  console.error('用法: node tests/test-pat-token.js <YOUR_PAT_TOKEN>');
  process.exit(1);
}

console.log('🔍 测试 PAT Token 有效性和权限...\n');

/**
 * 测试 token 是否有效
 */
function testTokenValidity() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const user = JSON.parse(data);
          console.log('✅ Token 有效');
          console.log(`   用户: ${user.login}`);
          console.log(`   邮箱: ${user.email || 'N/A'}`);
          resolve(user);
        } else {
          console.log('❌ Token 无效或已过期');
          console.log(`   状态码: ${res.statusCode}`);
          console.log(`   响应: ${data}`);
          reject(new Error('Token invalid'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 请求失败:', error.message);
      reject(error);
    });

    req.end();
  });
}

/**
 * 测试 token 权限
 */
function testTokenScopes() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      const scopes = res.headers['x-oauth-scopes'];
      
      res.on('data', () => {}); // 消费数据
      res.on('end', () => {
        console.log('\n📋 Token 权限 (Scopes):');
        if (scopes) {
          const scopeList = scopes.split(',').map(s => s.trim());
          scopeList.forEach(scope => {
            console.log(`   ✓ ${scope}`);
          });
          
          // 检查必需的权限
          console.log('\n🔍 检查必需权限:');
          const hasRepo = scopeList.includes('repo');
          const hasWorkflow = scopeList.includes('workflow');
          
          if (hasRepo) {
            console.log('   ✅ repo - 有推送权限');
          } else {
            console.log('   ❌ repo - 缺少推送权限（必需）');
          }
          
          if (hasWorkflow) {
            console.log('   ✅ workflow - 可以触发工作流');
          } else {
            console.log('   ❌ workflow - 无法触发工作流（必需）');
          }
          
          if (hasRepo && hasWorkflow) {
            console.log('\n✅ Token 权限充足！');
            resolve(true);
          } else {
            console.log('\n❌ Token 权限不足！');
            console.log('\n📝 需要的权限:');
            console.log('   1. repo - Full control of private repositories');
            console.log('   2. workflow - Update GitHub Action workflows');
            resolve(false);
          }
        } else {
          console.log('   ⚠️  无法获取权限信息');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 请求失败:', error.message);
      reject(error);
    });

    req.end();
  });
}

/**
 * 测试仓库访问权限
 */
function testRepoAccess() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/574588qggc/easy-bible-app',
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n🏠 仓库访问测试:');
        if (res.statusCode === 200) {
          const repo = JSON.parse(data);
          console.log(`   ✅ 可以访问仓库: ${repo.full_name}`);
          console.log(`   权限: ${repo.permissions ? JSON.stringify(repo.permissions) : 'N/A'}`);
          resolve(true);
        } else {
          console.log(`   ❌ 无法访问仓库`);
          console.log(`   状态码: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 请求失败:', error.message);
      reject(error);
    });

    req.end();
  });
}

/**
 * 主函数
 */
async function main() {
  try {
    await testTokenValidity();
    await testTokenScopes();
    await testRepoAccess();
    
    console.log('\n' + '='.repeat(60));
    console.log('测试完成！');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n测试失败:', error.message);
    process.exit(1);
  }
}

main();

