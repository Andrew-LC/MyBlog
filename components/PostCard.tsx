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
      "bg-sakura-100/90 dark:bg-sakura-950/70 text-sakura-800 dark:text-sakura-200 border-sakura-200 dark:border-sakura-800/80",
    icon: Network,
  },
  markdown: {
    label: "MARKDOWN",
    badgeClass:
      "bg-stone-100 dark:bg-[#22222e] text-stone-700 dark:text-zinc-300 border-stone-200 dark:border-[#30303e]",
    icon: FileText,
  },
  notion: {
    label: "NOTION",
    badgeClass:
      "bg-amber-100/90 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/80",
    icon: Database,
  },
};

export default function PostCard({ post }: { post: BlogPostMeta }) {
  const sourceInfo = SOURCE_CONFIG[post.source];
  const SourceIcon = sourceInfo.icon;

  return (
    <article className="group relative rounded-xl border border-stone-200/85 dark:border-[#282834] bg-white/80 dark:bg-[#181820]/90 p-5 hover:border-sakura-400/80 dark:hover:border-sakura-400/70 shadow-sm shadow-stone-200/20 dark:shadow-none transition-all">
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
              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-100/90 dark:bg-[#20202c] text-stone-600 dark:text-zinc-300 border border-stone-200/60 dark:border-[#2a2a38]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
