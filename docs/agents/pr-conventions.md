# Pull Request Conventions

## Version Bump

Every PR body **must** include a Version Bump label.

```
## Version Bump
MINOR
```

## Criteria

| Bump      | Criteria                                              | Examples                                                                  |
| --------- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| **MAJOR** | Breaking change (backward-incompatible)               | API response structure change, interface deletion, new required parameter |
| **MINOR** | New feature with backward compatibility maintained    | New API endpoint, new optional parameter, new component                   |
| **PATCH** | Bug fix, refactoring, docs, tests — no feature change | Error fix, performance improvement, comment addition, config change       |

## Rules

- Only **one** Version Bump per PR.
- If a PR contains mixed change types, use the **highest level** (e.g., feat + fix = MINOR).
- PRs containing only `docs`, `test`, or `chore` changes are **PATCH**.
