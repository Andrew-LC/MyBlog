---
title: "Minimalist UI & Why Less Motion Feels Faster"
description: "Notes on stripping away heavy layout animations in favor of crisp typography, warm paper tones, and instant page transitions."
date: "2026-10-12"
tags: ["ui", "design", "nextjs"]
featured: true
---

## Rethinking Web Polish

When building personal sites, it is tempting to reach for heavy page-transition wrappers and spring physics on every element. Over time, though, excessive motion gets in the way of what visitors actually came for: **reading and exploring ideas**.

### Core Principles of the New UI

1. **Typography First**: Generous line height, comfortable reading measure (`65ch–70ch`), and zero justified-text rivers on mobile screens.
2. **Warm Light & Deep Ink Dark Modes**: Inspired by Japanese washi paper in light mode and quiet midnight ink in dark mode, accented with subtle sakura pink highlights.
3. **Instant Navigation**: Static generation with Next.js App Router means every note—whether written in `.org`, `.md`, or Notion—loads instantaneously.

```ts
export const UI_PHILOSOPHY = {
  animations: "minimal",
  contentSources: ["org-roam", "markdown", "notion"],
  focus: "clarity",
} as const;
```
