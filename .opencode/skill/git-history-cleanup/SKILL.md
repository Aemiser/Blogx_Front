---
name: git-history-cleanup
description: "清理Git历史中的无关文件，包括临时文档、配置文件、敏感信息等。功能：识别无关文件、添加.gitignore规则、从Git缓存移除、重写历史永久删除、强制推送更新。"
---

# Git History Cleanup

从Git历史中永久移除与项目功能无关的文件。

## When to Apply

### Must Use

- 项目中存在被提交到Git的无关文档文件（如 .md 笔记、优化提示词等）
- 需要清理敏感信息（.env、credentials.json、API keys）
- 发现临时文件、测试文件被提交到仓库

### Skip

- 仅清理工作区的未跟踪文件（不需要重写历史）
- 纯后端逻辑开发
- 不涉及Git操作的任务

## Workflow

### Step 1: 识别历史中的无关文件

```bash
# 查看最近提交涉及的文件
git log --oneline --name-only -20

# 搜索特定类型的文件（如所有md文件）
git log --all --name-only --format="" | sort -u | findstr "md$"

# 搜索特定文件名
git log --all --name-only --format="" | sort -u | findstr "prompt\|env\|credentials"
```

### Step 2: 更新 .gitignore

编辑 `.gitignore` 添加忽略规则：

```gitignore
# 临时文档文件
*.md
!.docs/*.md

# 环境变量
.env
.env.*

# 敏感文件
credentials.json
*.key
```

### Step 3: 从Git缓存移除文件

```bash
# 移除指定文件
git rm --cached filename.md

# 批量移除（使用引号）
git rm --cached "*.md"
```

### Step 4: 重写历史（永久删除）

需要安装 git-filter-repo：

```bash
pip install git-filter-repo
```

清理指定文件的历史：

```bash
# 移除单个文件
git filter-repo --path filename.md --invert-paths --force

# 移除多个文件
git filter-repo --path file1.md --path file2.md --path .env --invert-paths --force

# 移除目录
git filter-repo --path .opencode --invert-paths --force
```

**注意**：此操作会重写Git历史，所有提交哈希会改变。操作前建议备份。

### Step 5: 重新添加远程仓库

```bash
git remote add origin <your-repo-url>
```

### Step 6: 强制推送

```bash
git push --force origin main
```

如果有多分支：

```bash
git push --force --all origin
git push --force --tags origin
```

## Common Patterns

### Pattern 1: 清理临时文档

```bash
# 识别
git log --all --name-only --format="" | sort -u | findstr "prompt\|md$"

# 清理
git filter-repo --path "*.md" --invert-paths --force
```

### Pattern 2: 清理敏感信息

```bash
# 识别
git log --all --name-only --format="" | sort -u | findstr "env\|credentials\|key\|secret"

# 清理（先修改.gitignore）
git filter-repo --path .env --path credentials.json --invert-paths --force

# 立即修改密码/密钥
```

### Pattern 3: 清理临时文件

```bash
# 识别
git log --all --name-only --format="" | sort -u | findstr "test\|temp\|tmp\|swp"

# 清理
git filter-repo --path tests/ --path "*.tmp" --invert-paths --force
```

## Verification

清理完成后验证：

```bash
# 确认历史中不再存在目标文件
git log --all --name-only --format="" | sort -u | findstr "filename"

# 查看当前分支提交历史
git log --oneline -10
```

## Precautions

1. **备份重要分支** - 在执行 filter-repo 前备份分支
2. **通知协作者** - 重写历史后需要强制推送，会影响其他人的克隆
3. **修改敏感凭据** - 如果清理的是敏感信息，立即修改相关密码/密钥
4. **检查CI/CD** - 确保清理后CI/CD流程仍然正常
5. **验证远程仓库** - 推送后确认远程仓库状态正确

## Related Commands

```bash
# 查看文件是否在历史中
git log --all --name-only --format="" | sort -u | findstr "filename"

# 检查特定提交包含的文件
git show <commit> --name-only

# 查看reflog（恢复误删的提交）
git reflog

# 完全删除孤儿对象（清理后运行）
git gc --prune=now --aggressive
```
