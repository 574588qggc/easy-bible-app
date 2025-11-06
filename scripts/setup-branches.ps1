# 🌿 分支设置脚本 (PowerShell 版本)
# 用于初始化和管理 Easy Bible 项目的分支策略

param(
    [Parameter(Position=0)]
    [ValidateSet('init', 'sync', 'merge', 'status', 'help')]
    [string]$Command = 'help'
)

# 颜色函数
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
}

# 检查是否在 Git 仓库中
function Test-GitRepo {
    try {
        git rev-parse --git-dir 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "当前目录不是 Git 仓库"
            exit 1
        }
        Write-Success "Git 仓库检查通过"
        return $true
    }
    catch {
        Write-Error "当前目录不是 Git 仓库"
        exit 1
    }
}

# 检查当前分支
function Get-CurrentBranch {
    $branch = git branch --show-current
    Write-Info "当前分支: $branch"
    return $branch
}

# 检查是否有未提交的更改
function Test-UncommittedChanges {
    $status = git status --porcelain
    if ($status) {
        Write-Warning "检测到未提交的更改"
        git status --short
        Write-Host ""
        $response = Read-Host "是否继续? (y/n)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            Write-Info "操作已取消"
            exit 0
        }
    }
    else {
        Write-Success "工作目录干净"
    }
}

# 创建 content-sync 分支
function New-ContentSyncBranch {
    Write-Header "创建 content-sync 分支"
    
    # 检查分支是否已存在
    $branchExists = git show-ref --verify --quiet refs/heads/content-sync
    if ($LASTEXITCODE -eq 0) {
        Write-Warning "content-sync 分支已存在"
        $response = Read-Host "是否重新创建? (y/n)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Info "删除现有的 content-sync 分支..."
            git branch -D content-sync
            Write-Success "已删除现有分支"
        }
        else {
            Write-Info "跳过创建分支"
            return
        }
    }
    
    # 确保在 main 分支
    $currentBranch = git branch --show-current
    if ($currentBranch -ne "main") {
        Write-Info "切换到 main 分支..."
        git checkout main
    }
    
    # 更新 main 分支
    Write-Info "更新 main 分支..."
    try {
        git pull origin main
    }
    catch {
        Write-Warning "无法从远程更新 main 分支"
    }
    
    # 创建新分支
    Write-Info "创建 content-sync 分支..."
    git checkout -b content-sync
    Write-Success "content-sync 分支创建成功"
    
    # 推送到远程
    Write-Info "推送到远程仓库..."
    git push -u origin content-sync
    Write-Success "content-sync 分支已推送到远程"
    
    # 返回 main 分支
    Write-Info "返回 main 分支..."
    git checkout main
    Write-Success "已返回 main 分支"
}

# 同步分支
function Sync-Branches {
    Write-Header "同步分支"
    
    $currentBranch = git branch --show-current
    
    Write-Info "更新 main 分支..."
    git checkout main
    git pull origin main
    Write-Success "main 分支已更新"
    
    Write-Info "更新 content-sync 分支..."
    git checkout content-sync
    git pull origin content-sync
    Write-Success "content-sync 分支已更新"
    
    # 返回原分支
    git checkout $currentBranch
    Write-Success "已返回 $currentBranch 分支"
}

# 合并 content-sync 到 main
function Merge-ToMain {
    Write-Header "合并 content-sync 到 main"
    
    # 检查未提交的更改
    Test-UncommittedChanges
    
    # 更新分支
    Write-Info "更新分支..."
    git fetch origin
    
    # 切换到 main 分支
    Write-Info "切换到 main 分支..."
    git checkout main
    git pull origin main
    
    # 显示待合并的提交
    Write-Info "待合并的提交:"
    git log main..origin/content-sync --oneline --graph --decorate
    Write-Host ""
    
    # 确认合并
    $response = Read-Host "是否继续合并? (y/n)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Info "合并已取消"
        exit 0
    }
    
    # 执行合并
    Write-Info "合并 content-sync 分支..."
    git merge origin/content-sync --no-ff -m "Merge content-sync into main"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "合并成功"
        
        # 推送到远程
        Write-Info "推送到远程..."
        git push origin main
        Write-Success "已推送到远程 main 分支"
    }
    else {
        Write-Error "合并失败，请手动解决冲突"
        exit 1
    }
}

# 查看分支状态
function Show-BranchStatus {
    Write-Header "分支状态"
    
    # 更新远程信息
    git fetch origin
    
    # 显示本地分支
    Write-Info "本地分支:"
    git branch -vv
    Write-Host ""
    
    # 显示远程分支
    Write-Info "远程分支:"
    git branch -r
    Write-Host ""
    
    # 显示 main 和 content-sync 的差异
    Write-Info "main 和 content-sync 的差异:"
    
    try {
        $ahead = (git rev-list --count main..origin/content-sync 2>$null)
        $behind = (git rev-list --count origin/content-sync..main 2>$null)
        
        if (-not $ahead) { $ahead = 0 }
        if (-not $behind) { $behind = 0 }
        
        Write-Host "  content-sync 领先 main: $ahead 个提交"
        Write-Host "  content-sync 落后 main: $behind 个提交"
        Write-Host ""
        
        if ([int]$ahead -gt 0) {
            Write-Info "content-sync 分支的新提交:"
            git log main..origin/content-sync --oneline --graph --decorate | Select-Object -First 10
            Write-Host ""
        }
    }
    catch {
        Write-Warning "无法计算分支差异"
    }
}

# 显示帮助信息
function Show-Help {
    Write-Host @"
🌿 Easy Bible 分支管理脚本 (PowerShell)

用法: .\setup-branches.ps1 [命令]

命令:
  init        初始化 content-sync 分支
  sync        同步所有分支
  merge       合并 content-sync 到 main
  status      查看分支状态
  help        显示此帮助信息

示例:
  .\setup-branches.ps1 init     # 创建并初始化 content-sync 分支
  .\setup-branches.ps1 sync     # 同步所有分支
  .\setup-branches.ps1 merge    # 合并 content-sync 到 main
  .\setup-branches.ps1 status   # 查看分支状态

详细文档: docs/BRANCH_STRATEGY.md
"@
}

# 主函数
function Main {
    Write-Header "🌿 Easy Bible 分支管理"
    
    # 检查 Git 仓库
    Test-GitRepo
    
    # 检查当前分支
    Get-CurrentBranch
    
    # 根据参数执行不同操作
    switch ($Command) {
        'init' {
            New-ContentSyncBranch
        }
        'sync' {
            Sync-Branches
        }
        'merge' {
            Merge-ToMain
        }
        'status' {
            Show-BranchStatus
        }
        'help' {
            Show-Help
        }
        default {
            Write-Error "未知命令: $Command"
            Write-Host ""
            Show-Help
            exit 1
        }
    }
    
    Write-Host ""
    Write-Success "操作完成！"
}

# 运行主函数
Main

