#!/bin/bash

# 🌿 分支设置脚本
# 用于初始化和管理 Easy Bible 项目的分支策略

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# 检查是否在 Git 仓库中
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "当前目录不是 Git 仓库"
        exit 1
    fi
    print_success "Git 仓库检查通过"
}

# 检查当前分支
check_current_branch() {
    CURRENT_BRANCH=$(git branch --show-current)
    print_info "当前分支: $CURRENT_BRANCH"
}

# 检查是否有未提交的更改
check_uncommitted_changes() {
    if [[ -n $(git status --porcelain) ]]; then
        print_warning "检测到未提交的更改"
        git status --short
        echo ""
        read -p "是否继续? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "操作已取消"
            exit 0
        fi
    else
        print_success "工作目录干净"
    fi
}

# 创建 content-sync 分支
create_content_sync_branch() {
    print_header "创建 content-sync 分支"
    
    # 检查分支是否已存在
    if git show-ref --verify --quiet refs/heads/content-sync; then
        print_warning "content-sync 分支已存在"
        read -p "是否重新创建? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "删除现有的 content-sync 分支..."
            git branch -D content-sync
            print_success "已删除现有分支"
        else
            print_info "跳过创建分支"
            return
        fi
    fi
    
    # 确保在 main 分支
    if [[ $(git branch --show-current) != "main" ]]; then
        print_info "切换到 main 分支..."
        git checkout main
    fi
    
    # 更新 main 分支
    print_info "更新 main 分支..."
    git pull origin main || print_warning "无法从远程更新 main 分支"
    
    # 创建新分支
    print_info "创建 content-sync 分支..."
    git checkout -b content-sync
    print_success "content-sync 分支创建成功"
    
    # 推送到远程
    print_info "推送到远程仓库..."
    git push -u origin content-sync
    print_success "content-sync 分支已推送到远程"
    
    # 返回 main 分支
    print_info "返回 main 分支..."
    git checkout main
    print_success "已返回 main 分支"
}

# 同步分支
sync_branches() {
    print_header "同步分支"
    
    CURRENT_BRANCH=$(git branch --show-current)
    
    print_info "更新 main 分支..."
    git checkout main
    git pull origin main
    print_success "main 分支已更新"
    
    print_info "更新 content-sync 分支..."
    git checkout content-sync
    git pull origin content-sync
    print_success "content-sync 分支已更新"
    
    # 返回原分支
    git checkout "$CURRENT_BRANCH"
    print_success "已返回 $CURRENT_BRANCH 分支"
}

# 合并 content-sync 到 main
merge_to_main() {
    print_header "合并 content-sync 到 main"
    
    # 检查未提交的更改
    check_uncommitted_changes
    
    # 更新分支
    print_info "更新分支..."
    git fetch origin
    
    # 切换到 main 分支
    print_info "切换到 main 分支..."
    git checkout main
    git pull origin main
    
    # 显示待合并的提交
    print_info "待合并的提交:"
    git log main..origin/content-sync --oneline --graph --decorate
    echo ""
    
    # 确认合并
    read -p "是否继续合并? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "合并已取消"
        exit 0
    fi
    
    # 执行合并
    print_info "合并 content-sync 分支..."
    if git merge origin/content-sync --no-ff -m "Merge content-sync into main"; then
        print_success "合并成功"
        
        # 推送到远程
        print_info "推送到远程..."
        git push origin main
        print_success "已推送到远程 main 分支"
    else
        print_error "合并失败，请手动解决冲突"
        exit 1
    fi
}

# 查看分支状态
show_branch_status() {
    print_header "分支状态"
    
    # 更新远程信息
    git fetch origin
    
    # 显示本地分支
    print_info "本地分支:"
    git branch -vv
    echo ""
    
    # 显示远程分支
    print_info "远程分支:"
    git branch -r
    echo ""
    
    # 显示 main 和 content-sync 的差异
    print_info "main 和 content-sync 的差异:"
    AHEAD=$(git rev-list --count main..origin/content-sync 2>/dev/null || echo "0")
    BEHIND=$(git rev-list --count origin/content-sync..main 2>/dev/null || echo "0")
    
    echo "  content-sync 领先 main: $AHEAD 个提交"
    echo "  content-sync 落后 main: $BEHIND 个提交"
    echo ""
    
    if [[ $AHEAD -gt 0 ]]; then
        print_info "content-sync 分支的新提交:"
        git log main..origin/content-sync --oneline --graph --decorate | head -10
        echo ""
    fi
}

# 显示帮助信息
show_help() {
    cat << EOF
🌿 Easy Bible 分支管理脚本

用法: $0 [命令]

命令:
  init        初始化 content-sync 分支
  sync        同步所有分支
  merge       合并 content-sync 到 main
  status      查看分支状态
  help        显示此帮助信息

示例:
  $0 init     # 创建并初始化 content-sync 分支
  $0 sync     # 同步所有分支
  $0 merge    # 合并 content-sync 到 main
  $0 status   # 查看分支状态

详细文档: docs/BRANCH_STRATEGY.md
EOF
}

# 主函数
main() {
    print_header "🌿 Easy Bible 分支管理"
    
    # 检查 Git 仓库
    check_git_repo
    
    # 检查当前分支
    check_current_branch
    
    # 根据参数执行不同操作
    case "${1:-help}" in
        init)
            create_content_sync_branch
            ;;
        sync)
            sync_branches
            ;;
        merge)
            merge_to_main
            ;;
        status)
            show_branch_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    print_success "操作完成！"
}

# 运行主函数
main "$@"

