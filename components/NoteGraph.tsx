"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowUpRight,
  Hash,
  Link2,
  Maximize2,
  Network,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { GraphEdge, GraphNode, NoteGraphData } from "@/lib/content/types";

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface NoteGraphProps {
  data: NoteGraphData;
  height?: number;
  onPublishVaultNode?: (vaultPath: string) => void;
}

export default function NoteGraph({
  data,
  height = 380,
  onPublishVaultNode,
}: NoteGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();

  const [showTagEdges, setShowTagEdges] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(
    data.nodes[0]?.id || null
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [simVersion, setSimVersion] = useState(0);

  const activeEdges = useMemo(() => {
    return data.edges.filter((e) => showTagEdges || e.kind === "link");
  }, [data.edges, showTagEdges]);

  const selectedNode = useMemo(
    () => data.nodes.find((n) => n.id === selectedId) || null,
    [data.nodes, selectedId]
  );

  const connectedNodes = useMemo(() => {
    if (!selectedId) return [];
    const neighborIds = new Set<string>();
    for (const e of activeEdges) {
      if (e.source === selectedId) neighborIds.add(e.target);
      if (e.target === selectedId) neighborIds.add(e.source);
    }
    return data.nodes.filter((n) => neighborIds.has(n.id));
  }, [activeEdges, data.nodes, selectedId]);

  // Keep simulation nodes in a ref for smooth 60fps interaction
  const simNodesRef = useRef<SimNode[]>([]);
  const dragStateRef = useRef<{
    draggingNodeId: string | null;
    isPanning: boolean;
    startX: number;
    startY: number;
    originPanX: number;
    originPanY: number;
  }>({
    draggingNodeId: null,
    isPanning: false,
    startX: 0,
    startY: 0,
    originPanX: 0,
    originPanY: 0,
  });

  // Initialize node positions in a deterministic spiral/circle
  useEffect(() => {
    const count = data.nodes.length || 1;
    simNodesRef.current = data.nodes.map((n, i) => {
      const angle = (i / count) * Math.PI * 2;
      const dist = 65 + (i % 3) * 32;
      return {
        ...n,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: Math.min(11, Math.max(5.5, 5.5 + n.degree * 0.9)),
      };
    });
  }, [data.nodes, simVersion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let alpha = 1.0; // Simulation cooling factor

    const render = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (
        canvas.width !== Math.floor(rect.width * dpr) ||
        canvas.height !== Math.floor(height * dpr)
      ) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const width = rect.width;
      const isDark = resolvedTheme === "dark";

      // Clear background
      ctx.clearRect(0, 0, width, height);

      const nodes = simNodesRef.current;
      const nodeMap = new Map<string, SimNode>();
      for (const n of nodes) nodeMap.set(n.id, n);

      // Physics step while warm or dragging
      if (alpha > 0.01 || dragStateRef.current.draggingNodeId) {
        // 1. All-pairs repulsion
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let distSq = dx * dx + dy * dy;
            if (distSq < 1) {
              dx = (Math.random() - 0.5) * 2;
              dy = (Math.random() - 0.5) * 2;
              distSq = 4;
            }
            const dist = Math.sqrt(distSq);
            const force = (1100 * alpha) / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          }
        }

        // 2. Spring attraction along edges
        for (const edge of activeEdges) {
          const a = nodeMap.get(edge.source);
          const b = nodeMap.get(edge.target);
          if (!a || !b) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetLen = edge.kind === "link" ? 85 : 125;
          const strength = edge.kind === "link" ? 0.045 : 0.018;
          const f = (dist - targetLen) * strength * alpha;
          const fx = (dx / dist) * f;
          const fy = (dy / dist) * f;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }

        // 3. Centering gravity & velocity integration
        for (const n of nodes) {
          if (dragStateRef.current.draggingNodeId === n.id) {
            n.vx = 0;
            n.vy = 0;
            continue;
          }
          n.vx -= n.x * 0.012 * alpha;
          n.vy -= n.y * 0.012 * alpha;
          n.vx *= 0.82;
          n.vy *= 0.82;
          n.x += n.vx;
          n.y += n.vy;
        }

        alpha *= 0.985;
      }

      // Transform to center + pan + zoom
      ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
      ctx.scale(zoom, zoom);

      const focusId = hoveredId || selectedId;
      const focusNeighbors = new Set<string>();
      if (focusId) {
        focusNeighbors.add(focusId);
        for (const e of activeEdges) {
          if (e.source === focusId) focusNeighbors.add(e.target);
          if (e.target === focusId) focusNeighbors.add(e.source);
        }
      }

      // Draw Edges
      for (const edge of activeEdges) {
        const a = nodeMap.get(edge.source);
        const b = nodeMap.get(edge.target);
        if (!a || !b) continue;

        const isHighlighted =
          focusId && (edge.source === focusId || edge.target === focusId);

        ctx.beginPath();
        if (edge.kind === "tag") {
          ctx.setLineDash([3, 3]);
        } else {
          ctx.setLineDash([]);
        }

        if (isHighlighted) {
          ctx.strokeStyle = isDark
            ? "rgba(244, 114, 182, 0.85)"
            : "rgba(219, 39, 119, 0.75)";
          ctx.lineWidth = edge.kind === "link" ? 1.8 : 1.2;
        } else {
          ctx.strokeStyle = isDark
            ? edge.kind === "link"
              ? "rgba(161, 161, 170, 0.28)"
              : "rgba(113, 113, 122, 0.16)"
            : edge.kind === "link"
            ? "rgba(120, 113, 108, 0.32)"
            : "rgba(168, 162, 158, 0.2)";
          ctx.lineWidth = 1;
        }

        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw Nodes & Labels
      for (const n of nodes) {
        const isSelected = n.id === selectedId;
        const isHovered = n.id === hoveredId;
        const isDimmed =
          hoveredId !== null && !focusNeighbors.has(n.id);

        // Node fill color by source
        let fill = "#f472b6"; // org default sakura
        if (n.source === "markdown") {
          fill = isDark ? "#34d399" : "#059669";
        } else if (n.source === "notion") {
          fill = isDark ? "#fbbf24" : "#d97706";
        } else if (n.source === "vault") {
          fill = isDark ? "#818cf8" : "#6366f1";
        } else {
          fill = isDark ? "#f472b6" : "#db2777";
        }

        ctx.save();
        if (isDimmed) {
          ctx.globalAlpha = 0.28;
        }

        // Outer halo for selected or hovered node
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 4.5, 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? "rgba(244, 114, 182, 0.22)"
            : "rgba(219, 39, 119, 0.16)";
          ctx.fill();
        }

        // Main node circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();

        ctx.lineWidth = isSelected ? 2 : 1.2;
        ctx.strokeStyle = isDark ? "#18181b" : "#faf8f5";
        ctx.stroke();

        // Node Title Label
        const label =
          n.title.length > 26 ? `${n.title.slice(0, 24)}…` : n.title;
        ctx.font = `${isSelected || isHovered ? "600" : "500"} 11px ui-sans-serif, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = isDark ? "#e4e4e7" : "#292524";
        ctx.fillText(label, n.x, n.y + n.radius + 13);

        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeEdges, height, hoveredId, pan, resolvedTheme, selectedId, zoom]);

  // Coordinate helper: screen clientX/Y -> simulation world X/Y
  const screenToWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    const wx = (sx - rect.width / 2 - pan.x) / zoom;
    const wy = (sy - height / 2 - pan.y) / zoom;
    return { x: wx, y: wy };
  };

  const findNodeAt = (wx: number, wy: number): SimNode | null => {
    const nodes = simNodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = wx - n.x;
      const dy = wy - n.y;
      if (dx * dx + dy * dy <= (n.radius + 5) * (n.radius + 5)) {
        return n;
      }
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const hit = findNodeAt(x, y);
    if (hit) {
      setSelectedId(hit.id);
      dragStateRef.current.draggingNodeId = hit.id;
    } else {
      dragStateRef.current.isPanning = true;
      dragStateRef.current.startX = e.clientX;
      dragStateRef.current.startY = e.clientY;
      dragStateRef.current.originPanX = pan.x;
      dragStateRef.current.originPanY = pan.y;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);

    if (dragStateRef.current.draggingNodeId) {
      const node = simNodesRef.current.find(
        (n) => n.id === dragStateRef.current.draggingNodeId
      );
      if (node) {
        node.x = x;
        node.y = y;
      }
      return;
    }

    if (dragStateRef.current.isPanning) {
      const dx = e.clientX - dragStateRef.current.startX;
      const dy = e.clientY - dragStateRef.current.startY;
      setPan({
        x: dragStateRef.current.originPanX + dx,
        y: dragStateRef.current.originPanY + dy,
      });
      return;
    }

    const hit = findNodeAt(x, y);
    setHoveredId(hit ? hit.id : null);
  };

  const handlePointerUp = () => {
    dragStateRef.current.draggingNodeId = null;
    dragStateRef.current.isPanning = false;
  };

  return (
    <div className="rounded-2xl border border-stone-200/80 dark:border-zinc-800/90 bg-white/50 dark:bg-zinc-900/35 overflow-hidden">
      {/* Top Graph Toolbar */}
      <div className="px-4 py-2.5 border-b border-stone-200/70 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-semibold text-stone-800 dark:text-zinc-200">
            <Network className="w-3.5 h-3.5 text-sakura-500" />
            <span>Interconnected Note Graph</span>
          </span>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-stone-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sakura-500" />
              org-roam
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              markdown
            </span>
            {data.nodes.some((n) => n.source === "vault") && (
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                private vault
              </span>
            )}
          </div>
        </div>

        {/* Graph Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowTagEdges((v) => !v)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono border transition-colors ${
              showTagEdges
                ? "border-sakura-300 dark:border-sakura-800 bg-sakura-50/80 dark:bg-sakura-950/50 text-sakura-700 dark:text-sakura-300"
                : "border-stone-200 dark:border-zinc-800 text-stone-500 dark:text-zinc-400"
            }`}
            title="Toggle shared tag connections"
          >
            <Hash className="w-3 h-3" />
            <span>tags</span>
          </button>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2, +(z + 0.2).toFixed(2)))}
            className="p-1.5 rounded-md border border-stone-200/80 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.2).toFixed(2)))}
            className="p-1.5 rounded-md border border-stone-200/80 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
              setSimVersion((v) => v + 1);
            }}
            className="p-1.5 rounded-md border border-stone-200/80 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100"
            title="Reset graph layout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas + Selected Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div
          ref={containerRef}
          className="lg:col-span-8 relative cursor-grab active:cursor-grabbing"
          style={{ height }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full h-full block"
          />
          <div className="absolute bottom-2.5 left-3 pointer-events-none text-[10px] font-mono text-stone-400 dark:text-zinc-500">
            Drag nodes to explore · Click a node to inspect connections
          </div>
        </div>

        {/* Selected Node Details Panel */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-stone-200/70 dark:border-zinc-800/80 p-4 flex flex-col justify-between bg-[#faf8f5]/60 dark:bg-zinc-950/30">
          {selectedNode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-sakura-300/60 dark:border-sakura-800/60 bg-sakura-50/70 dark:bg-sakura-950/40 text-sakura-700 dark:text-sakura-300">
                  {selectedNode.source === "vault"
                    ? "Private Org Vault"
                    : selectedNode.source}
                </span>
                <span className="text-[11px] font-mono text-stone-400 dark:text-zinc-500">
                  {selectedNode.date}
                </span>
              </div>

              <h4 className="font-semibold text-base text-stone-900 dark:text-zinc-100 leading-snug">
                {selectedNode.title}
              </h4>

              {selectedNode.description && (
                <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                  {selectedNode.description}
                </p>
              )}

              {selectedNode.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {selectedNode.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Connected Neighbors */}
              <div className="pt-2 border-t border-stone-200/60 dark:border-zinc-800/70 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-zinc-500 flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  <span>Connected Notes ({connectedNodes.length})</span>
                </span>
                {connectedNodes.length === 0 ? (
                  <p className="text-xs text-stone-400 dark:text-zinc-500 italic">
                    No direct links yet.
                  </p>
                ) : (
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {connectedNodes.map((cn) => (
                      <button
                        key={cn.id}
                        type="button"
                        onClick={() => setSelectedId(cn.id)}
                        className="w-full text-left text-xs px-2 py-1 rounded hover:bg-stone-200/60 dark:hover:bg-zinc-800/70 text-stone-700 dark:text-zinc-300 truncate flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{cn.title}</span>
                        <span className="text-[10px] font-mono opacity-60 shrink-0">
                          {cn.source}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-stone-400 dark:text-zinc-500 py-8 text-center">
              Select a node in the graph to inspect its links and metadata.
            </div>
          )}

          {selectedNode && (
            <div className="pt-4 mt-3 border-t border-stone-200/60 dark:border-zinc-800/70 flex items-center justify-between gap-2">
              {selectedNode.published ? (
                <Link
                  href={`/post/${selectedNode.slug}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-stone-900 text-stone-50 dark:bg-sakura-500 dark:text-zinc-950 hover:bg-sakura-600 dark:hover:bg-sakura-400 transition-colors"
                >
                  <span>Read Note</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              ) : onPublishVaultNode && selectedNode.vaultPath ? (
                <button
                  type="button"
                  onClick={() => onPublishVaultNode(selectedNode.vaultPath!)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-sakura-600 text-white hover:bg-sakura-500 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Publish Vault Note to Blog</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-stone-400 dark:text-zinc-500">
                  Private Org-roam vault node
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
