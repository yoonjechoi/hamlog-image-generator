# Nx TDD Boilerplate

Nx monorepo boilerplate with TDD, bare repo + worktree, and AI agent conventions.

## Quick Start

### Option A: Use as GitHub Template (Recommended)

1. Click **"Use this template"** on GitHub
2. Create your new repo
3. Clone and set up:

```bash
# Clone as bare repo
git clone --bare <YOUR_NEW_REPO_URL> my-project/.bare
cd my-project

# Run setup script
bash .bare/scripts/setup-bare-repo.sh

# Start working
cd main
npx nx run-many --target=test --all
```

### Option B: Clone directly

```bash
git clone <REPO_URL> my-project
cd my-project
bun install
npx nx run-many --target=test --all
```

## What's Included

### Project Structure

```
├── AGENTS.md                    ← AI agent rules (TDD, Git, JSDoc)
├── docs/agents/                 ← Detailed conventions
│   ├── git-worktree.md          ← bare repo + worktree workflow
│   ├── git-conventions.md       ← Gitmoji + Korean commit messages
│   ├── pr-conventions.md        ← PR version bump rules
│   ├── jsdoc-requirements.md    ← JSDoc standards
│   └── frontend-i18n.md         ← i18n guidelines
├── packages/
│   ├── lib-example/             ← Library package scaffold
│   │   ├── src/lib/result.ts    ← Result<T,E> type example
│   │   └── src/lib/result.spec.ts
│   └── app-example/             ← App package scaffold (depends on lib)
│       ├── src/lib/greet.ts     ← Cross-package import example
│       └── src/lib/greet.spec.ts
├── scripts/
│   └── setup-bare-repo.sh       ← Bare repo initializer
├── nx.json                      ← Nx workspace config
├── tsconfig.base.json           ← Shared TS strict config
└── .env.example                 ← Environment template
```

### Conventions

| Convention | Description |
|-----------|-------------|
| **TDD** | Red-Green-Refactor. Test FIRST, implement SECOND. |
| **Git** | Never commit to main. Feature branches + PR only. |
| **Commits** | Gitmoji + Korean. `✨ feat(scope): 설명` |
| **PR** | Must include `## Version Bump` (MAJOR/MINOR/PATCH) |
| **Worktree** | Bare repo structure for parallel branch work |
| **JSDoc** | Required on all exported interfaces, types, functions |
| **Result<T,E>** | No throwing across package boundaries |
| **Verify** | Build → Test → Lint before every commit |

### Tech Stack

- **Monorepo**: Nx
- **Package Manager**: Bun (npm compatible)
- **Language**: TypeScript (strict mode)
- **Test**: Vitest
- **Build**: SWC

## Creating a New Package

### Library package

```bash
npx nx g @nx/js:lib packages/my-lib --publishable --importPath=@hamlog/my-lib
```

### Adding dependencies between packages

Edit `package.json`:
```json
{
  "dependencies": {
"@hamlog/my-lib": "*"
  }
}
```

Then add tsconfig reference in `tsconfig.lib.json`:
```json
{
  "references": [
    { "path": "../my-lib/tsconfig.lib.json" }
  ]
}
```

## Worktree Workflow

```bash
# Create feature branch
cd main
git worktree add ../feat-my-feature -b feat/my-feature
cd ../feat-my-feature
bun install
ln -s ../main/.env .env

# Work, commit, push
git add -A && git commit -m "✨ feat(scope): 기능 설명"
git push -u origin feat/my-feature

# Create PR, merge, cleanup
git worktree remove ../feat-my-feature
```

## Customization

After creating from template:

1. **Rename `@hamlog`** → your org name in all `package.json` and `tsconfig.base.json`
2. **Remove example packages** when you have real ones
3. **Add dependencies** (e.g., `fastify`, `next`, `ioredis`) to root `package.json`
4. **Update AGENTS.md** with project-specific rules
5. **Configure `.env.example`** for your project's needs
