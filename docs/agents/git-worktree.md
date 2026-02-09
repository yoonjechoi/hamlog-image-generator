# Git Worktree Convention

## Directory Structure

```
{PROJECT_ROOT}/
├── .bare/                  ← bare repo (git objects, refs)
├── main/                   ← main branch worktree
├── feat-queue-priority/    ← feature worktree
├── fix-token-expiry/       ← fix worktree
└── ...
```

- **`{PROJECT_ROOT}/.bare/`**: bare git repository. 직접 작업하지 않는다.
- **`{PROJECT_ROOT}/main/`**: main 브랜치 전용 worktree. PR 머지 후 pull 용도.
- **`{PROJECT_ROOT}/{branch-slug}/`**: feature/fix 작업용 worktree.

## Worktree Naming

브랜치명의 `/`를 `-`로 치환한 값을 디렉토리명으로 사용한다.

| Branch                    | Worktree Directory         |
| ------------------------- | -------------------------- |
| `feat/queue-priority`     | `feat-queue-priority/`     |
| `fix/token-expiry`        | `fix-token-expiry/`        |
| `refactor/split-packages` | `refactor-split-packages/` |
| `docs/api-reference`      | `docs-api-reference/`      |

## Commands

### Create Worktree

```bash
# {PROJECT_ROOT} 에서 실행
git -C .bare worktree add ../feat-queue-priority -b feat/queue-priority
cd feat-queue-priority && bun install
ln -s ../main/.env .env
```

### Remove Worktree (PR 머지 후)

```bash
# {PROJECT_ROOT} 에서 실행
git -C .bare worktree remove feat-queue-priority
```

### List Worktrees

```bash
git -C .bare worktree list
```

## Parallel Work (Agent Workflow)

opencode는 **`main/` worktree에서 실행**한다. 작업 시작 시 agent가 worktree를 생성하고 병렬로 작업한다.

```
opencode (main/)
  ├─ task(background=true) → feat-a/ worktree에서 작업
  ├─ task(background=true) → feat-b/ worktree에서 작업
  └─ 메인 세션: 대화 + 조율 + 리뷰
```

### Agent가 worktree에서 작업하는 방법

1. worktree 생성: `git -C ../.bare worktree add ../feat-xxx -b feat/xxx main`
2. 의존성 설치: `bun install` (workdir=`../feat-xxx`)
3. `.env` 심볼릭 링크: `ln -s ../main/.env .env` (workdir=`../feat-xxx`)
4. 파일 읽기/쓰기: **절대경로** 사용 (`{PROJECT_ROOT}/feat-xxx/packages/...`)
5. nx 명령어: `workdir` 파라미터로 worktree 경로 지정
6. 완료 후: 커밋 → push → PR → worktree 제거

### 주의사항

- 각 worktree는 독립된 working tree — 서로의 변경사항이 보이지 않는다.
- 같은 파일을 수정하는 두 작업을 동시에 하면 **PR에서 conflict** 발생 가능.
- agent에게 worktree 경로를 prompt에 명시적으로 전달해야 한다.

## Rules

1. **`main/` worktree에 직접 커밋 금지** — PR 머지 후 `git pull` 전용.
2. **worktree 생성 후 반드시 `bun install`** — `node_modules`는 worktree별 독립.
3. **worktree 생성 후 `.env` 심볼릭 링크** — `ln -s ../main/.env .env`. `main/`의 `.env`를 공유한다.
4. **같은 브랜치를 두 worktree에서 동시에 열 수 없다** — git 제약.
5. **PR 머지 후 worktree 즉시 제거** — stale worktree 방치 금지.
6. **`dist/`, `.next/`, `node_modules/`는 worktree별 독립** — 공유하지 않는다.
7. **Nx 캐시(`node_modules/.cache/nx`)는 worktree별 독립** — 별도 설정 불필요.
