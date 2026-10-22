"use client";

import { useMemo, useState } from "react";
import { Search, Network, FileText, Database, Layers } from "lucide-react";
import type { BlogPostMeta, ContentSource } from "@/lib/content/types";
import PostCard from "./PostCard";

const SOURCE_FILTERS: {
  id: "all" | ContentSource;
  label: string;
  icon: typeof Layers;
}[] = [
  { id: "all", label: "All Notes", icon: Layers },
  { id: "org", label: "Org-Roam (.org)", icon: Network },
  { id: "markdown", label: "Markdown (.md)", icon: FileText },
  { id: "notion", label: "Notion CMS", icon: Database },
];

export default function BlogFilterList({ posts }: { posts: BlogPostMeta[] }) {
  const [sourceFilter, setSourceFilter] = useState<"all" | ContentSource>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) {
      for (const t of p.tags) {
        counts.set(t, (counts.get(t) || 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      if (sourceFilter !== "all" && post.source !== sourceFilter) return false;
      if (selectedTag && !post.tags.includes(selectedTag)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const inTitle = post.title.toLowerCase().includes(q);
        const inDesc = post.description.toLowerCase().includes(q);
        const inTags = post.tags.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inTags) return false;
      }
      return true;
    });
  }, [posts, sourceFilter, selectedTag, query]);

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Source Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SOURCE_FILTERS.map((tab) => {
            const Icon = tab.icon;
            const active = sourceFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSourceFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  active
                    ? "bg-sakura-100/90 dark:bg-sakura-950/70 border-sakura-300 dark:border-sakura-800 text-sakura-800 dark:text-sakura-200"
                    : "bg-white/50 dark:bg-zinc-900/40 border-stone-200/80 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-stone-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes or tags..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200/90 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 text-stone-800 dark:text-zinc-200 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-sakura-400"
          />
        </div>
      </div>

      {/* Tag Pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded-md transition-colors ${
              selectedTag === null
                ? "bg-stone-800 text-stone-100 dark:bg-zinc-200 dark:text-zinc-900"
                : "bg-stone-200/60 dark:bg-zinc-800/70 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200"
            }`}
          >
            all tags
          </button>
          {allTags.map(([tag, count]) => {
            const active = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(active ? null : tag)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-md transition-colors ${
                  active
                    ? "bg-sakura-600 text-white dark:bg-sakura-500 dark:text-zinc-950"
                    : "bg-stone-200/60 dark:bg-zinc-800/70 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200"
                }`}
              >
                #{tag} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 dark:border-zinc-800 p-10 text-center text-sm text-stone-500 dark:text-zinc-400">
          No notes matched your current filter. Try clearing the search or tag selection.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((post) => (
            <PostCard key={`${post.source}-${post.slug}`} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
