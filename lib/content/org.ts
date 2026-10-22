import fs from "fs";
import path from "path";
import { unified } from "unified";
import uniorgParse from "uniorg-parse";
import uniorgRehype from "uniorg-rehype";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import type { BlogPost } from "./types";

const ORG_DIR = path.join(process.cwd(), "content", "org");

export function estimateReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

/**
 * Normalizes Org-roam and Denote filenames such as:
 *   20260419220828--attention_is_all_you_need__ml_paper.org
 *   20230610130951-recursion.org
 */
export function parseOrgFileName(fileName: string): {
  slug: string;
  inferredDate?: string;
  inferredTags: string[];
} {
  const base = fileName.replace(/\.org$/i, "");
  let inferredDate: string | undefined;

  const tsMatch = base.match(/^(\d{4})(\d{2})(\d{2})\d{0,6}[-_]+/);
  if (tsMatch) {
    inferredDate = `${tsMatch[1]}-${tsMatch[2]}-${tsMatch[3]}`;
  }

  // Extract Denote-style __tag1_tag2 suffix if present
  const inferredTags: string[] = [];
  const [namePart, tagPart] = base.split("__");
  if (tagPart) {
    for (const t of tagPart.split("_").filter(Boolean)) {
      inferredTags.push(t.toLowerCase());
    }
  }

  const slug = namePart
    .replace(/^\d{8,14}[-_]+/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return {
    slug: slug || "untitled-note",
    inferredDate,
    inferredTags,
  };
}

/**
 * Extracts Org-mode file-level metadata (#+TITLE, #+DATE, #+DESCRIPTION, #+FILETAGS, #+FEATURED)
 * and top-level Org-roam :PROPERTIES: (:ID:, :ROAM_ALIASES:) before handing body to uniorg.
 */
export function parseOrgMetadataAndBody(raw: string, fileName: string) {
  const { slug, inferredDate, inferredTags } = parseOrgFileName(fileName);

  let roamId: string | undefined;
  let title = slug.replace(/-/g, " ");
  let description = "";
  let date = inferredDate || new Date().toISOString().slice(0, 10);
  const tags = new Set<string>(inferredTags);
  let featured = false;

  // Extract top-level :PROPERTIES: drawer if present (standard in Org-roam v2)
  const propDrawerRegex = /^\s*:PROPERTIES:\s*\n([\s\S]*?)^\s*:END:\s*\n?/m;
  const propMatch = raw.match(propDrawerRegex);
  if (propMatch) {
    const idMatch = propMatch[1].match(/^\s*:ID:\s*(.+)$/im);
    if (idMatch) {
      roamId = idMatch[1].trim();
    }
  }

  // Strip property drawers so they don't render as raw text in the HTML body
  const cleaned = raw.replace(
    /^\s*:PROPERTIES:\s*\n[\s\S]*?^\s*:END:\s*\n?/gm,
    ""
  );

  // Scan #+KEY: VALUE directives
  const lines = cleaned.split(/\r?\n/);
  const bodyLines: string[] = [];

  for (const line of lines) {
    const kwMatch = line.match(/^\s*#\+([A-Za-z_]+):\s*(.*)$/);
    if (kwMatch) {
      const key = kwMatch[1].toUpperCase();
      const val = kwMatch[2].trim();

      if (key === "TITLE") {
        title = val;
        continue;
      }
      if (key === "DESCRIPTION" || key === "SUMMARY") {
        description = val;
        continue;
      }
      if (key === "DATE") {
        const dateClean = val.replace(/^[<[]|[>\]]$/g, "").split(" ")[0];
        if (dateClean) date = dateClean;
        continue;
      }
      if (key === "FILETAGS" || key === "TAGS") {
        const parsedTags = val
          .split(/[:\s,]+/)
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
        for (const t of parsedTags) {
          if (t === "featured") {
            featured = true;
          } else if (t !== "blog") {
            tags.add(t);
          }
        }
        continue;
      }
      if (key === "FEATURED") {
        featured =
          val.toLowerCase() === "t" ||
          val.toLowerCase() === "true" ||
          val.toLowerCase() === "yes";
        continue;
      }
      if (
        key === "BLOG" ||
        key === "PUBLISH" ||
        key === "STARTUP" ||
        key === "OPTIONS" ||
        key === "ROAM_KEY" ||
        key === "ROAM_TAGS"
      ) {
        continue;
      }
    }
    bodyLines.push(line);
  }

  const bodyOrg = bodyLines.join("\n").trim();

  // Find outbound Org-roam [[id:...]] links
  const outboundRoamIds: string[] = [];
  const idLinkRegex = /\[\[id:([^\][\]]+)\](?:\[([^\][\]]+)\])?\]/g;
  let match: RegExpExecArray | null;
  while ((match = idLinkRegex.exec(bodyOrg)) !== null) {
    outboundRoamIds.push(match[1].trim());
  }

  // Fallback description from first non-heading paragraph if none specified
  if (!description) {
    const firstPara = bodyLines
      .filter(
        (l) =>
          l.trim() &&
          !l.trim().startsWith("*") &&
          !l.trim().startsWith("#+") &&
          !l.trim().startsWith("[[file:")
      )
      .slice(0, 2)
      .join(" ")
      .replace(/\[\[(?:[^\][\]]+)\](?:\[([^\][\]]+)\])?\]/g, "$1")
      .replace(/[=~*]/g, "")
      .trim();
    description =
      firstPara.length > 160 ? `${firstPara.slice(0, 157)}...` : firstPara;
  }

  return {
    slug,
    title,
    description,
    date,
    tags: Array.from(tags),
    featured,
    roamId,
    outboundRoamIds,
    bodyOrg,
  };
}

/**
 * Loads all .org files from content/org/ and converts them to HTML via uniorg + rehype.
 */
export async function getOrgPosts(): Promise<
  (BlogPost & { rawBodyOrg: string })[]
> {
  if (!fs.existsSync(ORG_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(ORG_DIR)
    .filter((f) => f.endsWith(".org") && !f.startsWith("."));

  const posts: (BlogPost & { rawBodyOrg: string })[] = [];

  for (const file of files) {
    const fullPath = path.join(ORG_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const meta = parseOrgMetadataAndBody(raw, file);
    const htmlContent = await renderOrgToHtml(meta.bodyOrg);

    posts.push({
      slug: meta.slug,
      id: meta.roamId || meta.slug,
      title: meta.title,
      description: meta.description,
      date: meta.date,
      tags: meta.tags,
      featured: meta.featured,
      source: "org",
      fileName: file,
      readingTime: estimateReadingTime(meta.bodyOrg),
      roamId: meta.roamId,
      outboundRoamIds: meta.outboundRoamIds,
      htmlContent,
      rawContent: raw,
      rawBodyOrg: meta.bodyOrg,
    });
  }

  return posts;
}

export async function renderOrgToHtml(orgString: string): Promise<string> {
  const file = await unified()
    .use(uniorgParse)
    .use(uniorgRehype)
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect: true, ignoreMissing: true })
    .use(rehypeStringify)
    .process(orgString);

  return String(file);
}
