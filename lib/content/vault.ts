import fs from "fs";
import os from "os";
import path from "path";
import { parseOrgMetadataAndBody } from "./org";

export interface VaultNoteItem {
  vaultName: string;
  vaultPath: string;
  fileName: string;
  slug: string;
  roamId?: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  outboundRoamIds: string[];
  wordCount: number;
  isPublished: boolean;
  isFeatured: boolean;
}

const SKIP_DIRS = new Set([
  "daily",
  "data",
  "ltximg",
  "output",
  "raw",
  "images",
  ".git",
  "node_modules",
]);

const SKIP_FILES = new Set(["inbox.org", "tasks.org", "projects.org"]);

export function getConfiguredVaultDirs(): { name: string; dir: string }[] {
  const home = os.homedir();
  const candidates: { name: string; dir: string }[] = [];

  if (process.env.ORG_ROAM_DIR) {
    const customDir = process.env.ORG_ROAM_DIR.replace(/^~(?=$|\/|\\)/, home);
    candidates.push({ name: path.basename(customDir), dir: customDir });
  }

  candidates.push(
    {
      name: "zen_o_jidai_o_koeta",
      dir: path.join(home, "Documents", "zen_o_jidai_o_koeta"),
    },
    {
      name: "MyDB",
      dir: path.join(home, "Documents", "MyDB"),
    },
    {
      name: "org-roam",
      dir: path.join(home, "org-roam"),
    }
  );

  const seen = new Set<string>();
  return candidates.filter((c) => {
    const resolved = path.resolve(c.dir);
    if (seen.has(resolved) || !fs.existsSync(resolved)) return false;
    seen.add(resolved);
    return true;
  });
}

function collectVaultOrgFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name.toLowerCase())) {
        files.push(...collectVaultOrgFiles(full));
      }
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".org") &&
      !SKIP_FILES.has(entry.name.toLowerCase())
    ) {
      files.push(full);
    }
  }
  return files;
}

export function scanOrgVaults(): VaultNoteItem[] {
  const vaults = getConfiguredVaultDirs();
  const publishedOrgDir = path.join(process.cwd(), "content", "org");

  // Map published slugs & roamIds in content/org
  const publishedSlugs = new Set<string>();
  const publishedRoamIds = new Set<string>();
  const featuredSlugs = new Set<string>();

  if (fs.existsSync(publishedOrgDir)) {
    for (const file of fs.readdirSync(publishedOrgDir)) {
      if (!file.endsWith(".org")) continue;
      const raw = fs.readFileSync(path.join(publishedOrgDir, file), "utf8");
      const meta = parseOrgMetadataAndBody(raw, file);
      publishedSlugs.add(meta.slug);
      if (meta.roamId) publishedRoamIds.add(meta.roamId);
      if (meta.featured) featuredSlugs.add(meta.slug);
    }
  }

  const results: VaultNoteItem[] = [];

  for (const vault of vaults) {
    const files = collectVaultOrgFiles(vault.dir);
    for (const filePath of files) {
      const fileName = path.basename(filePath);
      const raw = fs.readFileSync(filePath, "utf8");
      const meta = parseOrgMetadataAndBody(raw, fileName);

      // Skip empty stub files with no title or 0 words
      const wordCount = meta.bodyOrg
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      if (meta.slug === "untitled-note" && wordCount < 3) continue;

      const isPublished =
        publishedSlugs.has(meta.slug) ||
        Boolean(meta.roamId && publishedRoamIds.has(meta.roamId));

      results.push({
        vaultName: vault.name,
        vaultPath: filePath,
        fileName,
        slug: meta.slug,
        roamId: meta.roamId,
        title: meta.title,
        description: meta.description,
        date: meta.date,
        tags: meta.tags.length > 0 ? meta.tags : [vault.name.toLowerCase()],
        outboundRoamIds: meta.outboundRoamIds,
        wordCount,
        isPublished,
        isFeatured: featuredSlugs.has(meta.slug) || meta.featured,
      });
    }
  }

  results.sort((a, b) => (a.date < b.date ? 1 : -1));
  return results;
}

/**
 * Publishes an Org-roam vault file into content/org/<slug>.org,
 * copying any local [[file:images/...]] assets into public/org-images/.
 */
export function publishVaultNoteToBlog(
  vaultPath: string,
  options?: { featured?: boolean }
): { slug: string; targetPath: string } {
  if (!fs.existsSync(vaultPath)) {
    throw new Error(`Vault file not found: ${vaultPath}`);
  }

  const fileName = path.basename(vaultPath);
  let raw = fs.readFileSync(vaultPath, "utf8");
  const meta = parseOrgMetadataAndBody(raw, fileName);
  const vaultDir = path.dirname(vaultPath);

  // Copy local [[file:images/...]] attachments if present
  const publicImgDir = path.join(process.cwd(), "public", "org-images");
  raw = raw.replace(
    /\[\[file:(images\/[^\][\]]+)\](?:\[([^\][\]]+)\])?\]/g,
    (full, relImgPath: string) => {
      const srcImg = path.join(vaultDir, relImgPath);
      if (fs.existsSync(srcImg)) {
        if (!fs.existsSync(publicImgDir)) {
          fs.mkdirSync(publicImgDir, { recursive: true });
        }
        const imgBase = path.basename(relImgPath);
        const destImg = path.join(publicImgDir, imgBase);
        fs.copyFileSync(srcImg, destImg);
        return `[[/org-images/${imgBase}]]`;
      }
      return full;
    }
  );

  // Ensure #+FILETAGS: contains :blog: (and :featured: if requested)
  if (options?.featured) {
    if (/^\s*#\+FEATURED:/im.test(raw)) {
      raw = raw.replace(/^\s*#\+FEATURED:.*$/im, "#+FEATURED: t");
    } else {
      raw = raw.replace(
        /^(\s*#\+TITLE:.*$)/im,
        `$1\n#+FEATURED: t`
      );
    }
  }

  const outDir = path.join(process.cwd(), "content", "org");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const targetPath = path.join(outDir, `${meta.slug}.org`);
  fs.writeFileSync(targetPath, raw, "utf8");

  return { slug: meta.slug, targetPath };
}

export function unpublishBlogNote(slug: string): boolean {
  const orgDir = path.join(process.cwd(), "content", "org");
  if (!fs.existsSync(orgDir)) return false;

  for (const file of fs.readdirSync(orgDir)) {
    if (!file.endsWith(".org")) continue;
    const full = path.join(orgDir, file);
    const raw = fs.readFileSync(full, "utf8");
    const meta = parseOrgMetadataAndBody(raw, file);
    if (meta.slug === slug) {
      fs.unlinkSync(full);
      return true;
    }
  }
  return false;
}
