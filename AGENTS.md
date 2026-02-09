<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.

<!-- nx configuration end-->

# Git Rules

## Branch Strategy

- **NEVER** commit directly to the `main` branch.
- Always create a **feature branch** before starting work.
- Branch naming: `feat/<name>`, `fix/<name>`, `refactor/<target>`, `docs/<target>`, `chore/<target>`
- Merge into `main` via PR only.

## Worktree

이 저장소는 **bare repo + worktree** 구조로 운영한다.
See [full conventions](docs/agents/git-worktree.md) for directory structure, commands, and rules.

## Commit Conventions

Gitmoji + Conventional Commits format. Commit messages in **Korean**.
See [full conventions](docs/agents/git-conventions.md) for gitmoji table, examples, and rules.

## PR Conventions

Every PR body must include a **Version Bump** label (MAJOR / MINOR / PATCH).
See [full conventions](docs/agents/pr-conventions.md) for criteria and rules.

# Verification Checklist

커밋 전 아래 순서로 검증한다. 하나라도 실패하면 커밋하지 않는다.

1. **Build**: `nx affected --target=build`
2. **Test**: `nx affected --target=test`
3. **Lint** (설정 시): `nx affected --target=lint`

대규모 리팩토링(패키지 이동·삭제·이름 변경) 후에는 `nx run-many --target=build --all`로 전체 빌드를 확인한다.

# TDD: Red-Green-Refactor Cycle

All feature implementation MUST follow the **Red-Green-Refactor** cycle.

## 1. RED — Write a failing test first

- Write a failing test **before** any implementation code.
- Run the test and **confirm it fails (RED)**.
- If the test doesn't fail, the test is wrong — fix it.

## 2. GREEN — Write minimal code to pass

- Write only the **minimum implementation** to make the test pass.
- Avoid over-engineering or unnecessary abstraction.
- Run the test and **confirm it passes (GREEN)**.

## 3. REFACTOR — Improve the code

- Clean up and improve the code while tests are passing.
- Re-run tests after refactoring to **confirm they still pass**.
- Refactoring changes structure only, not behavior.

## Rules

- **NEVER** write implementation code without a failing test.
- Keep cycles small and fast (one behavior/case per cycle).
- Run tests with `nx run <project>:test`.
- Never delete or skip tests to make them pass.

# Frontend UI Component

- 모든 UI 컴포넌트는 **shadcn/ui** 를 사용하여 구현한다.
- 직접 CSS로 UI 컴포넌트를 만들지 않는다.
- shadcn/ui 컴포넌트가 없는 경우에만 CSS Modules로 커스텀 구현한다.
- Tailwind CSS는 shadcn/ui가 요구하는 범위 내에서만 사용한다.

# Frontend Testing Strategy

- **TDD cycle (Red-Green-Refactor)**: unit tests for hooks, utils, and logic
- **Component tests (optional)**: when building reusable UI components
- **E2E tests**: written AFTER feature implementation to verify full user flows. Run with `nx run web-e2e:e2e`

# Frontend Internationalization (i18n)

See [full i18n rules](docs/agents/frontend-i18n.md) for architecture, file paths, and guidelines.

# JSDoc Requirements

All `interface`, `type`, and exported function signatures must have **JSDoc comments**.
See [full requirements](docs/agents/jsdoc-requirements.md) for rules, examples, and scope.
