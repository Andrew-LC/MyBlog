import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { getAllPostsMeta, getNoteGraphData } from "@/lib/content";
import BlogFilterList from "@/components/BlogFilterList";
import NoteGraph from "@/components/NoteGraph";

export const metadata: Metadata = {
  title: "Notes & Knowledge Graph",
  description:
    "Explore all interconnected Emacs Org-roam notes, articles, and the interactive knowledge graph.",
};

export default async function BlogsPage() {
  const [posts, graphData] = await Promise.all([
    getAllPostsMeta(),
    getNoteGraphData(false),
  ]);

  return (
    <div className="space-y-10">
      <header className="space-y-2.5 border-b border-stone-200/70 dark:border-zinc-800/80 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-sakura-600 dark:text-sakura-400">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Digital Garden · {posts.length} Published Notes</span>
        </div>

        <h1 className="font-cassannet text-3xl font-extrabold text-stone-900 dark:text-zinc-100">
          Notes &amp; Knowledge Graph
        </h1>

        <p className="text-sm text-stone-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Explore the interconnected graph of notes below or filter articles by
          source and topic tag.
        </p>
      </header>

      {/* Interactive Interconnected Graph of Notes */}
      <section className="space-y-3">
        <NoteGraph data={graphData} height={380} />
      </section>

      {/* All Notes Filterable Index */}
      <section className="space-y-4 pt-2">
        <h2 className="font-cassannet text-xl font-bold text-stone-900 dark:text-zinc-100">
          All Notes ({posts.length})
        </h2>
        <BlogFilterList posts={posts} />
      </section>
    </div>
  );
}
