/**
 * Search/filter logic shared by the process matrix, definitions grid, and
 * resource (inputs/tools/outputs) grids. Pure functions: given content +
 * current UI filter state, return exactly what a panel should render plus
 * its result count (used for the tab badges).
 */
import type { KnowledgeArea, PmContent, ResourceItem, ResourceKind } from "./content";
import { matches, type PmModel } from "./pm-model";

export type AreaFilter = number | "all";

// ---------- Process matrix ----------
export type FilteredMatrixCell = { groupId: number; groupName: string; processes: { id: number; title: string }[] };
export type FilteredMatrixRow = { area: KnowledgeArea; cells: FilteredMatrixCell[] };
export type FilteredMatrix = { rows: FilteredMatrixRow[]; count: number };

export function filterMatrix(
  model: PmModel,
  filter: string,
  areaId: AreaFilter,
  favoritesOnly: boolean,
  bookmarks: Set<number>
): FilteredMatrix {
  let count = 0;
  const rows: FilteredMatrixRow[] = [];

  for (const row of model.matrix) {
    if (areaId !== "all" && row.area.id !== areaId) continue;
    const cells: FilteredMatrixCell[] = row.cells.map((cell) => {
      const processes = cell.processes.filter((p) => {
        if (favoritesOnly && !bookmarks.has(p.id)) return false;
        return matches(p.title, filter);
      });
      count += processes.length;
      return { groupId: cell.group.id, groupName: cell.group.name, processes };
    });
    rows.push({ area: row.area, cells });
  }

  return { rows, count };
}

// ---------- Definitions ----------
export type FilteredDefinitions = { items: PmContent["definitions"]; count: number };

export function filterDefinitions(definitions: PmContent["definitions"], filter: string): FilteredDefinitions {
  const items = definitions.filter((d) => matches(d.title, filter) || matches(d.body, filter));
  return { items, count: items.length };
}

// ---------- Inputs / Tools / Outputs ----------
export type FilteredResourceGroup = { area: KnowledgeArea; items: ResourceItem[] };
export type FilteredResourceGroups = { groups: FilteredResourceGroup[]; count: number };

export function filterResourceGroups(
  content: PmContent,
  model: PmModel,
  kind: ResourceKind,
  filter: string,
  areaId: AreaFilter
): FilteredResourceGroups {
  let count = 0;
  const groups: FilteredResourceGroup[] = [];

  for (const area of content.knowledgeAreas) {
    if (areaId !== "all" && area.id !== areaId) continue;
    const items = (model.resourceItemsByAreaAndKind.get(`${area.id}:${kind}`) ?? []).filter((it) =>
      matches(it.label, filter)
    );
    if (filter && items.length === 0) continue; // hide area entirely once a search yields nothing for it
    count += items.length;
    groups.push({ area, items });
  }

  return { groups, count };
}
