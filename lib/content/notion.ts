import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import type { BlogPost } from "./types";
import { renderMarkdownToHtml } from "./markdown";
import { estimateReadingTime } from "./org";

/**
 * Optional Notion CMS adapter.
 * Gracefully returns [] when NOTION_AUTH_KEY / AUTH_KEY or NOTION_DATABASE_ID / DATABASE_ID
 * are not configured, so local Org-roam and Markdown development works without API keys.
 */
export async function getNotionPosts(): Promise<BlogPost[]> {
  const authKey = process.env.NOTION_AUTH_KEY || process.env.AUTH_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID || process.env.DATABASE_ID;

  if (!authKey || !databaseId) {
    return [];
  }

  try {
    const notion = new Client({ auth: authKey });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const posts: BlogPost[] = [];

    for (const page of response.results) {
      if (!("properties" in page)) continue;
      const props = page.properties as Record<string, any>;

      const title =
        props.Name?.title?.[0]?.plain_text ||
        props.Title?.title?.[0]?.plain_text ||
        "Untitled Notion Note";

      const description =
        props.Description?.rich_text?.[0]?.plain_text || "";

      const date =
        props.Date?.date?.start ||
        ("created_time" in page ? String(page.created_time).slice(0, 10) : "2026-01-01");

      const rawTags: string[] =
        props.Tags?.multi_select?.map((t: { name: string }) => t.name.toLowerCase()) || [];

      const featured = rawTags.includes("featured post") || rawTags.includes("featured");
      const cleanTags = rawTags.filter((t) => t !== "featured post" && t !== "featured");

      const id = page.id.replace(/-/g, "");
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || id;

      const mdblocks = await n2m.pageToMarkdown(page.id);
      const mdResult = n2m.toMarkdownString(mdblocks);
      const mdString = typeof mdResult === "string" ? mdResult : mdResult.parent || "";

      const htmlContent = await renderMarkdownToHtml(mdString);

      posts.push({
        slug,
        id,
        title,
        description,
        date,
        tags: cleanTags,
        featured,
        source: "notion",
        readingTime: estimateReadingTime(mdString),
        htmlContent,
      });
    }

    return posts;
  } catch (err) {
    console.warn("[Notion Adapter] Skipping Notion fetch:", (err as Error).message);
    return [];
  }
}
