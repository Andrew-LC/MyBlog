#!/usr/bin/env tsx
/**
 * Org-Roam to MyBlog Sync Utility
 *
 * Scans your configured Emacs Org-roam directories (~/Documents/zen_o_jidai_o_koeta,
 * ~/Documents/MyDB, ~/org-roam, or ORG_ROAM_DIR) and syncs any note tagged with
 * :blog: in #+FILETAGS: (or #+BLOG: t) into content/org/.
 *
 * You can also publish any note with one click from the private Owner CMS at /admin.
 */

import fs from "fs";
import {
  getConfiguredVaultDirs,
  publishVaultNoteToBlog,
  scanOrgVaults,
} from "../lib/content/vault";

function main() {
  const dirs = getConfiguredVaultDirs();
  console.log(`\n🌸 MyBlog Org-Roam Vault Scanner`);
  for (const d of dirs) {
    console.log(`   Vault [${d.name}] : ${d.dir}`);
  }

  const allNotes = scanOrgVaults();
  let synced = 0;

  for (const note of allNotes) {
    const raw = fs.readFileSync(note.vaultPath, "utf8");
    const hasBlogTag =
      /^\s*#\+(?:FILETAGS|TAGS):.*\bblog\b/im.test(raw) ||
      /^\s*#\+(?:BLOG|PUBLISH):\s*(t|true|yes)/im.test(raw);

    if (hasBlogTag) {
      publishVaultNoteToBlog(note.vaultPath, { featured: note.isFeatured });
      synced++;
      console.log(`   ✓ Synced : ${note.title} (${note.slug}.org)`);
    }
  }

  console.log(
    `\n✨ Scanned ${allNotes.length} Org-roam notes across ${dirs.length} vaults (${synced} auto-tagged :blog:).\n` +
      `   Tip: Open /admin (Ctrl+Shift+A) in the browser to one-click publish any of your ${allNotes.length} vault notes!\n`
  );
}

main();
