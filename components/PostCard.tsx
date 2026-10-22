import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, FileText, Network, Database } from "lucide-react";
import type { BlogPostMeta, ContentSource } from "@/lib/content/types";

const SOURCE_CONFIG: Record<
  ContentSource,
  {
    label: string;
    badgeClass: string;
    icon: typeof Network;
  }
> = {
  org: {
    label: "ORG-ROAM",
    badgeClass:
      "bg-sakura-100/80 dark:bg-sakura-950/60 text-sakura-700 dark:text-sakura-300 border-sakura-300/60 dark:border-sakura-800/60",
    icon: Network,
  },
  markdown: {
    label: "MARKDOWN",
    badgeClass:
      "bg-stone-200/70 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-stone-300/70 dark:border-zinc-700",
    icon: FileText,
  },
  notion: {
    label: "NOTION",
    badgeClass:
      "bg-amber-100/70 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300/60 dark:border-amber-800/60",
    icon: Database,
  },
};

export default function PostCard({ post }: { post: BlogPostMeta }) {
  const sourceInfo = SOURCE_CONFIG[post.source];
  const SourceIcon = sourceInfo.icon;

  return (
    <article className="group relative rounded-xl border border-stone-200/80 dark:border-zinc-800/90 bg-white/60 dark:bg-zinc-900/40 p-5 hover:border-sakura-400/80 dark:hover:border-sakura-500/60 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${sourceInfo.badgeClass}`}
          >
            <SourceIcon className="w-3 h-3" />
            {sourceInfo.label}
          </span>

          <span className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-zinc-400 font-mono">
            <Calendar className="w-3 h-3" />
            {post.date}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-zinc-500 font-mono">
          <Clock className="w-3 h-3" />
          {post.readingTime}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-stone-900 dark:text-zinc-100 group-hover:text-sakura-600 dark:group-hover:text-sakura-300 transition-colors">
        <Link href={`/post/${post.slug}`} className="focus:outline-none">
          <span className="absolute inset-0" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5">
            <span>{post.title}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-sakura-500 shrink-0" />
          </span>
        </Link>
      </h3>

      {post.description && (
        <p className="mt-1.5 text-sm text-stone-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {post.description}
        </p>
      )}

      {post.tags.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
