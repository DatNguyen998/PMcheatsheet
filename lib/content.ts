/**
 * Typed, read-only access to the PM knowledge content stored in Supabase.
 * This is the sole data-access boundary — components never talk to Supabase
 * directly, only to the shapes returned here.
 */
import { getSupabaseClient } from "./supabase/client";

export type KnowledgeArea = {
  id: number;
  name: string;
  hue: number;
  icon: string;
  blurb: string;
  sortOrder: number;
};

export type ProcessGroup = {
  id: number;
  name: string;
  sortOrder: number;
};

export type ProcessRow = {
  id: number;
  title: string;
  knowledgeAreaId: number;
  processGroupId: number;
  sortOrder: number;
};

export type Definition = {
  id: number;
  title: string;
  icon: string;
  body: string;
  sortOrder: number;
};

export type ResourceKind = "input" | "tool" | "output";

export type ResourceItem = {
  id: number;
  knowledgeAreaId: number;
  kind: ResourceKind;
  label: string;
  sortOrder: number;
};

export type PmContent = {
  /** False when Supabase isn't configured yet (missing env vars). */
  configured: boolean;
  knowledgeAreas: KnowledgeArea[];
  processGroups: ProcessGroup[];
  processes: ProcessRow[];
  definitions: Definition[];
  resourceItems: ResourceItem[];
};

const EMPTY_CONTENT: PmContent = {
  configured: false,
  knowledgeAreas: [],
  processGroups: [],
  processes: [],
  definitions: [],
  resourceItems: [],
};

/**
 * Fetches every content table in parallel and returns a single typed bundle.
 * Call this from a Server Component (see app/page.tsx) — it's cheap enough
 * (a few hundred small rows) to fetch fresh on every request/revalidation.
 */
export async function getPmContent(): Promise<PmContent> {
  const supabase = getSupabaseClient();
  if (!supabase) return EMPTY_CONTENT;

  const [areasRes, groupsRes, processesRes, definitionsRes, itemsRes] = await Promise.all([
    supabase.from("knowledge_areas").select("id, name, hue, icon, blurb, sort_order").order("sort_order"),
    supabase.from("process_groups").select("id, name, sort_order").order("sort_order"),
    supabase.from("processes").select("id, title, knowledge_area_id, process_group_id, sort_order").order("sort_order"),
    supabase.from("definitions").select("id, title, icon, body, sort_order").order("sort_order"),
    supabase.from("resource_items").select("id, knowledge_area_id, kind, label, sort_order").order("sort_order"),
  ]);

  for (const [name, res] of [
    ["knowledge_areas", areasRes],
    ["process_groups", groupsRes],
    ["processes", processesRes],
    ["definitions", definitionsRes],
    ["resource_items", itemsRes],
  ] as const) {
    if (res.error) {
      console.error(`[content] Failed to load ${name}:`, res.error.message);
    }
  }

  return {
    configured: true,
    knowledgeAreas: (areasRes.data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      hue: r.hue,
      icon: r.icon,
      blurb: r.blurb,
      sortOrder: r.sort_order,
    })),
    processGroups: (groupsRes.data ?? []).map((r) => ({ id: r.id, name: r.name, sortOrder: r.sort_order })),
    processes: (processesRes.data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      knowledgeAreaId: r.knowledge_area_id,
      processGroupId: r.process_group_id,
      sortOrder: r.sort_order,
    })),
    definitions: (definitionsRes.data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      icon: r.icon,
      body: r.body,
      sortOrder: r.sort_order,
    })),
    resourceItems: (itemsRes.data ?? []).map((r) => ({
      id: r.id,
      knowledgeAreaId: r.knowledge_area_id,
      kind: r.kind as ResourceKind,
      label: r.label,
      sortOrder: r.sort_order,
    })),
  };
}
