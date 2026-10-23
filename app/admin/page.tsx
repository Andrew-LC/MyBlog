"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  KeyRound,
  Lock,
  LogOut,
  Network,
  PenSquare,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import NoteGraph from "@/components/NoteGraph";
import type { BlogPost, NoteGraphData } from "@/lib/content/types";
import type { VaultNoteItem } from "@/lib/content/vault";

export default function AdminStudioPage() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"vault" | "graph" | "editor">(
    "vault"
  );
  const [vaultDirs, setVaultDirs] = useState<{ name: string; dir: string }[]>(
    []
  );
  const [vaultNotes, setVaultNotes] = useState<VaultNoteItem[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<BlogPost[]>([]);
  const [fullGraph, setFullGraph] = useState<NoteGraphData>({
    nodes: [],
    edges: [],
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Editor state
  const [noteFormat, setNoteFormat] = useState<"org" | "markdown">("org");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSlug, setNoteSlug] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [noteTags, setNoteTags] = useState("emacs, org-roam");
  const [noteFeatured, setNoteFeatured] = useState(false);
  const [noteBody, setNoteBody] = useState(
    "* Introduction\n\nWrite your Org-mode or Markdown note here..."
  );

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      if (data.authenticated) {
        setAuthenticated(true);
        setVaultDirs(data.vaultDirs || []);
        setVaultNotes(data.vaultNotes || []);
        setPublishedPosts(data.publishedPosts || []);
        setFullGraph(data.fullGraph || { nodes: [], edges: [] });
      } else {
        setAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", passcode }),
    });
    if (!res.ok) {
      const err = await res.json();
      setAuthError(err.error || "Invalid passcode");
      return;
    }
    setPasscode("");
    window.dispatchEvent(new Event("admin-auth-changed"));
    await fetchAdminData();
  };

  const handleLogout = async () => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setAuthenticated(false);
    window.dispatchEvent(new Event("admin-auth-changed"));
  };

  const handlePublishVaultNote = async (
    vaultPath: string,
    featured = false
  ) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish_vault", vaultPath, featured }),
    });
    if (res.ok) {
      const data = await res.json();
      showToast(`Published note → /post/${data.slug}`);
      await fetchAdminData();
    }
  };

  const handleUnpublish = async (slug: string, source: string) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unpublish", slug, source }),
    });
    if (res.ok) {
      showToast(`Unpublished ${slug} from blog`);
      await fetchAdminData();
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_note",
        format: noteFormat,
        title: noteTitle,
        slug: noteSlug,
        description: noteDesc,
        tags: noteTags,
        featured: noteFeatured,
        content: noteBody,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      showToast(`Saved note → /post/${data.slug}`);
      await fetchAdminData();
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm font-mono text-stone-500 dark:text-zinc-400">
        Loading Owner Studio...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 rounded-2xl border border-stone-200/90 dark:border-[#282834] bg-white/80 dark:bg-[#181820]/90 shadow-sm shadow-stone-200/20 dark:shadow-none space-y-6">
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sakura-100 dark:bg-sakura-950/70 border border-sakura-300/70 dark:border-sakura-800 flex items-center justify-center text-sakura-600 dark:text-sakura-300">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-cassannet text-2xl font-bold text-stone-900 dark:text-zinc-100">
            Owner CMS &amp; Org-Roam Studio
          </h1>
          <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
            Private dashboard for transitioning Emacs Org-roam notes to blogs,
            inspecting your full vault graph, and managing CMS sources.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-stone-600 dark:text-zinc-300">
              Owner Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter ADMIN_PASSCODE (default: sakura-admin)"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 dark:border-[#282834] bg-white dark:bg-[#121216] text-stone-900 dark:text-zinc-100 focus:outline-none focus:border-sakura-400"
                autoFocus
              />
            </div>
            {authError && (
              <p className="text-xs text-rose-500 font-mono">{authError}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider bg-stone-900 text-white dark:bg-sakura-600 dark:text-white hover:bg-sakura-600 dark:hover:bg-sakura-500 transition-colors shadow-sm"
          >
            Unlock Owner Studio
          </button>
        </form>

        <p className="text-[11px] font-mono text-stone-400 dark:text-zinc-500 border-t border-stone-200/80 dark:border-[#282834] pt-4">
          Tip: Configure <code className="text-sakura-500">ADMIN_PASSCODE</code> in{" "}
          <code>.env.local</code> (defaults to <code>sakura-admin</code> locally).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-[#282834] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-sakura-600 dark:text-sakura-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Owner-Only CMS · Private Session Active</span>
          </div>
          <h1 className="font-cassannet text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-zinc-100">
            Org-Roam Vault &amp; CMS Studio
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {statusMessage && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {statusMessage}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-stone-200/90 dark:border-[#282834] bg-white/70 dark:bg-[#181820] text-stone-600 dark:text-zinc-400 hover:text-rose-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("vault")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
            activeTab === "vault"
              ? "bg-sakura-100/90 dark:bg-sakura-950/80 border-sakura-300 dark:border-sakura-800 text-sakura-800 dark:text-sakura-200 font-semibold shadow-sm"
              : "bg-white/80 dark:bg-[#181820]/90 border-stone-200/85 dark:border-[#282834] text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white"
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Org-Roam Vault Transition ({vaultNotes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("graph")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
            activeTab === "graph"
              ? "bg-sakura-100/90 dark:bg-sakura-950/80 border-sakura-300 dark:border-sakura-800 text-sakura-800 dark:text-sakura-200 font-semibold shadow-sm"
              : "bg-white/80 dark:bg-[#181820]/90 border-stone-200/85 dark:border-[#282834] text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white"
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Full Vault + Blog Graph ({fullGraph.nodes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("editor")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
            activeTab === "editor"
              ? "bg-sakura-100/90 dark:bg-sakura-950/80 border-sakura-300 dark:border-sakura-800 text-sakura-800 dark:text-sakura-200 font-semibold shadow-sm"
              : "bg-white/80 dark:bg-[#181820]/90 border-stone-200/85 dark:border-[#282834] text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white"
          }`}
        >
          <PenSquare className="w-4 h-4" />
          <span>Write / Edit Note</span>
        </button>
      </div>

      {/* TAB 1: ORG-ROAM VAULT BRIDGE */}
      {activeTab === "vault" && (
        <div className="space-y-6">
          {/* Connected Vault Directories */}
          <div className="p-4 rounded-xl border border-stone-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-stone-500 dark:text-zinc-400">
                Detected Emacs Vaults:
              </span>
              {vaultDirs.map((v) => (
                <span
                  key={v.dir}
                  className="font-mono px-2 py-0.5 rounded bg-stone-200/70 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300"
                  title={v.dir}
                >
                  {v.name} ({v.dir})
                </span>
              ))}
            </div>
            <span className="font-mono text-[11px] text-stone-400">
              One-click publish copies note + images into content/org/
            </span>
          </div>

          {/* Vault Notes Table/Cards */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-stone-800 dark:text-zinc-200">
              Local Emacs Org-Roam Notes ({vaultNotes.length})
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {vaultNotes.map((vn) => (
                <div
                  key={vn.vaultPath}
                  className="p-4 rounded-xl border border-stone-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-stone-200/70 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300">
                        {vn.vaultName}
                      </span>
                      <span className="text-stone-400 dark:text-zinc-500">
                        {vn.date}
                      </span>
                      <span className="text-stone-400 dark:text-zinc-500">
                        · {vn.wordCount} words
                      </span>
                      {vn.isPublished && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                          LIVE ON BLOG
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-stone-900 dark:text-zinc-100 truncate">
                      {vn.title}
                    </h3>

                    {vn.description && (
                      <p className="text-xs text-stone-500 dark:text-zinc-400 line-clamp-1">
                        {vn.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {vn.isPublished ? (
                      <>
                        <Link
                          href={`/post/${vn.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 hover:border-sakura-400"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handlePublishVaultNote(vn.vaultPath, true)}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono border border-sakura-300/70 dark:border-sakura-800 text-sakura-600 dark:text-sakura-300 hover:bg-sakura-50 dark:hover:bg-sakura-950/50"
                          title="Re-sync latest changes from Emacs vault"
                        >
                          Re-Sync
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUnpublish(vn.slug, "org")}
                          className="p-1.5 rounded-lg border border-stone-200 dark:border-zinc-800 text-stone-400 hover:text-rose-500"
                          title="Unpublish from blog (keeps vault file untouched)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handlePublishVaultNote(vn.vaultPath, false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-stone-900 text-white dark:bg-sakura-500 dark:text-zinc-950 hover:bg-sakura-600 dark:hover:bg-sakura-400 transition-colors"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Publish to Blog</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePublishVaultNote(vn.vaultPath, true)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-mono border border-sakura-300 dark:border-sakura-800 text-sakura-600 dark:text-sakura-300 hover:bg-sakura-50 dark:hover:bg-sakura-950/50"
                          title="Publish and pin to Home page Featured Notes"
                        >
                          + Featured
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Currently Published Blog Posts */}
          <div className="space-y-3 pt-4 border-t border-stone-200/80 dark:border-zinc-800/80">
            <h2 className="text-sm font-semibold text-stone-800 dark:text-zinc-200">
              Currently Published on Blog ({publishedPosts.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {publishedPosts.map((post) => (
                <div
                  key={post.slug}
                  className="p-3.5 rounded-xl border border-stone-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/35 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-sakura-600 dark:text-sakura-400">
                      {post.source} {post.featured ? "· ★ featured" : ""}
                    </span>
                    <p className="text-sm font-medium text-stone-900 dark:text-zinc-100 truncate">
                      {post.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setNoteFormat(post.source === "markdown" ? "markdown" : "org");
                        setNoteTitle(post.title);
                        setNoteSlug(post.slug);
                        setNoteDesc(post.description);
                        setNoteTags(post.tags.join(", "));
                        setNoteFeatured(post.featured);
                        setNoteBody(post.rawContent || "");
                        setActiveTab("editor");
                      }}
                      className="px-2.5 py-1 rounded text-xs font-mono border border-stone-200 dark:border-zinc-800 hover:border-sakura-400"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnpublish(post.slug, post.source)}
                      className="p-1.5 rounded text-stone-400 hover:text-rose-500"
                      title="Remove from blog"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL VAULT + BLOG GRAPH */}
      {activeTab === "graph" && (
        <div className="space-y-4">
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Visualizing all published blog posts alongside your private Emacs
            Org-roam vault nodes (indigo). Click any private vault node to
            publish it directly to the blog.
          </p>
          <NoteGraph
            data={fullGraph}
            height={460}
            onPublishVaultNode={(vaultPath) =>
              handlePublishVaultNote(vaultPath, false)
            }
          />
        </div>
      )}

      {/* TAB 3: DIRECT NOTE EDITOR */}
      {activeTab === "editor" && (
        <form
          onSubmit={handleSaveNote}
          className="p-5 sm:p-6 rounded-2xl border border-stone-200/80 dark:border-zinc-800/90 bg-white/60 dark:bg-zinc-900/40 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-mono text-stone-600 dark:text-zinc-400">
                Note Title
              </label>
              <input
                type="text"
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. Understanding Multi-Head Attention"
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-stone-600 dark:text-zinc-400">
                Format
              </label>
              <select
                value={noteFormat}
                onChange={(e) =>
                  setNoteFormat(e.target.value as "org" | "markdown")
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              >
                <option value="org">Emacs Org-Mode (.org)</option>
                <option value="markdown">Markdown (.md)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-stone-600 dark:text-zinc-400">
                Short Summary / Description
              </label>
              <input
                type="text"
                value={noteDesc}
                onChange={(e) => setNoteDesc(e.target.value)}
                placeholder="Optional summary for post cards..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-stone-600 dark:text-zinc-400">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={noteTags}
                onChange={(e) => setNoteTags(e.target.value)}
                placeholder="emacs, ml, systems"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-stone-600 dark:text-zinc-400">
              Note Content ({noteFormat === "org" ? "Org-Mode syntax" : "Markdown syntax"})
            </label>
            <textarea
              rows={12}
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              className="w-full p-3 text-xs font-mono rounded-xl border border-stone-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="inline-flex items-center gap-2 text-xs font-mono text-stone-600 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={noteFeatured}
                onChange={(e) => setNoteFeatured(e.target.checked)}
                className="rounded border-stone-300 text-sakura-600"
              />
              <span>Pin to Featured Notes on Home Page</span>
            </label>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-mono font-semibold bg-stone-900 text-white hover:bg-sakura-600 dark:bg-sakura-600 dark:text-white dark:hover:bg-sakura-500 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Save &amp; Publish Note</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
