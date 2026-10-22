import React from "react";
import {
  Braces,
  Code2,
  Cpu,
  FileCode2,
  GitBranch,
  Layers,
  Network,
  Palette,
  Sparkles,
  Terminal,
} from "lucide-react";

interface TechItem {
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

const TECH_ITEMS: TechItem[] = [
  {
    name: "Emacs & Org-Roam",
    category: "Knowledge Graph",
    icon: Network,
    highlight: true,
  },
  {
    name: "TypeScript",
    category: "Language",
    icon: FileCode2,
    highlight: true,
  },
  {
    name: "Next.js",
    category: "Full-Stack Web",
    icon: Layers,
    highlight: true,
  },
  {
    name: "React",
    category: "UI Architecture",
    icon: Sparkles,
  },
  {
    name: "Tailwind CSS",
    category: "Design System",
    icon: Palette,
  },
  {
    name: "Python",
    category: "Scripting & AI",
    icon: Terminal,
  },
  {
    name: "C++",
    category: "Systems",
    icon: Cpu,
  },
  {
    name: "JavaScript / Node",
    category: "Runtime",
    icon: Braces,
  },
  {
    name: "Git & Linux",
    category: "Workflow",
    icon: GitBranch,
  },
];

export default function TechStack() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
      {TECH_ITEMS.map((item) => {
        const Icon = item.icon || Code2;
        return (
          <div
            key={item.name}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-colors ${
              item.highlight
                ? "border-sakura-200/90 dark:border-sakura-900/50 bg-sakura-50/40 dark:bg-sakura-950/20"
                : "border-stone-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/40"
            } hover:border-sakura-400/70 dark:hover:border-sakura-500/60`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                item.highlight
                  ? "bg-sakura-100 dark:bg-sakura-900/40 text-sakura-600 dark:text-sakura-300"
                  : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-900 dark:text-zinc-100 truncate">
                {item.name}
              </p>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">
                {item.category}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
