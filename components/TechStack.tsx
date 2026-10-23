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
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all ${
              item.highlight
                ? "border-sakura-300/80 dark:border-sakura-800/80 bg-sakura-50/70 dark:bg-sakura-950/40 shadow-sm shadow-sakura-500/5"
                : "border-stone-200/85 dark:border-[#282834] bg-white/80 dark:bg-[#181820]/90 shadow-sm shadow-stone-200/20 dark:shadow-none"
            } hover:border-sakura-400 dark:hover:border-sakura-400`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                item.highlight
                  ? "bg-sakura-100 dark:bg-sakura-900/50 text-sakura-700 dark:text-sakura-300"
                  : "bg-stone-100 dark:bg-[#22222e] text-stone-600 dark:text-stone-300"
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
