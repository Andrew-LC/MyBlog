import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
  isOwnerAuthenticated,
  verifyPasscode,
} from "@/lib/admin-auth";
import { getAllPosts, getNoteGraphData } from "@/lib/content";
import {
  getConfiguredVaultDirs,
  publishVaultNoteToBlog,
  scanOrgVaults,
  unpublishBlogNote,
} from "@/lib/content/vault";

export async function GET() {
  const authed = await isOwnerAuthenticated();
  if (!authed) {
    return NextResponse.json({ authenticated: false });
  }

  const [publishedPosts, fullGraph] = await Promise.all([
    getAllPosts(),
    getNoteGraphData(true),
  ]);
  const vaultNotes = scanOrgVaults();
  const vaultDirs = getConfiguredVaultDirs();

  return NextResponse.json({
    authenticated: true,
    vaultDirs,
    vaultNotes,
    publishedPosts,
    fullGraph,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body;

  if (action === "login") {
    const { passcode } = body;
    if (!verifyPasscode(String(passcode || ""))) {
      return NextResponse.json(
        { error: "Invalid owner passcode." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true, authenticated: true });
    res.cookies.set(ADMIN_COOKIE_NAME, createAdminToken(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  }

  if (action === "logout") {
    const res = NextResponse.json({ ok: true, authenticated: false });
    res.cookies.delete(ADMIN_COOKIE_NAME);
    return res;
  }

  // All subsequent CMS actions require owner authentication
  const authed = await isOwnerAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (action === "publish_vault") {
    const { vaultPath, featured } = body;
    const result = publishVaultNoteToBlog(String(vaultPath), {
      featured: Boolean(featured),
    });
    revalidatePath("/");
    revalidatePath("/blogs");
    revalidatePath(`/post/${result.slug}`);
    return NextResponse.json({ ok: true, slug: result.slug });
  }

  if (action === "unpublish") {
    const { slug, source } = body;
    if (source === "markdown") {
      const mdPath = path.join(process.cwd(), "content", "posts", `${slug}.md`);
      if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);
    } else {
      unpublishBlogNote(String(slug));
    }
    revalidatePath("/");
    revalidatePath("/blogs");
    return NextResponse.json({ ok: true });
  }

  if (action === "save_note") {
    const { format, slug, title, description, tags, featured, content } = body;
    const cleanSlug = String(slug || title || "new-note")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const dateStr = new Date().toISOString().slice(0, 10);
    const tagList = String(tags || "")
      .split(/[,:\s]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (format === "markdown") {
      const outDir = path.join(process.cwd(), "content", "posts");
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const fileContent = [
        "---",
        `title: "${String(title).replace(/"/g, '\\"')}"`,
        `description: "${String(description || "").replace(/"/g, '\\"')}"`,
        `date: "${dateStr}"`,
        `tags: [${tagList.map((t) => `"${t}"`).join(", ")}]`,
        `featured: ${Boolean(featured)}`,
        "---",
        "",
        String(content || "").trim(),
        "",
      ].join("\n");
      fs.writeFileSync(
        path.join(outDir, `${cleanSlug}.md`),
        fileContent,
        "utf8"
      );
    } else {
      const outDir = path.join(process.cwd(), "content", "org");
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const allOrgTags = ["blog", ...(featured ? ["featured"] : []), ...tagList];
      const fileContent = [
        `#+TITLE: ${title}`,
        `#+DATE: <${dateStr}>`,
        description ? `#+DESCRIPTION: ${description}` : "",
        `#+FILETAGS: :${allOrgTags.join(":")}:`,
        "",
        String(content || "").trim(),
        "",
      ]
        .filter((line, idx) => idx > 3 || Boolean(line))
        .join("\n");
      fs.writeFileSync(
        path.join(outDir, `${cleanSlug}.org`),
        fileContent,
        "utf8"
      );
    }

    revalidatePath("/");
    revalidatePath("/blogs");
    revalidatePath(`/post/${cleanSlug}`);
    return NextResponse.json({ ok: true, slug: cleanSlug });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
