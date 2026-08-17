/**
 * Pure derivation helpers that turn the flat PmContent bundle (as fetched
 * from Supabase) into the shapes the UI components actually want: a matrix
 * grouped by area/group, resource items grouped by area/kind, lookup maps,
 * and a flat "every process" list used by search, the detail modal, and the
 * quiz. Kept dependency-free and side-effect-free so it can run on the
 * server or the client.
 */
import type { KnowledgeArea, PmContent, ProcessGroup, ResourceItem, ResourceKind } from "./content";

export type FlatProcess = {
  id: number;
  title: string;
  areaId: number;
  areaName: string;
  groupId: number;
  groupName: string;
};

export type MatrixCell = {
  group: ProcessGroup;
  processes: { id: number; title: string }[];
};

export type MatrixRow = {
  area: KnowledgeArea;
  cells: MatrixCell[];
};

export type ResourceGroup = {
  area: KnowledgeArea;
  items: ResourceItem[];
};

export type PmModel = {
  areaById: Map<number, KnowledgeArea>;
  groupById: Map<number, ProcessGroup>;
  matrix: MatrixRow[];
  allProcesses: FlatProcess[];
  definitionByAreaManagementTitle: Map<string, PmContent["definitions"][number]>;
  resourceItemsByAreaAndKind: Map<string, ResourceItem[]>; // key: `${areaId}:${kind}`
};

export function buildPmModel(content: PmContent): PmModel {
  const areaById = new Map(content.knowledgeAreas.map((a) => [a.id, a]));
  const groupById = new Map(content.processGroups.map((g) => [g.id, g]));

  const matrix: MatrixRow[] = content.knowledgeAreas.map((area) => ({
    area,
    cells: content.processGroups.map((group) => ({
      group,
      processes: content.processes
        .filter((p) => p.knowledgeAreaId === area.id && p.processGroupId === group.id)
        .map((p) => ({ id: p.id, title: p.title })),
    })),
  }));

  const allProcesses: FlatProcess[] = content.processes
    .map((p) => {
      const area = areaById.get(p.knowledgeAreaId);
      const group = groupById.get(p.processGroupId);
      if (!area || !group) return null;
      return { id: p.id, title: p.title, areaId: area.id, areaName: area.name, groupId: group.id, groupName: group.name };
    })
    .filter((p): p is FlatProcess => p !== null);

  const definitionByAreaManagementTitle = new Map(content.definitions.map((d) => [d.title, d]));

  const resourceItemsByAreaAndKind = new Map<string, ResourceItem[]>();
  for (const item of content.resourceItems) {
    const key = `${item.knowledgeAreaId}:${item.kind}`;
    const bucket = resourceItemsByAreaAndKind.get(key);
    if (bucket) bucket.push(item);
    else resourceItemsByAreaAndKind.set(key, [item]);
  }

  return { areaById, groupById, matrix, allProcesses, definitionByAreaManagementTitle, resourceItemsByAreaAndKind };
}

/** Groups resource items of one kind ("input" | "tool" | "output") by knowledge area, in area display order. */
export function groupResourcesByArea(content: PmContent, model: PmModel, kind: ResourceKind): ResourceGroup[] {
  return content.knowledgeAreas.map((area) => ({
    area,
    items: model.resourceItemsByAreaAndKind.get(`${area.id}:${kind}`) ?? [],
  }));
}

const matches = (text: string, term: string) => !term || text.toLowerCase().includes(term.toLowerCase());

export { matches };
