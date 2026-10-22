"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { RefreshCw, Wind } from "lucide-react";

const LOGICAL_WIDTH = 152;
const LOGICAL_HEIGHT = 136;

// Mulberry32 deterministic PRNG
function createRng(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: 1 | 2;
}

interface CanopyCluster {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export default function SakuraPixelTree() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [seed, setSeed] = useState<number>(2026);
  const [breezeEnabled, setBreezeEnabled] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setBreezeEnabled(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = resolvedTheme === "dark";
    const rng = createRng(seed);

    // Offscreen static canvas with 100% transparent background (no box fill)
    const staticCanvas = document.createElement("canvas");
    staticCanvas.width = LOGICAL_WIDTH;
    staticCanvas.height = LOGICAL_HEIGHT;
    const sctx = staticCanvas.getContext("2d");
    if (!sctx) return;
    sctx.imageSmoothingEnabled = false;
    sctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    const setPx = (x: number, y: number, color: string) => {
      const ix = Math.round(x);
      const iy = Math.round(y);
      if (ix < 0 || ix >= LOGICAL_WIDTH || iy < 0 || iy >= LOGICAL_HEIGHT)
        return;
      sctx.fillStyle = color;
      sctx.fillRect(ix, iy, 1, 1);
    };

    const palette = isDark
      ? {
          celestial: "#fde68a",
          celestialGlow: "rgba(253, 230, 138, 0.22)",
          grassTop: "#4a3556",
          earthMid: "#2c2238",
          earthDeep: "#1d1726",
          barkDark: "#1c1321",
          barkMid: "#36243d",
          barkLight: "#563b5e",
          blossomDeep: "#831843",
          blossomShadow: "#be185d",
          blossomMid: "#ec4899",
          blossomBright: "#f472b6",
          blossomHighlight: "#fbcfe8",
          blossomGlow: "#fff1f2",
          lanternBody: "#52525b",
          lanternLight: "#fbbf24",
        }
      : {
          celestial: "#fda4af",
          celestialGlow: "rgba(253, 164, 175, 0.28)",
          grassTop: "#749c7c",
          earthMid: "#4d6d63",
          earthDeep: "#344b47",
          barkDark: "#2e1f26",
          barkMid: "#4c333d",
          barkLight: "#6e4b58",
          blossomDeep: "#9d174d",
          blossomShadow: "#db2777",
          blossomMid: "#f472b6",
          blossomBright: "#f9a8d4",
          blossomHighlight: "#fce7f3",
          blossomGlow: "#ffffff",
          lanternBody: "#78716c",
          lanternLight: "#f59e0b",
        };

    // 1. Subtle Pixel Crescent Moon / Sun Disc floating behind the branches
    const moonX = 34;
    const moonY = 28;
    const moonR = 9;
    for (let dy = -moonR - 2; dy <= moonR + 2; dy++) {
      for (let dx = -moonR - 2; dx <= moonR + 2; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= moonR) {
          if (isDark) {
            const cutDist = Math.sqrt(
              (dx - 3.5) * (dx - 3.5) + (dy + 1.5) * (dy + 1.5)
            );
            if (cutDist > moonR - 1.8) {
              setPx(moonX + dx, moonY + dy, palette.celestial);
            }
          } else {
            setPx(moonX + dx, moonY + dy, palette.celestial);
          }
        } else if (dist <= moonR + 1.4 && (dx + dy) % 2 === 0) {
          setPx(moonX + dx, moonY + dy, palette.celestialGlow);
        }
      }
    }

    // 2. Recursive Pixel Branch Generator & Canopy Collector
    const clusters: CanopyCluster[] = [];

    const drawBranch = (
      x0: number,
      y0: number,
      angle: number,
      length: number,
      thickness: number,
      depth: number
    ) => {
      const steps = Math.max(1, Math.ceil(length * 1.5));
      const x1 = x0 + Math.cos(angle) * length;
      const y1 = y0 + Math.sin(angle) * length;
      const curve = (rng() - 0.5) * 3.0;

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const bend = Math.sin(t * Math.PI) * curve;
        const cx = x0 + (x1 - x0) * t + bend;
        const cy = y0 + (y1 - y0) * t;
        const currentR = Math.max(0.6, thickness * (1 - t * 0.28));

        const rInt = Math.ceil(currentR);
        for (let dy = -rInt; dy <= rInt; dy++) {
          for (let dx = -rInt; dx <= rInt; dx++) {
            if (dx * dx + dy * dy <= currentR * currentR + 0.35) {
              let col = palette.barkMid;
              if (dx < -currentR * 0.25) col = palette.barkLight;
              else if (dx > currentR * 0.25 || dy > currentR * 0.35)
                col = palette.barkDark;
              else if ((Math.round(cx + dx) + Math.round(cy + dy)) % 4 === 0)
                col = palette.barkDark;
              setPx(cx + dx, cy + dy, col);
            }
          }
        }
      }

      if (depth <= 1) {
        clusters.push({
          cx: x1,
          cy: y1,
          rx: 10 + rng() * 5.5,
          ry: 6.5 + rng() * 3.5,
        });
        return;
      }

      if (depth <= 3) {
        clusters.push({
          cx: x1,
          cy: y1,
          rx: 8.5 + rng() * 4.5,
          ry: 5.5 + rng() * 3,
        });
      }

      const subCount = depth === 4 ? 3 : 2;
      for (let i = 0; i < subCount; i++) {
        const spread =
          subCount === 3
            ? (i - 1) * (0.42 + rng() * 0.14)
            : (i === 0 ? -1 : 1) * (0.35 + rng() * 0.17);
        const nextAngle = angle + spread + (rng() - 0.5) * 0.12;
        const nextLen = length * (0.72 + rng() * 0.12);
        const nextThick = Math.max(0.8, thickness * 0.68);
        drawBranch(x1, y1, nextAngle, nextLen, nextThick, depth - 1);
      }
    };

    const baseX = Math.floor(LOGICAL_WIDTH * 0.54);
    const baseY = 114;

    // Exposed gnarled roots
    for (let r = -1; r <= 1; r++) {
      const rootLen = 9 + rng() * 4;
      for (let s = 0; s < rootLen; s++) {
        const rx = baseX + r * (s * 0.85 + 2);
        const ry = baseY + s * 0.32;
        setPx(rx, ry, palette.barkDark);
        setPx(rx, ry - 1, palette.barkMid);
      }
    }

    drawBranch(baseX, baseY, -Math.PI / 2 - 0.05, 25, 4.3, 4);

    // 3. Layered Pixel Sakura Blossom Canopy
    for (const c of clusters) {
      const rx = Math.ceil(c.rx);
      const ry = Math.ceil(c.ry);
      for (let dy = -ry - 2; dy <= ry + 2; dy++) {
        for (let dx = -rx - 2; dx <= rx + 2; dx++) {
          const norm = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
          const edgeNoise = ((Math.abs(dx * 7 + dy * 13) % 5) - 2) * 0.08;
          if (norm + edgeNoise <= 1.0) {
            let col = palette.blossomMid;
            if (dy > ry * 0.35) col = palette.blossomDeep;
            else if (dy > 0) col = palette.blossomShadow;
            setPx(c.cx + dx, c.cy + dy, col);
          }
        }
      }
    }

    for (const c of clusters) {
      const rx = Math.ceil(c.rx * 0.88);
      const ry = Math.ceil(c.ry * 0.82);
      for (let dy = -ry; dy <= ry; dy++) {
        for (let dx = -rx; dx <= rx; dx++) {
          const norm = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
          if (norm <= 0.9) {
            const hash =
              Math.abs(Math.round(c.cx + dx) * 19 + Math.round(c.cy + dy) * 31) %
              10;
            if (dy < -ry * 0.25) {
              setPx(
                c.cx + dx,
                c.cy + dy - 1,
                hash < 3 ? palette.blossomGlow : palette.blossomHighlight
              );
            } else if (dy < ry * 0.2 && hash < 6) {
              setPx(c.cx + dx, c.cy + dy, palette.blossomBright);
            } else if (hash === 0) {
              setPx(c.cx + dx, c.cy + dy, palette.blossomHighlight);
            }
          }
        }
      }
    }

    // 4. Pixel Stone Lantern (Toro)
    const lx = baseX - 28;
    const ly = baseY - 1;
    for (let y = 0; y < 7; y++) {
      setPx(lx, ly - y, palette.lanternBody);
      setPx(lx + 1, ly - y, palette.lanternBody);
    }
    for (let dx = -1; dx <= 2; dx++) {
      setPx(lx + dx, ly - 7, palette.lanternBody);
      setPx(lx + dx, ly - 10, palette.lanternBody);
    }
    setPx(lx - 1, ly - 8, palette.lanternBody);
    setPx(lx + 2, ly - 8, palette.lanternBody);
    setPx(lx - 1, ly - 9, palette.lanternBody);
    setPx(lx + 2, ly - 9, palette.lanternBody);
    setPx(lx, ly - 8, palette.lanternLight);
    setPx(lx + 1, ly - 8, palette.lanternLight);
    setPx(lx, ly - 9, palette.lanternLight);
    setPx(lx + 1, ly - 9, palette.lanternLight);
    for (let dx = -3; dx <= 4; dx++) {
      setPx(lx + dx, ly - 11, palette.lanternBody);
    }
    for (let dx = -2; dx <= 3; dx++) {
      setPx(lx + dx, ly - 12, palette.lanternBody);
    }
    setPx(lx, ly - 13, palette.lanternBody);
    setPx(lx + 1, ly - 13, palette.lanternBody);

    // 5. Floating Mossy Island Mound & Fallen Petals
    const moundWidth = 48;
    for (let dx = -moundWidth; dx <= moundWidth; dx++) {
      const normX = dx / moundWidth;
      const topCurve = Math.round(normX * normX * 4);
      const bottomDepth = Math.round((1 - normX * normX) * 10);
      const x = baseX - 3 + dx;

      for (let dy = topCurve; dy <= topCurve + bottomDepth; dy++) {
        const y = baseY + dy;
        if (dy <= topCurve + 1) {
          setPx(x, y, palette.grassTop);
        } else if (dy <= topCurve + 3) {
          setPx(x, y, (x + y) % 2 === 0 ? palette.grassTop : palette.earthMid);
        } else if (dy <= topCurve + 7) {
          setPx(x, y, palette.earthMid);
        } else {
          setPx(x, y, palette.earthDeep);
        }
      }

      if (Math.abs(dx) < moundWidth - 5 && rng() < 0.35) {
        setPx(
          x,
          baseY + topCurve,
          rng() < 0.5 ? palette.blossomBright : palette.blossomHighlight
        );
      }
    }

    // 6. Gentle Pixel Petals (capped 12 FPS)
    const petalColors = [
      palette.blossomBright,
      palette.blossomHighlight,
      palette.blossomMid,
    ];
    const petals: Petal[] = Array.from({ length: 7 }, (_, i) => ({
      x: 35 + ((i * 13) % 85),
      y: 26 + ((i * 17) % 78),
      vx: -0.25 - (i % 3) * 0.07,
      vy: 0.3 + (i % 2) * 0.1,
      color: petalColors[i % petalColors.length],
      size: i % 4 === 0 ? 2 : 1,
    }));

    const renderFrame = () => {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.drawImage(staticCanvas, 0, 0);

      for (const p of petals) {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, 1);
      }
    };

    renderFrame();

    if (!breezeEnabled) return;

    let animId: number;
    let lastTick = performance.now();
    const FRAME_INTERVAL = 1000 / 12;

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);
      if (now - lastTick < FRAME_INTERVAL) return;
      lastTick = now;

      for (const p of petals) {
        p.x += p.vx + Math.sin(now * 0.0015 + p.y * 0.1) * 0.1;
        p.y += p.vy;

        if (p.y > baseY + 3 || p.x < 6) {
          p.x = 50 + ((Math.round(now) + p.y * 7) % 70);
          p.y = 24 + (Math.round(now) % 24);
        }
      }
      renderFrame();
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [mounted, resolvedTheme, seed, breezeEnabled]);

  return (
    <div className="group relative w-full max-w-[270px] mx-auto select-none flex flex-col items-center">
      {/* Frameless Transparent Pixel Canvas */}
      <canvas
        ref={canvasRef}
        width={LOGICAL_WIDTH}
        height={LOGICAL_HEIGHT}
        aria-label="Procedural pixel art Japanese Sakura cherry blossom tree"
        className="w-full h-auto aspect-[152/136] pixelated-canvas block"
      />

      {/* Whisper-quiet frameless controls underneath */}
      <div className="mt-1 flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity text-[11px] font-mono text-stone-500 dark:text-zinc-400">
        <button
          type="button"
          onClick={() => setSeed((s) => (s === 2026 ? 1337 : s + 17))}
          className="inline-flex items-center gap-1 hover:text-sakura-600 dark:hover:text-sakura-300 transition-colors"
          title="Grow a new sakura tree variation"
        >
          <RefreshCw className="w-3 h-3" />
          <span>regrow</span>
        </button>
        <span className="text-stone-300 dark:text-zinc-700">·</span>
        <button
          type="button"
          onClick={() => setBreezeEnabled((b) => !b)}
          className={`inline-flex items-center gap-1 transition-colors ${
            breezeEnabled
              ? "hover:text-sakura-600 dark:hover:text-sakura-300"
              : "line-through opacity-70"
          }`}
          title="Toggle petal breeze"
        >
          <Wind className="w-3 h-3" />
          <span>breeze</span>
        </button>
      </div>
    </div>
  );
}
