import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Network,
  Sparkles,
} from "lucide-react";
import SakuraPixelTree from "@/components/SakuraPixelTree";
import TechStack from "@/components/TechStack";
import PostCard from "@/components/PostCard";
import NoteGraph from "@/components/NoteGraph";
import { getAllPostsMeta, getFeaturedPosts, getNoteGraphData } from "@/lib/content";

export default async function HomePage() {
  const [featuredPosts, allPosts, graphData] = await Promise.all([
    getFeaturedPosts(),
    getAllPostsMeta(),
    getNoteGraphData(false),
  ]);

  return (
    <div className="space-y-20">
      {/* Hero Section: Clean Typography + Frameless Digital Sakura Pixel Tree */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center pt-2">
        <div className="md:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono border border-sakura-300/60 dark:border-sakura-800/60 bg-sakura-50/60 dark:bg-sakura-950/30 text-sakura-700 dark:text-sakura-300">
            <Sparkles className="w-3 h-3" />
            <span>Full Stack Developer · Digital Garden</span>
          </div>

          <h1 className="font-cassannet text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight text-stone-900 dark:text-zinc-100 leading-[1.15]">
            Designing &amp; coding thoughtful software,{" "}
            <span className="text-sakura-600 dark:text-sakura-400">
              one note at a time.
            </span>
          </h1>

          <p className="text-[15px] sm:text-base text-stone-600 dark:text-zinc-400 leading-relaxed">
            I&apos;m{" "}
            <strong className="text-stone-900 dark:text-zinc-200 font-semibold">
              Andrew Lamichhane
            </strong>
            , a Full Stack Developer based in India. I enjoy tinkering with
            distributed systems, compilers, and machine learning papers, while
            reading manga &amp; books and cultivating interconnected notes in{" "}
            <span className="text-stone-800 dark:text-zinc-200 font-medium">
              Emacs Org-roam
            </span>
            .
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-stone-900 text-stone-50 dark:bg-sakura-500 dark:text-zinc-950 hover:bg-sakura-600 dark:hover:bg-sakura-400 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>All Notes &amp; Graph ({allPosts.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#knowledge-graph"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-stone-300/80 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-stone-700 dark:text-zinc-300 hover:border-sakura-400 dark:hover:border-sakura-500 transition-colors"
            >
              <Network className="w-4 h-4 text-sakura-500" />
              <span>Explore Graph</span>
            </a>
          </div>
        </div>

        {/* Frameless Digital Sakura Pixel Tree */}
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <SakuraPixelTree />
        </div>
      </section>

      {/* Featured Notes Section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-stone-200/70 dark:border-zinc-800/80 pb-3">
          <div>
            <h2 className="font-cassannet text-xl font-bold text-stone-900 dark:text-zinc-100">
              Featured Notes &amp; Writings
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              Selected essays and evergreen notes from my knowledge base
            </p>
          </div>

          <Link
            href="/blogs"
            className="inline-flex items-center gap-1 text-xs font-mono font-medium text-sakura-600 dark:text-sakura-400 hover:underline"
          >
            <span>View all ({allPosts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {featuredPosts.map((post) => (
            <PostCard key={`${post.source}-${post.slug}`} post={post} />
          ))}
        </div>
      </section>

      {/* Interconnected Knowledge Graph Section */}
      <section id="knowledge-graph" className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-cassannet text-xl font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
              <Network className="w-5 h-5 text-sakura-500" />
              <span>Knowledge Graph</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              How my published notes link and cluster across topics
            </p>
          </div>

          <Link
            href="/blogs"
            className="text-xs font-mono text-stone-500 dark:text-zinc-400 hover:text-sakura-500 transition-colors"
          >
            Full directory →
          </Link>
        </div>

        <NoteGraph data={graphData} height={340} />
      </section>

      {/* Technologies & Environment Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200/70 dark:border-zinc-800/80 pb-3">
          <h2 className="font-cassannet text-xl font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sakura-500" />
            <span>Technologies &amp; Environment</span>
          </h2>
          <span className="text-xs font-mono text-stone-400 dark:text-zinc-500">
            core stack
          </span>
        </div>
        <TechStack />
      </section>
    </div>
  );
}
