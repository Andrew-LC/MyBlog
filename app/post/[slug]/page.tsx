import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Database,
  FileText,
  Link2,
  Network,
} from "lucide-react";
import { getAllPostsMeta, getPostBySlug } from "@/lib/content";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPostsMeta();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Note Not Found" };
  }
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function SinglePostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const SourceIcon =
    post.source === "org"
      ? Network
      : post.source === "markdown"
      ? FileText
      : Database;

  const sourceLabel =
    post.source === "org"
      ? "Emacs Org-Roam Note"
      : post.source === "markdown"
      ? "Markdown Article"
      : "Notion CMS Page";

  return (
    <article className="max-w-[70ch] mx-auto space-y-8">
      {/* Back navigation */}
      <div>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-stone-500 dark:text-zinc-400 hover:text-sakura-600 dark:hover:text-sakura-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all notes</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-4 border-b border-stone-200/80 dark:border-[#282834] pb-6">
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-sakura-300/80 dark:border-sakura-800/80 bg-sakura-50/70 dark:bg-sakura-950/40 text-sakura-700 dark:text-sakura-300">
            <SourceIcon className="w-3.5 h-3.5" />
            <span>{sourceLabel}</span>
          </span>

          <span className="inline-flex items-center gap-1 text-stone-500 dark:text-zinc-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.date}</span>
          </span>

          <span className="inline-flex items-center gap-1 text-stone-500 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readingTime}</span>
          </span>
        </div>

        <h1 className="font-cassannet text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-zinc-100 leading-tight">
          {post.title}
        </h1>

        {post.description && (
          <p className="text-base text-stone-600 dark:text-zinc-400 leading-relaxed">
            {post.description}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
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

          {post.roamId && (
            <span className="text-[11px] font-mono text-stone-400 dark:text-zinc-500">
              :ID: {post.roamId.slice(0, 8)}…
            </span>
          )}
        </div>
      </header>

      {/* Rendered Content Body */}
      <div
        className="prose prose-stone dark:prose-invert max-w-none
          prose-headings:font-cassannet prose-headings:tracking-tight
          prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
          prose-p:leading-relaxed prose-p:text-stone-700 dark:prose-p:text-stone-300
          prose-a:text-sakura-600 dark:prose-a:text-sakura-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
          prose-code:font-mono prose-code:text-[0.875em] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:bg-stone-200/60 dark:prose-code:bg-[#20202a] prose-code:text-stone-800 dark:prose-code:text-stone-200 prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-transparent prose-pre:p-0
          prose-blockquote:border-l-sakura-500 prose-blockquote:bg-sakura-50/50 dark:prose-blockquote:bg-sakura-950/25 prose-blockquote:text-stone-700 dark:prose-blockquote:text-stone-300 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
          prose-table:text-sm prose-th:text-left"
        dangerouslySetInnerHTML={{ __html: post.htmlContent }}
      />

      {/* Org-Roam Bidirectional Backlinks Section */}
      {post.backlinks && post.backlinks.length > 0 && (
        <section className="pt-8 border-t border-stone-200/80 dark:border-[#282834] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sakura-600 dark:text-sakura-400 font-semibold">
            <Link2 className="w-3.5 h-3.5" />
            <span>Linked to this note ({post.backlinks.length} Backlink{post.backlinks.length > 1 ? "s" : ""})</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {post.backlinks.map((bl) => (
              <Link
                key={bl.slug}
                href={`/post/${bl.slug}`}
                className="block p-4 rounded-xl border border-stone-200/85 dark:border-[#282834] bg-white/80 dark:bg-[#181820]/90 hover:border-sakura-400/80 dark:hover:border-sakura-400/70 shadow-sm shadow-stone-200/20 dark:shadow-none transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                    {bl.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#22222e] text-stone-600 dark:text-zinc-300 border border-stone-200/70 dark:border-[#30303e]">
                    {bl.source}
                  </span>
                </div>
                {bl.description && (
                  <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400 line-clamp-1">
                    {bl.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
