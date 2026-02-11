---
platform: x
date: 2026-02-11
topic: IGeminiChatService interface refactoring
tags: [build-in-public, chrome-extension, typescript]
---

# Interface Refactoring: 17 methods → 11

## 1/6

Building a Chrome Extension that automates batch image generation on Gemini's web UI.

Today I refactored the core interface. The old API had a 2-call pattern that was a bug waiting to happen.

## 2/6

Before:

```typescript
await chat.sendPrompt(text);
const res = await chat.waitForResponse();
```

Forget that second call? Your next prompt fires while the previous one is still generating. Silent failure.

## 3/6

After:

```typescript
const result = await chat.generate(prompt, {
  signal: controller.signal
});
```

One call = one intent. Send prompt, get response. The 20-40s wait is just the Promise being pending.

## 4/6

The batch loop got much cleaner:

```typescript
for (const [i, prompt] of prompts.entries()) {
  const r = await chat.generate(prompt);
  if (!r.success) continue;
  for (const img of r.data.images)
    await chat.downloadImage(img, {
      filename: `${String(i+1).padStart(3,'0')}.png`
    });
}
```

## 5/6

Other changes:
- 17 methods → 11 (moved internal polling/state methods to private)
- Added AbortSignal for cancelling mid-batch
- Removed WaitOptions, added GenerateOptions
- +282 -725 lines. Less code, better API.

## 6/6

The key insight: in DOM automation, there's nothing useful to do between "send" and "wait". The UI is locked during generation. So why expose the split?

Kill the temporal coupling. Ship one method.

#BuildInPublic #TypeScript #ChromeExtension
