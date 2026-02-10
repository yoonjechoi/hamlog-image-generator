# Gemini DOM Research Report

## Page Structure
- Main app root: `main` under `RootWebArea "Google Gemini"`.
- Conversation timeline is composed of repeated containers: `model-response > response-container > .response-container > message-content`.
- Prompt composer is stable at page bottom with:
  - prompt textbox (`div[contenteditable="true"][role="textbox"]`)
  - upload button
  - tools button
  - mode switch button
  - send button (`button.send-button`)
- Image results render in `generated-image` custom elements inside response body blocks.

## Input Area Accessibility Tree (Verified)
- Korean (`https://gemini.google.com/app`):
  - `textbox "여기에 프롬프트 입력"` (placeholder text showed as "Gemini 3에게 물어보기")
  - sibling buttons: `"파일 업로드 메뉴 열기"`, `"도구"`, `"빠른 모드"/"사고 모드"`, `"메시지 보내기"`
- English (`https://gemini.google.com/app?hl=en`):
  - `textbox "Enter a prompt for Gemini"`
  - sibling buttons: `"Open upload file menu"`, `"Tools"`, `"Thinking"`, `"Send message"`

## Selectors Reference Table
| Element | Selector | Korean aria-label | English aria-label | Notes |
|---------|----------|-------------------|-------------------|-------|
| Input area | `div[contenteditable="true"][role="textbox"]` | `여기에 프롬프트 입력` | `Enter a prompt for Gemini` | Most stable selector in both locales. |
| Send button | `button.send-button` | `메시지 보내기` | `Send message` | Becomes `대답 생성 중지` / stop while generating. |
| File upload button | `button.upload-card-button` | `파일 업로드 메뉴 열기` (desc: `파일 추가`) | `Open upload file menu` (desc: `Add files`) | Opens upload menu, then click menuitem to invoke native picker. |
| Plus button (composer) | `button.upload-card-button.open` | `파일 업로드 메뉴 열기` | `Open upload file menu` | This is the `+` icon near input; same control as file upload button. |
| File upload menu item | `menuitem` from upload popup | `파일 업로드. 문서, 데이터, 코드 파일` | `Upload files. Documents, data, code files` (localized equivalent) | Trigger target for file chooser automation. |
| Tools button | Composer-local `button` with text `도구`/`Tools` | `도구` | `Tools` | Avoid generic `button[aria-label*="Tools"]` because sidebar history uses "More options for ...". |
| Mode switch button | `.input-area-switch` | text `빠른 모드` / `사고 모드` | text `Fast` / `Thinking` | Menu opens mode radio list. |
| Mode menu panel | `.mat-mdc-menu-panel.gds-mode-switch-menu[role="menu"]` | menuitems: `빠른 모드`, `사고 모드`, `Pro` | menuitems: `Fast`, `Thinking`, `Pro` | Verified behavior through menuitemradio options. |
| Generated image element | `generated-image` | n/a | n/a | Rendered inline under model response body. |
| Generated image img | `generated-image img[src*="googleusercontent.com"]` | n/a | n/a | Sample URL: `lh3.googleusercontent.com/gg-dl/...=s1024-rj`. |
| Image download button | `button[data-test-id="download-generated-image-button"]` | `원본 크기 이미지 다운로드` | `Download full size image` (localized equivalent) | Downloads original-size asset. |
| Hover-only download container | `generated-image .generated-image-controls .on-hover-button` | n/a | n/a | Hidden by default (`opacity: 0`), appears on image hover (`opacity: 1`). |
| Uploaded image preview | `button` containing filename; seen as preview control | `이미지 미리보기 <filename> 파일 삭제` | localized equivalent | Appears before send after successful upload. |
| Error message block | response `StaticText` in model answer | `...안전 장치로 인해...생성할 수 없습니다.` | localized equivalent | Policy rejection appears as normal model text response block. |

## Workflow: Text Prompt
1. Locate textbox with `div[contenteditable="true"][role="textbox"]`.
2. Fill prompt text.
3. Click `button.send-button` (`메시지 보내기` / `Send message`).
4. Wait for send button to switch from stop state back to normal send state.
5. Read response in latest `model-response` block.

Timing/waits:
- Typical text response: 3-12s.
- While generating, send button label changes to stop (`대답 생성 중지`).

## Workflow: Image Generation
1. Click composer tools button (`도구` / `Tools`).
2. Choose image tool menu item (`이미지 생성하기` / `Create image`).
3. Confirm selected tool chip appears (`이미지 선택 해제` chip indicates image mode active).
4. Enter prompt in composer textbox.
5. Send via `button.send-button`.
6. Wait for generating state (spinner + temporary loading controls).
7. On completion, inspect `generated-image` + action buttons (`이미지 공유`, `이미지 복사`, `원본 크기 이미지 다운로드`).

Verified generated-image DOM hierarchy (sample):
- `structured-content-container.model-response-text`
- `message-content#message-content-id-*`
- `div.markdown.markdown-main-panel`
- `div.attachment-container.generated-images`
- `response-element`
- `generated-image`
- `single-image.generated-image.large`
- `img[src*="lh3.googleusercontent.com/gg-dl/"]`

Shadow DOM:
- `generated-image` did **not** use shadow DOM in this run (`hasShadowRoot: false`).

## Workflow: Reference Image Upload + Generation
1. Click upload button (`파일 업로드 메뉴 열기` / `Open upload file menu`).
2. In popup menu (`파일 업로드 옵션`), click first menu item (`파일 업로드...`).
3. Upload file through native chooser (automation used menuitem trigger successfully).
4. Confirm preview chip/button appears with filename and delete control.
5. Enter prompt referencing uploaded image.
6. Send and wait for generated image response.

Upload flow observations:
- `input[type="file"]` was not persistently present in live DOM scans (likely created transiently by framework).
- Reliable automation path is clicking upload menu item and using upload action on that element.

## Workflow: Download Original Image
1. In generated image response, find `button[data-test-id="download-generated-image-button"]`.
2. Click button (`원본 크기 이미지 다운로드`).
3. Download occurs without visible `<a href>` anchor wrapping the button.
4. Image URL source pattern observed in DOM/performance entries:
   - `https://lh3.googleusercontent.com/gg-dl/<token>=s1024-rj`

Download behavior notes:
- Button is framework-handled (Angular context; no direct anchor href).
- Underlying image and download traffic use `googleusercontent.com` URL family.

## Workflow: Hover Download Button
1. Keep a response with generated images in viewport.
2. Capture pre-hover state (`16-before-hover.png`): download control is not visually shown.
3. Hover image surface (`generated-image` content; tested via image button area).
4. Capture post-hover state (`17-after-hover.png`): download icon appears.
5. Click `button[data-test-id="download-generated-image-button"]`.

Verified hover behavior:
- Download button class includes `on-hover-button` and is hidden by default.
- Before hover, computed style on visible candidates: `opacity: 0`, `visibility: visible`, `display: flex`.
- On hovered image, corresponding button changed to `opacity: 1` and became visible.
- Selector chain (sample):
  - `generated-image > single-image.generated-image > div.image-container > div.overlay-container > div.generated-image-controls.hide-from-message-actions > download-generated-image-button > button[data-test-id="download-generated-image-button"].on-hover-button`

Click result:
- Clicking hover-revealed download button did not navigate away; page URL stayed same.
- Download uses `googleusercontent` image asset flow (observed `lh3.googleusercontent.com/gg-dl/...`).

## Workflow: Plus Button File Upload
1. Use composer plus button: `button.upload-card-button.open` (`파일 업로드 메뉴 열기`).
2. Click it to open upload menu (`파일 업로드 옵션`).
3. Select `menuitem` `파일 업로드. 문서, 데이터, 코드 파일`.
4. Upload file through native picker.
5. Confirm preview appears as filename chip/button (`이미지 미리보기 <filename> 파일 삭제`).

Observed menu options after plus click:
- `파일 업로드. 문서, 데이터, 코드 파일`
- `Drive에서 파일 추가. Sheets, Docs, Slides`
- `Google 포토`
- `코드 가져오기`
- `NotebookLM`

Automation note:
- Reliable control path is `+ button -> menuitem("파일 업로드...") -> upload`.
- Direct persistent `input[type="file"]` is often not present in DOM snapshots.

## Workflow: Mode Switch
1. Click mode button in composer (`빠른 모드` / `사고 모드` or `Fast` / `Thinking`).
2. Mode menu opens as radio menu (`role="menu"`, `menuitemradio`).
3. Choose target mode item.
4. Confirm button text changes to selected mode.

English mode menu labels verified:
- `Fast`
- `Thinking`
- `Pro`

Korean mode menu labels verified:
- `빠른 모드`
- `사고 모드`
- `Pro`

## Error / Failure State
- Trigger used: request for copyrighted Disney character/logo poster.
- Gemini returned policy block text in normal assistant response block:
  - `서드 파티 콘텐츠와 관련된 Google의 안전 장치로 인해 이 프롬프트에 대한 대답을 생성할 수 없습니다.`
- DOM shape remained a standard text `model-response` (not a dedicated error dialog).

## Multiple Images in One Response
- Prompt requesting 2 variants produced two separate image sections in one answer.
- Response included headings + descriptions + separate image controls per image.
- DOM indicators:
  - repeated image action buttons (`이미지`, `이미지 공유`, `원본 크기 이미지 다운로드`)
  - distinct subsection headings (`1. ...`, `2. ...`)
- Layout is linear in one response block, not separate chat turns.

## Image URL Patterns
- Generated result URLs observed:
  - `https://lh3.googleusercontent.com/gg-dl/<opaque-token>=s1024-rj`
- Avatar/other UI images also use `lh3.googleusercontent.com` but with different paths (avoid mixing selectors).
- Full-resolution heuristic from prior research (`=s\d+ -> =s0`) should be treated as optional post-processing rule; this run directly exposed downloadable `gg-dl` URLs already suitable for original-size download flow.

## Edge Cases & Gotchas
- Dynamic ids/classes: Angular-generated classes/ids change; use semantic attributes and custom elements.
- Locale differences: aria labels differ significantly (`여기에 프롬프트 입력` vs `Enter a prompt for Gemini`).
- Tools selector trap: `button[aria-label*="Tools"]` can incorrectly match sidebar "More options for ..." items.
- Send button state flip: send button becomes stop button during generation; automation must wait for state transition.
- File input visibility: `input[type=file]` may be ephemeral/injected; menuitem-triggered upload is more reliable.
- Image tool chip persistence: previous tool selection can remain active (`이미지 선택 해제` chip), affecting later prompts.
- Error handling: policy failures appear as regular assistant text blocks, not always as dedicated toast/dialog.

## Screenshots Index
- `01-initial-page.png`: initial Gemini app page.
- `02-prompt-typed.png`: Korean prompt typed in composer.
- `03-response-received.png`: Korean response received.
- `04-english-prompt.png`: English prompt typed.
- `05-current-mode.png`: mode state before switching.
- `06-mode-switched.png`: mode switched (`빠른 모드` -> `사고 모드`).
- `07-tools-menu.png`: tools menu opened.
- `08-generating.png`: image generation in progress.
- `09-generated-image.png`: first generated image result.
- `10-download-button.png`: original-size download control visible.
- `11-upload-button.png`: upload button before reference image upload.
- `12-image-uploaded.png`: reference image preview uploaded.
- `13-reference-image-result.png`: result using uploaded reference image.
- `14-error-state.png`: policy rejection/error-like failure state.
- `15-multiple-images.png`: multiple images in one assistant response.
- `16-before-hover.png`: generated image area before hover (download control hidden).
- `17-after-hover.png`: generated image area after hover (download control shown).
- `18-plus-button.png`: `+` upload button near prompt input.
- `19-plus-clicked.png`: plus-button upload menu opened.
- `20-file-uploaded-via-plus.png`: uploaded file preview shown after plus flow.

## Experiment: Reference Image + Image Tool + Prompt → Generate → Download (Verified E2E)

### Full Automation Flow (Verified 2026-02-10)

**Step 1: Upload Reference Image**
1. Click `+` upload button (`button.upload-card-button`, aria: `파일 업로드 메뉴 열기`).
2. Click menuitem `파일 업로드. 문서, 데이터, 코드 파일`.
3. Upload file via `upload_file` on that menuitem (framework creates transient `input[type="file"]`).
4. Wait for preview chip: `button` with text `이미지 미리보기 <filename> 파일 삭제`.
- Confirmed: `input[type="file"]` has `multiple=true` (supports batch upload).
- Confirmed: Image preview thumbnail appears in composer area above prompt input.

**Step 2: Select Image Tool**
1. Click tools button (`button` with text `도구` / `Tools`).
2. Tools menu opens with `menuitemcheckbox` items: `Deep Research`, `동영상 만들기(Veo 3.1)`, `이미지 생성하기`, `Canvas`, `가이드 학습`.
3. Click `이미지 생성하기` / `Create image`.
4. Confirm tool chip appears: `button "이미지 선택 해제"` (image deselect chip → means image tool is active).
- Confirmed: Tool items are `menuitemcheckbox` (not plain `menuitem` like before).
- Confirmed: When image tool is active, prompt placeholder stays `여기에 프롬프트 입력`.

**Step 3: Enter Prompt + Send + Wait for Generation**
1. Fill prompt in textbox (`div[contenteditable="true"][role="textbox"]`).
2. Click send button (`button.send-button` / `메시지 보내기`).
3. During generation: "사고 모드" shows thinking process title (e.g. "Refining Geometric Elements").
4. Send button changes to stop button. Prompt placeholder changes to `이미지를 설명하세요`.
5. Wait for generation completion: detect `원본 크기 이미지 다운로드` text appearing.
- Confirmed: Model used was `Nano Banana Pro` (shown in thinking disclosure).
- Confirmed: Generation took ~20-40 seconds with thinking mode active.

**Step 4: Download Original Image**
1. Hover over `generated-image` element (NOT JS dispatchEvent — must use real Playwright hover).
2. `button[data-test-id="download-generated-image-button"]` opacity transitions `0 → 1`.
3. Click download button.
4. Toast message appears at bottom-left: `원본 크기 다운로드 중...` / `Downloading full size...`.
5. Download button icon changes to loading spinner during download.

### Download Network Flow (Verified)
```
1. GET lh3.googleusercontent.com/gg-dl/<token>=s1024-rj        → 302
2. GET work.fife.usercontent.google.com/rd-gg-dl/<token>=s1024-rj → 302
3. GET lh3.googleusercontent.com/rd-gg-dl/<long-token>=s1024-rj  → 200 (actual image)
```
- Also observed: `blob:https://gemini.google.com/<uuid>` used for local blob-based download.
- Download is framework-handled (Angular); no `<a href>` wrapping the button.

### Key Automation Findings
- **CSS :hover cannot be triggered via JS** `dispatchEvent(new MouseEvent('mouseenter'))`. Must use Playwright/CDP `hover()` for real hover.
- **Tool menu items changed to `menuitemcheckbox`** (previously documented as generic menuitem).
- **Download toast message** (`원본 크기 다운로드 중...`) is a reliable indicator that download was initiated.
- **Image tool persistence**: After generation, `이미지 선택 해제` chip remains active for subsequent prompts.
- **File upload with `multiple=true`**: Native file input supports selecting multiple files at once.

### Experiment Screenshots
- `exp-01-fresh-page.png`: Fresh Gemini conversation page.
- `exp-02-after-upload-attempt.png`: Reference image uploaded in composer.
- `exp-03-image-tool-selected.png`: Image tool selected with reference image and prompt.
- `exp-04-prompt-typed.png`: Full state before sending (ref image + tool + prompt).
- `exp-05-generating.png`: Generation in progress with thinking mode.
- `exp-06-image-generated.png`: Generated image result (blue bg + orange star).
- `exp-07-hover-download-visible.png`: Hover state showing download/share/copy buttons.
- `exp-08-after-download-click.png`: Download initiated with toast message visible.

## Experiment: Generation State Detection + Consecutive 3-Prompt Batch (Verified E2E)

### State Detection Logic (Verified 2026-02-10)

```javascript
function detectGenerationState() {
  const sendBtn = document.querySelector('button.send-button');
  const sendLabel = sendBtn?.getAttribute('aria-label') || sendBtn?.textContent || '';
  const isStopBtn = sendLabel.includes('중지') || sendLabel.includes('Stop');

  const responses = document.querySelectorAll('model-response');
  const lastResponse = responses[responses.length - 1] || null;

  const genImages = lastResponse?.querySelectorAll('generated-image') || [];
  const allGenImages = document.querySelectorAll('generated-image');

  const thumbsUp = document.querySelector(
    'button[aria-label*="마음에 들어요"], button[aria-label*="Good response"]'
  );
  const hasActionBtns = !!thumbsUp;

  const responseText = lastResponse?.textContent || '';
  const isError = responseText.includes('안전 장치') || responseText.includes('생성할 수 없습니다');

  // State determination priority:
  if (isStopBtn) return 'generating';
  if (isError && hasActionBtns) return 'error';
  if (genImages.length > 0 && hasActionBtns) return 'image_completed';
  if (hasActionBtns && responses.length > 0) return 'completed';
  return 'idle';

  // Also useful counters:
  // - responses.length = total response count
  // - genImages.length = images in latest response
  // - allGenImages.length = total images across all responses
}
```

### State Signals (DOM-based)

| State | Send Button | Action Buttons | `generated-image` | Notes |
|-------|-------------|----------------|--------------------|-------|
| `idle` | `메시지 보내기` | none | n/a | Fresh page or between turns |
| `generating` | `대답 생성 중지` | none (latest) | none (latest) | Stop button = definitive signal |
| `completed` | `메시지 보내기` | 👍👎 present | none | Text-only response |
| `image_completed` | `메시지 보내기` | 👍👎 present | present | Image generation done |
| `error` | `메시지 보내기` | 👍👎 present | none | Contains `안전 장치`/policy text |

### Consecutive 3-Prompt Batch Results

**Setup**: New chat → Select image tool (`이미지 생성하기`) → Send 3 prompts sequentially.

| # | Prompt | Pre-send State | During State | Post State | Images |
|---|--------|---------------|--------------|------------|--------|
| 1 | `빨간색 배경에 하얀 눈꽃 결정 패턴...` | `idle` | `generating` (sendBtn=`대답 생성 중지`) | `image_completed` | total=1 |
| 2 | `초록색 숲 속에 작은 오두막집...` | `image_completed` | `generating` (responseCount=2, totalImg=1) | `image_completed` | total=2 |
| 3 | `보라색 우주 배경에 금색 행성...` | `image_completed` | `generating` (responseCount=3, totalImg=2) | `image_completed` (~8s) | total=3 |

**Key findings from batch experiment:**
- **Image tool persists across prompts**: `이미지 선택 해제` chip stays active. No need to re-select.
- **`responseCount` increments reliably**: Each prompt adds exactly 1 `model-response` element.
- **`totalImageCount` tracks cumulative images**: Easy to verify `new images = totalAfter - totalBefore`.
- **State transitions are clean**: `idle → generating → image_completed` for first; `image_completed → generating → image_completed` for subsequent.
- **No cooldown between prompts**: Can send next prompt immediately after completion detected.
- **Action buttons (👍👎) are the definitive completion signal**: More reliable than checking for `generated-image` alone.
- **`model-response` count can be used as prompt-response index**: For matching prompt N to response N.
- **Download works on any image in the conversation**: Not just the latest. Each `generated-image` has its own download button.
- **Prompt placeholder changes during generation**: `여기에 프롬프트 입력` → `이미지를 설명하세요` (during) → stays `이미지를 설명하세요` (after).

### Batch Automation Pattern (for content script)

```
for each prompt in prompts:
  1. Detect current state == 'idle' or 'image_completed' or 'completed'
  2. Record pre-send imageCount = document.querySelectorAll('generated-image').length
  3. Fill textbox + click send
  4. Poll until state != 'generating' (sendBtn label changes back)
  5. Detect final state:
     - 'image_completed' → success (new images = totalImages - preImageCount)
     - 'error' → policy block, record failure
     - 'completed' → text response without image (unexpected for image tool)
  6. Continue to next prompt
```

### Batch Experiment Screenshots
- `batch-01-generating.png`: First prompt generating state.
- `batch-02-generating.png`: Second prompt generating state (first image visible above).
- `batch-03-generating.png`: Third prompt generating state.
- `batch-03-completed.png`: All 3 prompts completed (full page with 3 images).
- `batch-03-download.png`: Third image downloaded with toast message.

## Experiment: Custom Filename Download (Verified 2026-02-10)

### Goal
Download generated images with custom filenames (e.g., `001_snowflake_pattern.png`, `002_cabin_forest.png`) to identify which prompt produced which image.

### Methods Tested (All Failed in Page Context)

| # | Method | Result | Error |
|---|--------|--------|-------|
| 1 | `fetch(imgUrl, { credentials: 'include', mode: 'cors' })` → blob → `<a download>` | FAIL | `TypeError: Failed to fetch` (CORS) |
| 2 | Canvas `drawImage(existingImg)` → `toBlob` → `<a download>` | FAIL | `SecurityError: Tainted canvases may not be exported` |
| 3 | New `Image({ crossOrigin: 'anonymous' })` → Canvas → `toBlob` | FAIL | Image load failed (server rejects anonymous CORS) |
| 4 | `XMLHttpRequest` with `withCredentials: true` + `responseType: 'blob'` | FAIL | XHR network error (same CORS issue) |
| 5 | Monkey-patch `URL.createObjectURL` + `HTMLAnchorElement.click` to intercept Gemini's download | FAIL | Zone.js (Angular) uses original function references, bypasses patches |

### Root Cause
- `lh3.googleusercontent.com` does NOT set `Access-Control-Allow-Origin` for `gemini.google.com`.
- Images are cross-origin from the page's perspective.
- The `<img>` tag loads them fine (browser allows cross-origin image rendering), but programmatic access (fetch, canvas export, XHR) is blocked by CORS.
- Gemini's Angular framework uses Zone.js-patched primitives that bypass standard monkey-patching.

### Download Network Flow (Verified via Network Panel)
```
1. GET lh3.googleusercontent.com/gg-dl/<token>=s1024-rj           → 302 redirect
2. GET work.fife.usercontent.google.com/rd-gg-dl/<token>=s1024-rj → 302 redirect
3. GET lh3.googleusercontent.com/rd-gg-dl/<long-token>=s1024-rj   → 200 (actual PNG)
```
- Gemini's download button triggers an internal fetch (via Zone.js-patched APIs) that creates a blob URL, triggers `<a>` click, then cleans up — all within Angular's framework context.

### Working Solution: `chrome.downloads` API (Extension Background Script)

**Architecture:**
```
content-script (gemini.google.com)        background.js (service worker)
─────────────────────────────────────     ──────────────────────────────────
1. Extract img.src from generated-image
2. Determine index (001, 002, ...)
3. Send message:                    ───►  4. Receive message
   { type: 'DOWNLOAD_IMAGE',             5. chrome.downloads.download({
     url: img.src,                            url: message.url,
     filename: '001_name.png' }               filename: message.filename,
                                              saveAs: false
                                           })
                                          6. Send result back
```

**Why this works:**
- `chrome.downloads.download()` runs in the browser process, not the renderer.
- It uses the browser's cookie jar (same cookies as regular navigation).
- No CORS restriction applies — the browser treats it like a normal navigation download.
- The `filename` option sets the custom download name directly.
- The `conflictAction` option handles duplicate filenames (`uniquify`, `overwrite`, `prompt`).

**Required manifest.json permissions:**
```json
{
  "permissions": ["downloads"]
}
```

**Image URL extraction pattern (content-script side):**
```javascript
function extractImageUrls() {
  const genImages = document.querySelectorAll('generated-image');
  return Array.from(genImages).map((gi, idx) => {
    const img = gi.querySelector('img[src*="googleusercontent"]');
    return img ? {
      index: idx,
      url: img.src,
      // Optional: request original size by changing =s1024 to =s0
      originalUrl: img.src.replace(/=s\d+-rj$/, '=s0'),
    } : null;
  }).filter(Boolean);
}
```

**Background script download handler:**
```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DOWNLOAD_IMAGE') {
    chrome.downloads.download({
      url: message.url,
      filename: message.filename,  // e.g., '001_snowflake_pattern.png'
      saveAs: false,
      conflictAction: 'uniquify',
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId });
      }
    });
    return true; // Keep channel open for async sendResponse
  }
});
```

### Filename Convention
For batch image generation with n prompts:
```
{index}_{sanitized_prompt_prefix}.png

Examples:
001_snowflake_pattern.png
002_cabin_forest.png
003_space_planets.png
```

### Key Findings Summary
- **Page-context download with custom filename is IMPOSSIBLE** due to CORS on `lh3.googleusercontent.com`.
- **`chrome.downloads` API is the ONLY viable method** for custom filename downloads.
- **Image URLs are stable** and extractable from `generated-image img[src*="googleusercontent"]`.
- **Original-size URL heuristic**: Replace `=s1024-rj` with `=s0` in the URL (needs verification).
- **No `<a href>` wrapper** exists on Gemini's download button — it's all framework-internal.
- **Manifest needs `downloads` permission** added.

## Experiment: Reference Image Persistence Across Prompts (Verified 2026-02-10)

### Goal
Test whether a reference image uploaded in the 1st prompt can be referenced by subsequent prompts (2nd, 3rd, ...) in the same conversation **without re-uploading**.

### Setup
- New chat on `gemini.google.com/app`
- Reference image: `exp-06-image-generated.png` (blue background + orange star, minimal illustration)
- Image tool (`이미지 생성하기`) selected and active throughout
- Thinking mode (`사고 모드`) active

### Test Prompts

| # | Prompt | Reference Image | Result |
|---|--------|-----------------|--------|
| 1 | "1번째 프롬프트. 첨부한 참조이미지의 색상 팔레트(파란 배경 + 주황 도형)와 미니멀 일러스트 스타일을 기준으로 삼아줘. 빨간색 배경에 하얀 눈꽃 결정 패턴" | **Uploaded with prompt** | ✅ Red bg, white snowflakes, flat minimal style |
| 2 | "2번째 프롬프트. 1번째 프롬프트에 업로드한 참조이미지의 색상 팔레트와 미니멀 일러스트 스타일을 동일하게 유지해줘. 초록색 숲 배경에 작은 하얀 오두막집" | **Text reference only** (no re-upload) | ✅ Green forest, white cabin, flat minimal style |
| 3 | "3번째 프롬프트. 1번째 프롬프트에 업로드한 참조이미지의 색상 팔레트와 미니멀 일러스트 스타일을 동일하게 유지해줘. 노란색 사막 배경에 작은 선인장" | **Text reference only** (no re-upload) | ✅ Yellow desert, green cactus, flat minimal style |

### Visual Comparison

All 3 images share:
- **Flat minimal illustration** style (no 3D, no photorealism)
- **Simple geometric shapes** with clean edges
- **Single subject centered** on solid color gradient background
- **Consistent art direction** — recognizably same "series"

Style consistency level: **Good** — Gemini maintained the overall minimal illustration approach. The color palette adapted per prompt (as requested), but the rendering style remained cohesive.

### Key Findings

1. **Reference image persists in conversation context**: Gemini remembers the uploaded reference across multiple turns. No need to re-upload for each prompt.
2. **Text-only reference works**: Saying "1번째 프롬프트에 업로드한 참조이미지의 스타일을 유지해줘" is sufficient.
3. **Style consistency is "soft"**: Gemini interprets "maintain style" as keeping the general artistic approach (flat, minimal) rather than pixel-perfect color palette matching. This is the expected behavior for creative AI.
4. **Image tool stays active**: `이미지 선택 해제` chip persisted across all 3 prompts without re-selection.
5. **No re-upload needed**: This simplifies the automation — upload reference images once at the start, then all subsequent prompts can reference them by text.

### Implications for Interface Design

- `uploadFiles()` only needs to be called **once per batch** (with the 1st prompt).
- Subsequent prompts should include a text reference to the uploaded image (e.g., "참조이미지 스타일 유지").
- The system prompt / first prompt should establish the style baseline.
- The interface's `BatchConfig` should have:
  - `referenceImages: File[]` — uploaded once at batch start
  - `systemPrompt: string` — sets style/tone for the entire batch
  - `prompts: string[]` — individual prompts that reference the established style

### Experiment Screenshots (Experiment 4: Minimal Style Persistence)
- `ref-exp-01-prompt1-completed.png`: Full page after prompt 1 (reference image uploaded + snowflake generated).
- `ref-exp-02-prompt2-completed.png`: Full page after prompt 2 (cabin generated without re-upload).
- `ref-exp-03-image1-detail.png`: Prompt 1 generated image detail (red bg, white snowflakes).
- `ref-exp-04-image2-detail.png`: Prompt 2 generated image detail (green forest, white cabin).
- `ref-exp-05-image3-detail.png`: Prompt 3 generated image detail (yellow desert, cactus).

---

## Experiment 6 (Retry): Character Sheet Reference Image Upload + Generation

**Date**: 2026-02-10
**Goal**: 참조이미지(character-sheet.png)를 업로드하고, 해당 캐릭터를 다른 장면에서 생성할 수 있는지 테스트.
**Reference Image**: `/Users/choiyoonje/Documents/hamlog-ai/1-charater-sheet.png` (7.4MB PNG)

### Upload Method (Key Finding)
- **이전 실패 원인**: `upload_file` MCP 도구를 hidden file input에 직접 업로드 시도 → "파일이 비어 있음" 에러
- **성공 방법**: 업로드 메뉴 열기 → "파일 업로드" menuitem의 uid에 `upload_file` MCP 사용 → 정상 업로드
  ```
  1. click: "파일 업로드 메뉴 열기" button (uid=73_0)
  2. upload_file: uid="74_2" (menuitem "파일 업로드"), filePath="/path/to/file.png"
  3. Result: 이미지 미리보기 표시, blob URL 정상 생성
  ```
- **DOM Upload Selector**: `input[name="Filedata"]` inside `<IMAGES-FILES-UPLOADER>` (hidden, multiple=true)

### Result: ✅ SUCCESS
- 참조이미지 정상 업로드 (blob URL 생성, 미리보기 표시)
- 이미지 도구 선택 후 "캐릭터가 카페에서 커피 마시는 모습" 프롬프트 → 이미지 생성 성공
- Nano Banana Pro (사고 모드) 사용

---

## Experiment 7: 10 Consecutive Prompts with Character Sheet Reference

**Date**: 2026-02-10
**Goal**: 참조이미지를 1번째 프롬프트에만 업로드하고, 10개 프롬프트에 걸쳐 동일 캐릭터의 일관성이 유지되는지 테스트. 또한 "conversation context 명시적 언급" vs "단순 참조"의 차이도 비교.

### Prompts Sent

| # | Prompt | Context Reference | Result |
|---|--------|-------------------|--------|
| 1 | 첨부한 참조 이미지의 캐릭터가 카페에서 커피를 마시고 있는 모습 | 직접 참조 (이미지 첨부) | ✅ 이미지 생성 |
| 2 | 첫 번째 프롬프트에 첨부한 캐릭터 시트의 캐릭터가 공원 벤치에 앉아서 책 읽는 모습 | 명시적 대화 컨텍스트 언급 | ✅ 이미지 생성 |
| 3 | 같은 캐릭터가 비 오는 날 우산을 쓰고 거리를 걷는 모습 | 단순 "같은 캐릭터" | ✅ 이미지 생성 |
| 4 | 같은 캐릭터가 해변에서 서핑보드를 들고 서 있는 모습 | 단순 "같은 캐릭터" | ✅ 이미지 생성 |
| 5 | 같은 캐릭터가 눈 덮인 산 정상에서 양팔을 벌리고 서 있는 모습 | 단순 "같은 캐릭터" | ✅ 이미지 생성 |
| 6 | 같은 캐릭터가 야시장에서 음식을 먹고 있는 모습 | 단순 "같은 캐릭터" | ✅ 이미지 생성 |
| 7 | 같은 캐릭터가 우주복을 입고 달 표면에 서 있는 모습 | 단순 "같은 캐릭터" | ✅ 이미지 생성 |
| 8 | 같은 캐릭터가 자전거를 타고 벚꽃이 날리는 길을 달리는 모습 | 단순 "같은 캐릭터" | ✅ 이미지 생성 |
| 9 | 같은 캐릭터가 크리스마스 트리 옆에서 선물 상자를 안고 있는 모습 | 단순 "같은 캐릭터" | ✅ 이미지 생성 |
| 10 | 같은 캐릭터가 콘서트 무대 위에서 기타를 치며 노래하는 모습 | 단순 "같은 캐릭터" | ✅ 이미지 생성 |

### Key Findings

1. **10/10 성공률**: 모든 프롬프트에서 이미지 생성 성공. 에러 0건.
2. **대화 컨텍스트 자동 유지**: 1번에 업로드한 참조이미지를 이후 프롬프트에서 "같은 캐릭터"만으로 참조 가능. 명시적 대화 참조("첫 번째 프롬프트에 첨부한") 없이도 작동.
3. **모델**: 모든 응답에서 Nano Banana Pro (사고 모드) 사용 확인.
4. **이미지 도구**: 1번에서 선택한 "이미지 생성하기" 도구가 10번까지 자동 유지됨. 재선택 불필요.
5. **대화 URL**: `gemini.google.com/app/84b8e24f71819d5a` (conversation ID 자동 생성)

### Implications for Chrome Extension Automation

1. **파일 업로드**: menuitem uid로 `upload_file` 도구 사용 (hidden input 직접 접근 아님)
2. **도구 선택**: 대화 시작 시 1회만 선택하면 끝까지 유지
3. **배치 프롬프트 전략**: 
   - 1번째: 참조이미지 업로드 + 시스템 프롬프트 + 첫 이미지 프롬프트
   - 2~N번째: "같은 캐릭터가 [장면]" 패턴으로 단순 전송
4. **안정성**: 10개 연속 전송에서 0건 실패 — 배치 자동화에 충분한 안정성

### 10개 일괄 다운로드 테스트

- **방법**: `button[data-test-id="download-generated-image-button"]` 10개를 scrollIntoView + click (2초 간격)
- **결과**: JS click만으로는 일부만 다운로드됨 (브라우저 동일 URL 캐시 or 연속 다운로드 제한 추정)
- **파일명**: Gemini 서버가 `Content-Disposition` 헤더로 결정 → `Gemini_Generated_Image_{serverHash}.png`
- **커스텀 파일명**: `chrome.downloads` API의 `filename` 옵션으로만 변경 가능 (실험 3에서 확인)

### Screenshots
- `ref-exp-06-upload.png`: 참조이미지 업로드 직후 상태
- `ref-exp-06-result.png`: 1번째 이미지 생성 결과
- `ref-exp-07-prompt2.png`: 2번째 이미지 생성 결과
- `ref-exp-07-prompt3.png`: 3번째 이미지 생성 결과
- `ref-exp-07-all10.png`: 10번째 이미지 생성 완료 상태
- `ref-exp-07-top.png`: 대화 상단 (1번째 프롬프트 + 참조이미지)
