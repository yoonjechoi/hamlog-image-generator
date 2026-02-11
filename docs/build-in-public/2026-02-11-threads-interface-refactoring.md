---
platform: threads
date: 2026-02-11
topic: IGeminiChatService interface refactoring
tags: [build-in-public, chrome-extension, typescript]
---

# 인터페이스 리팩토링: 17개 메서드 -> 11개

## 1/4

Gemini 웹앱에서 이미지 배치 생성을 자동화하는 Chrome Extension을 만들고 있다.

오늘은 핵심 인터페이스를 리팩토링했다. 기존에는 프롬프트를 보내고 응답을 받으려면 두 번 호출해야 했다.

```typescript
// Before
await chat.sendPrompt(text);
const res = await chat.waitForResponse();
```

두 번째 호출을 빠뜨리면? 이전 응답이 끝나기 전에 다음 프롬프트가 발사된다. 조용한 버그.

## 2/4

한 줄로 바꿨다.

```typescript
// After
const result = await chat.generate(prompt, {
  signal: controller.signal
});
```

"프롬프트 보내고 결과 받기"라는 의도가 함수 하나에 담긴다. 이미지 생성 20-40초 대기는 그냥 Promise가 pending인 것뿐.

AbortSignal도 추가해서 배치 도중 취소도 가능하다.

## 3/4

배치 루프가 깔끔해졌다.

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

17개 메서드 -> 11개. 내부 폴링/상태 관리 메서드들은 private으로 내렸다. +282 -725줄. 코드는 줄고 API는 나아졌다.

## 4/4

핵심 깨달음: DOM 자동화에서 "전송"과 "대기" 사이에 할 수 있는 일이 없다. 생성 중엔 UI가 잠기니까. 그러면 왜 나눠서 노출하나?

temporal coupling 끊고 메서드 하나로 합치는 게 답이었다.

#BuildInPublic #TypeScript
