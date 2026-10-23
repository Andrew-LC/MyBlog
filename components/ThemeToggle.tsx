"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="w-9 h-9 rounded-lg border border-stone-200/80 dark:border-[#282834]"
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-stone-200/90 dark:border-[#282834] bg-white/80 dark:bg-[#181820]/90 text-stone-700 dark:text-zinc-300 hover:border-sakura-400 dark:hover:border-sakura-400 hover:text-sakura-600 dark:hover:text-sakura-300 transition-colors shadow-sm shadow-stone-200/20 dark:shadow-none"
    >
      {isDark ? <Sun className="w-4 h-4 text-sakura-300" /> : <Moon className="w-4 h-4 text-stone-700" />}
    </button>
  );
}
