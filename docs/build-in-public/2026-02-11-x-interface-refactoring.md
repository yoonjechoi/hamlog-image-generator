---
platform: x
date: 2026-02-11
topic: Hamlog Image Generator — Gemini chat automation complete
tags: [build-in-public, chrome-extension, gemini, ai-image]
---

# My Chrome Extension can now control the Gemini chat window

## 1/5

Making a webtoon? Same character, 50 different scenes. On Gemini that's: type prompt, wait, download, repeat. For every single image.

I'm building a Chrome Extension to automate this. One reference image, a list of prompts, hit start. It generates and downloads everything.

## 2/5

Today, Gemini chat automation is complete. It can:
- Start new chats
- Upload reference images
- Pick image generation tools
- Send prompts and get results
- Download images with custom filenames
- Switch fast/thinking modes
- Cancel mid-batch

All one line of code each.

## 3/5

Got here by experimenting with Claude Code. Opened Gemini, clicked every button, documented how the DOM responds. 53 screenshots.

Fun findings: reference images persist across the conversation. Image tool stays selected too. Zero failures in a 10-image batch test.

## 4/5

Originally "send prompt" and "wait for response" were separate calls. In practice, you always call both together. So we merged them into one: generate().

17 methods down to 11. Internal stuff hidden as private. The surface is simple; the internals handle the complexity.

## 5/5

Chat automation is done. Next up:
1. Wire it into the actual Chrome Extension
2. Build the UI — enter prompts, hit "start", watch it go
3. Image gallery — browse everything you've generated

Knowing how to steer is one thing. Actually driving is another.

#BuildInPublic #ChromeExtension
