import Link from "next/link";
import { Flower2, Github, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-stone-200/80 dark:border-[#282834] mt-20">
      <div className="max-w-4xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <Flower2 className="w-3.5 h-3.5 text-sakura-500 dark:text-sakura-400" />
          <span>
            © {new Date().getFullYear()} Andrew Lamichhane. Designed &amp; coded
            with minimal motion.
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Andrew-LC/MyBlog"
            target="_blank"
            rel="noreferrer"
            className="hover:text-sakura-600 dark:hover:text-sakura-300 inline-flex items-center gap-1 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>

          {/* Discreet owner lock icon (or press Ctrl+Shift+A) */}
          <Link
            href="/admin"
            title="Owner Studio (Ctrl+Shift+A)"
            aria-label="Owner Studio"
            className="opacity-35 hover:opacity-100 hover:text-sakura-500 transition-opacity"
          >
            <Lock className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
