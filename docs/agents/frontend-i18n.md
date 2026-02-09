# Frontend Internationalization (i18n)

Next.js App Router supports **Korean (ko)** and **English (en)**.

## Architecture

- **URL-based locale**: `/ko/...`, `/en/...` using `[locale]` dynamic segment
- **Dictionary files**: `packages/web/src/i18n/dictionaries/ko.json`, `en.json` manage all UI strings
- **Middleware**: `packages/web/src/middleware.ts` auto-redirects based on Accept-Language header
- **Default locale**: `ko` (Korean)

## Rules

- **Never** hardcode UI strings. Always load from the translation dictionary.
- When adding new UI strings, **both** `ko.json` and `en.json` must be updated.
- Locale switching must preserve the current path (e.g., `/ko/page` → `/en/page`).
- Translation keys are nested by page (e.g., `queue.joinButton`, `reserve.title`).
- Date/time formats must be locale-aware.
