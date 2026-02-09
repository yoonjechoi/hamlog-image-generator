# Git Commit Conventions

## Format

**Gitmoji + Conventional Commits**, written in **Korean**.

```
<gitmoji> <type>(<scope>): <Korean description>
```

## Gitmoji Mapping

| Gitmoji | type     | Usage                            |
| ------- | -------- | -------------------------------- |
| ✨      | feat     | New feature                      |
| 🐛      | fix      | Bug fix                          |
| ♻️      | refactor | Refactoring (no behavior change) |
| 📝      | docs     | Documentation changes            |
| ✅      | test     | Add/modify tests                 |
| 🔧      | chore    | Config, build, dependencies      |
| 🎨      | style    | Code formatting, semicolons      |
| ⚡      | perf     | Performance improvement          |
| 🔥      | remove   | Remove code/files                |
| 🚚      | rename   | Move/rename files or paths       |

## Examples

```
✨ feat(queue-service): 동시 접속자 수 기반 입장 제어 추가
🐛 fix(api-server): SSE 스트림 에러 시 리소스 누수 수정
♻️ refactor(token-gate): wrapRedisError 헬퍼 추출
📝 docs(shared): Repository 인터페이스 JSDoc 주석 추가
✅ test(api-server): AdmissionController maxConcurrent 테스트 추가
🔧 chore: .gitignore에 .next 추가
```

## Rules

- Subject line must be **50 characters or fewer**.
- If a body is needed, leave a blank line and explain **why** the change was made.
- `scope` is the package name or change target (e.g., `lib-core`, `web`, `api-server`).
