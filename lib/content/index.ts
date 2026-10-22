import type {
  BacklinkRef,
  BlogPost,
  BlogPostMeta,
  GraphEdge,
  GraphNode,
  NoteGraphData,
} from "./types";
import { getOrgPosts, renderOrgToHtml } from "./org";
import { getMarkdownPosts } from "./markdown";
import { getNotionPosts } from "./notion";
import { scanOrgVaults } from "./vault";

export * from "./types";

/**
 * Fetches all blog posts across Emacs Org-roam (.org), local Markdown (.md/.mdx),
 * and Notion CMS (optional), resolves Org-roam [[id:...]] internal links, and
 * populates bidirectional backlinks.
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const [orgPostsRaw, mdPosts, notionPosts] = await Promise.all([
    getOrgPosts(),
    getMarkdownPosts(),
    getNotionPosts(),
  ]);

  const roamIdMap = new Map<string, { slug: string; title: string }>();
  for (const post of orgPostsRaw) {
    if (post.roamId) {
      roamIdMap.set(post.roamId, { slug: post.slug, title: post.title });
    }
  }

  // Second pass on Org posts: rewrite [[id:UUID][Label]] to [[/post/slug][Label]] if published,
  // or plain Label if referencing a private/unpublished Org-roam node.
  const orgPosts: BlogPost[] = await Promise.all(
    orgPostsRaw.map(async (post) => {
      const hasIdLinks = /\[\[id:([^\][\]]+)\](?:\[([^\][\]]+)\])?\]/.test(
        post.rawBodyOrg
      );

      let htmlContent = post.htmlContent;
      if (hasIdLinks) {
        const rewrittenOrg = post.rawBodyOrg.replace(
          /\[\[id:([^\][\]]+)\](?:\[([^\][\]]+)\])?\]/g,
          (_full, targetId: string, label?: string) => {
            const cleanId = targetId.trim();
            const target = roamIdMap.get(cleanId);
            const display = label?.trim() || target?.title || cleanId;
            if (target) {
              return `[[/post/${target.slug}][${display}]]`;
            }
            return display;
          }
        );
        htmlContent = await renderOrgToHtml(rewrittenOrg);
      }

      const { rawBodyOrg: _unused, ...cleanPost } = post;
      return {
        ...cleanPost,
        htmlContent,
      };
    })
  );

  const allPosts: BlogPost[] = [...orgPosts, ...mdPosts, ...notionPosts];

  // Build bidirectional backlinks map (slug -> BacklinkRef[])
  const backlinksBySlug = new Map<string, BacklinkRef[]>();

  for (const sourcePost of allPosts) {
    const linkedSlugs = new Set<string>();

    if (sourcePost.outboundRoamIds) {
      for (const roamId of sourcePost.outboundRoamIds) {
        const target = roamIdMap.get(roamId);
        if (target && target.slug !== sourcePost.slug) {
          linkedSlugs.add(target.slug);
        }
      }
    }

    const hrefRegex = /href=["']\/post\/([a-z0-9-_]+)["']/gi;
    let match: RegExpExecArray | null;
    while ((match = hrefRegex.exec(sourcePost.htmlContent)) !== null) {
      const targetSlug = match[1].toLowerCase();
      if (targetSlug !== sourcePost.slug) {
        linkedSlugs.add(targetSlug);
      }
    }

    for (const targetSlug of linkedSlugs) {
      const list = backlinksBySlug.get(targetSlug) || [];
      list.push({
        slug: sourcePost.slug,
        title: sourcePost.title,
        description: sourcePost.description,
        source: sourcePost.source,
      });
      backlinksBySlug.set(targetSlug, list);
    }
  }

  for (const post of allPosts) {
    post.backlinks = backlinksBySlug.get(post.slug) || [];
  }

  allPosts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return allPosts;
}

export async function getAllPostsMeta(): Promise<BlogPostMeta[]> {
  const posts = await getAllPosts();
  return posts.map(({ htmlContent: _html, rawContent: _raw, ...meta }) => meta);
}

export async function getFeaturedPosts(): Promise<BlogPostMeta[]> {
  const metas = await getAllPostsMeta();
  const featured = metas.filter((p) => p.featured);
  return featured.length > 0 ? featured : metas.slice(0, 3);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return (
    posts.find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
    ) || null
  );
}

/**
 * Generates the interconnected Knowledge Graph of notes.
 * - When includePrivateVault is false: includes all published blog notes.
 * - When includePrivateVault is true: also includes unpublished local Org-roam vault notes.
 */
export async function getNoteGraphData(
  includePrivateVault = false
): Promise<NoteGraphData> {
  const posts = await getAllPosts();
  const nodesMap = new Map<string, GraphNode>();
  const roamIdToNodeId = new Map<string, string>();
  const outboundByNodeId = new Map<string, Set<string>>();

  for (const post of posts) {
    const nodeId = post.slug;
    nodesMap.set(nodeId, {
      id: nodeId,
      slug: post.slug,
      title: post.title,
      source: post.source,
      tags: post.tags,
      date: post.date,
      published: true,
      featured: post.featured,
      degree: 0,
      description: post.description,
    });
    if (post.roamId) {
      roamIdToNodeId.set(post.roamId, nodeId);
    }
  }

  if (includePrivateVault) {
    const vaultItems = scanOrgVaults();
    for (const v of vaultItems) {
      if (nodesMap.has(v.slug)) {
        const existing = nodesMap.get(v.slug)!;
        existing.vaultPath = v.vaultPath;
        if (v.roamId) roamIdToNodeId.set(v.roamId, existing.id);
        continue;
      }
      const nodeId = `vault:${v.slug}`;
      nodesMap.set(nodeId, {
        id: nodeId,
        slug: v.slug,
        title: v.title,
        source: "vault",
        tags: v.tags,
        date: v.date,
        published: false,
        degree: 0,
        vaultPath: v.vaultPath,
        description: v.description,
      });
      if (v.roamId) {
        roamIdToNodeId.set(v.roamId, nodeId);
      }
    }

    for (const v of vaultItems) {
      const fromId = nodesMap.has(v.slug) ? v.slug : `vault:${v.slug}`;
      if (!nodesMap.has(fromId)) continue;
      const set = outboundByNodeId.get(fromId) || new Set<string>();
      for (const targetRoamId of v.outboundRoamIds) {
        const targetNodeId = roamIdToNodeId.get(targetRoamId);
        if (targetNodeId && targetNodeId !== fromId) {
          set.add(targetNodeId);
        }
      }
      outboundByNodeId.set(fromId, set);
    }
  }

  // Record explicit links from published posts
  for (const post of posts) {
    const fromId = post.slug;
    const set = outboundByNodeId.get(fromId) || new Set<string>();

    if (post.outboundRoamIds) {
      for (const roamId of post.outboundRoamIds) {
        const targetId = roamIdToNodeId.get(roamId);
        if (targetId && targetId !== fromId) {
          set.add(targetId);
        }
      }
    }

    const hrefRegex = /href=["']\/post\/([a-z0-9-_]+)["']/gi;
    let match: RegExpExecArray | null;
    while ((match = hrefRegex.exec(post.htmlContent)) !== null) {
      const targetSlug = match[1].toLowerCase();
      if (nodesMap.has(targetSlug) && targetSlug !== fromId) {
        set.add(targetSlug);
      }
    }

    outboundByNodeId.set(fromId, set);
  }

  const edges: GraphEdge[] = [];
  const edgeKeys = new Set<string>();

  const addEdge = (a: string, b: string, kind: "link" | "tag", label?: string) => {
    const [u, v] = a < b ? [a, b] : [b, a];
    const key = `${kind}:${u}<->${v}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ source: a, target: b, kind, label });

    const nodeA = nodesMap.get(a);
    const nodeB = nodesMap.get(b);
    if (nodeA) nodeA.degree += kind === "link" ? 2 : 1;
    if (nodeB) nodeB.degree += kind === "link" ? 2 : 1;
  };

  for (const [fromId, targets] of outboundByNodeId.entries()) {
    for (const toId of targets) {
      if (nodesMap.has(toId)) {
        addEdge(fromId, toId, "link");
      }
    }
  }

  // Add shared-tag edges so related notes cluster organically
  const allNodes = Array.from(nodesMap.values());
  for (let i = 0; i < allNodes.length; i++) {
    for (let j = i + 1; j < allNodes.length; j++) {
      const shared = allNodes[i].tags.filter((t) =>
        allNodes[j].tags.includes(t)
      );
      if (shared.length > 0) {
        addEdge(allNodes[i].id, allNodes[j].id, "tag", `#${shared[0]}`);
      }
    }
  }

  return {
    nodes: allNodes,
    edges,
  };
}
