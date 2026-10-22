"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Flower2,
  Github,
  Home,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/blogs", label: "Notes & Graph", icon: BookOpen },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwner = () => {
      fetch("/api/admin")
        .then((r) => r.json())
        .then((d) => setIsOwner(Boolean(d?.authenticated)))
        .catch(() => setIsOwner(false));
    };
    checkOwner();
    window.addEventListener("admin-auth-changed", checkOwner);
    return () => window.removeEventListener("admin-auth-changed", checkOwner);
  }, [pathname]);

  // Owner shortcut: Ctrl+Shift+A or Cmd+Shift+A jumps to /admin
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        router.push("/admin");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/60 dark:border-zinc-800/70 bg-[#faf8f5]/85 dark:bg-[#121216]/85 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 font-semibold tracking-tight text-stone-900 dark:text-zinc-100"
        >
          <span className="w-7 h-7 rounded-md bg-sakura-100/90 dark:bg-sakura-900/40 border border-sakura-300/60 dark:border-sakura-700/50 flex items-center justify-center text-sakura-600 dark:text-sakura-300">
            <Flower2 className="w-4 h-4" />
          </span>
          <span className="font-cassannet text-lg tracking-wide">
            Andrew Lamichhane
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-5">
          <nav className="flex items-center gap-1 text-sm">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    active
                      ? "bg-sakura-100/80 dark:bg-sakura-950/60 text-sakura-700 dark:text-sakura-300"
                      : "text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <a
              href="https://github.com/Andrew-LC/MyBlog"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg font-medium text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 inline-flex items-center gap-1.5 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>

            {/* Strictly Owner-Only CMS Link */}
            {isOwner && (
              <Link
                href="/admin"
                className={`ml-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors ${
                  pathname?.startsWith("/admin")
                    ? "bg-sakura-500 text-zinc-950 border-sakura-400 font-semibold"
                    : "border-sakura-300/80 dark:border-sakura-800/80 bg-sakura-50/70 dark:bg-sakura-950/40 text-sakura-700 dark:text-sakura-300"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Owner CMS</span>
              </Link>
            )}
          </nav>

          <div className="h-4 w-px bg-stone-200 dark:bg-zinc-800" />
          <ThemeToggle />
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-stone-200/80 dark:border-zinc-800 text-stone-700 dark:text-zinc-300"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-stone-200/70 dark:border-zinc-800 bg-[#faf8f5] dark:bg-[#121216] px-5 py-4 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                  active
                    ? "bg-sakura-100/80 dark:bg-sakura-950/60 text-sakura-700 dark:text-sakura-300"
                    : "text-stone-700 dark:text-zinc-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          {isOwner && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-mono text-sakura-600 dark:text-sakura-300"
            >
              <ShieldCheck className="w-4 h-4" />
              Owner CMS
            </Link>
          )}
          <a
            href="https://github.com/Andrew-LC/MyBlog"
            target="_blank"
            rel="noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-stone-700 dark:text-zinc-300"
          >
            <Github className="w-4 h-4" />
            Source Code
          </a>
        </nav>
      )}
    </header>
  );
}
