export type ContentSource = "org" | "markdown" | "notion";

export interface BacklinkRef {
  slug: string;
  title: string;
  description: string;
  source: ContentSource;
}

export interface BlogPostMeta {
  slug: string;
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  featured: boolean;
  source: ContentSource;
  readingTime: string;
  fileName?: string;
  roamId?: string;
  outboundRoamIds?: string[];
  backlinks?: BacklinkRef[];
}

export interface BlogPost extends BlogPostMeta {
  htmlContent: string;
  rawContent?: string;
}

export interface GraphNode {
  id: string;
  slug: string;
  title: string;
  source: ContentSource | "vault";
  tags: string[];
  date: string;
  published: boolean;
  featured?: boolean;
  degree: number;
  vaultPath?: string;
  description?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  kind: "link" | "tag";
  label?: string;
}

export interface NoteGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
