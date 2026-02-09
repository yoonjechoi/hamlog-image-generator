# JSDoc Comment Requirements for Interfaces & Types

All `interface`, `type`, and exported function signatures **must** have JSDoc comments.

## Rules

- Add `/** */` comments **above** `interface` and `type` declarations describing their role and purpose.
- Each **property (field)** must also have a `/** */` comment describing its meaning, unit, and constraints.
- Exported functions must use `@param` and `@returns` tags to document inputs/outputs.
- Numeric fields with units must always specify the unit (e.g., `ms`, `seconds`, `μs`).
- Optional fields with defaults should use the `@default` tag.

## Example

```typescript
/**
 * Represents the current status of a user in the queue.
 * Returned by QueueService.join(), position is updated in real-time via SSE.
 */
export interface QueueEntry {
  /** Unique user identifier */
  userId: string;
  /** Current position in queue (1-indexed) */
  position: number;
  /** Time of queue entry (Redis server time, μs) */
  joinedAt: number;
  /** Priority level (0 = normal, higher = faster admission) */
  priority: number;
}

/**
 * Wraps Redis operation errors into Result.err().
 * @param operation - Async Redis operation to execute
 * @returns Result.ok(T) on success, Result.err(Error) on failure
 */
```

## Scope

- `packages/*/src/lib/*.ts` — Each package's public API (exported classes, functions, interfaces)
- Internal (private) helpers only need single-line comments (`//`).
