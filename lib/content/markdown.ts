import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import type { BlogPost } from "./types";
import { estimateReadingTime } from "./org";

const MD_DIR = path.join(process.cwd(), "content", "posts");

export async function renderMarkdownToHtml(mdString: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect: true, ignoreMissing: true })
    .use(rehypeStringify)
    .process(mdString);

  return String(file);
}

export async function getMarkdownPosts(): Promise<BlogPost[]> {
  if (!fs.existsSync(MD_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(MD_DIR)
    .filter((f) => (f.endsWith(".md") || f.endsWith(".mdx")) && !f.startsWith("."));

  const posts: BlogPost[] = [];

  for (const file of files) {
    const slug = file.replace(/\.(mdx|md)$/, "").toLowerCase();
    const fullPath = path.join(MD_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);

    const htmlContent = await renderMarkdownToHtml(content);

    const title = typeof data.title === "string" ? data.title : slug.replace(/-/g, " ");
    const description =
      typeof data.description === "string"
        ? data.description
        : content.trim().split("\n")[0]?.slice(0, 155) || "";

    const rawDate =
      data.date instanceof Date
        ? data.date.toISOString().slice(0, 10)
        : typeof data.date === "string"
        ? data.date
        : new Date().toISOString().slice(0, 10);

    const tags = Array.isArray(data.tags)
      ? data.tags.map((t: unknown) => String(t).toLowerCase())
      : [];

    const featured = Boolean(data.featured);

    posts.push({
      slug,
      id: slug,
      title,
      description,
      date: rawDate,
      tags,
      featured,
      source: "markdown",
      readingTime: estimateReadingTime(content),
      htmlContent,
    });
  }

  return posts;
}
