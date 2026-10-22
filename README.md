# MyBlog — Next.js 15 + TypeScript + Org-Roam Digital Garden

Personal website and digital garden for **Andrew Lamichhane**, built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, a procedural **Digital Sakura Pixel Tree** canvas centerpiece, and a **Multi-Source Content Engine** supporting:

1. **Emacs Org-Roam / Org-Mode (`.org`)** — Native parsing via `uniorg` + `rehype`, automatic `[[id:...]]` link resolution, and bidirectional backlinks.
2. **Local Markdown (`.md` / `.mdx`)** — YAML frontmatter + GFM via `gray-matter` & `remark`.
3. **Notion CMS (Optional)** — Env-gated integration via `@notionhq/client` & `notion-to-md`.

---

## Quick Start

```bash
npm install
npm run dev
```

---

## Transitioning Emacs Org-Roam Notes to Blogs

### Option 1: Sync from `~/org-roam` via CLI
1. Add `:blog:` to `#+FILETAGS:` (or add `#+BLOG: t`) in any Org-roam note you want to publish:
   ```org
   :PROPERTIES:
   :ID: 8f4b2c10-9e3a-4d71-b812-3019a8c4e001
   :END:
   #+TITLE: My Note Title
   #+DATE: <2026-10-22 Thu>
   #+DESCRIPTION: Optional short summary for cards and SEO.
   #+FILETAGS: :blog:featured:emacs:
   ```
2. Run the sync command:
   ```bash
   npm run sync:roam
   # Or specify a custom path:
   npm run sync:roam -- /path/to/your/org-roam
   ```
   - Published `[[id:...][Label]]` links between `:blog:` notes automatically convert into internal `/post/<slug>` links and generate **Backlinks** at the bottom of the target post.
   - Links to private (untagged) Org-roam nodes are safely unwrapped into plain text so broken links never leak.

### Option 2: Drop `.org` or `.md` files directly
- Place `.org` files in `content/org/`
- Place `.md` files in `content/posts/`

### Option 3: Optional Notion CMS
Create a `.env.local` file if you also want to pull posts from Notion:
```env
NOTION_AUTH_KEY=secret_...
NOTION_DATABASE_ID=...
ORG_ROAM_DIR=/home/xenos/org-roam
```
