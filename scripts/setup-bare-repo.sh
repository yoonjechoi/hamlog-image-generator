#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# bare repo + worktree 구조 초기화 스크립트
#
# 사용법:
#   1. GitHub에서 "Use this template"으로 새 repo 생성
#   2. 아래 명령 실행:
#
#      git clone --bare <YOUR_REPO_URL> my-project/.bare
#      cd my-project
#      bash .bare/scripts/setup-bare-repo.sh
#
# 결과:
#   my-project/
#   ├── .bare/          ← bare repo
#   ├── main/           ← main branch worktree
#   └── (worktrees...)  ← feature branches
# ─────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BARE_DIR="$PROJECT_ROOT/.bare"

echo "==> Setting up bare repo + worktree structure"
echo "    Project root: $PROJECT_ROOT"
echo "    Bare repo:    $BARE_DIR"

# .bare가 bare repo인지 확인
if [ ! -f "$BARE_DIR/HEAD" ]; then
	echo "ERROR: $BARE_DIR is not a bare git repository."
	echo "Run: git clone --bare <REPO_URL> $BARE_DIR"
	exit 1
fi

# main worktree 생성
if [ -d "$PROJECT_ROOT/main" ]; then
	echo "    main/ worktree already exists, skipping."
else
	echo "==> Creating main/ worktree"
	git -C "$BARE_DIR" worktree add "$PROJECT_ROOT/main" main
fi

# 의존성 설치
echo "==> Installing dependencies in main/"
cd "$PROJECT_ROOT/main"

if command -v bun &>/dev/null; then
	bun install
elif command -v npm &>/dev/null; then
	npm install
else
	echo "WARNING: Neither bun nor npm found. Install dependencies manually."
fi

# .env 생성
if [ ! -f "$PROJECT_ROOT/main/.env" ] && [ -f "$PROJECT_ROOT/main/.env.example" ]; then
	echo "==> Creating .env from .env.example"
	cp "$PROJECT_ROOT/main/.env.example" "$PROJECT_ROOT/main/.env"
fi

echo ""
echo "==> Setup complete!"
echo ""
echo "    cd $PROJECT_ROOT/main"
echo "    npx nx run-many --target=test --all"
echo ""
echo "    To create a feature branch:"
echo "    cd $PROJECT_ROOT/main"
echo "    git worktree add ../feat-my-feature -b feat/my-feature"
echo "    cd ../feat-my-feature && bun install && ln -s ../main/.env .env"
