import { invoke } from "@tauri-apps/api/core";
import { SnakeFood, type AddReptileInput, type DetailedReptileDTO, type FeedingEntry, type FeedingInput, type GrowthEntry, type GrowthInput, type ReptileDTO } from "../types";
import { addMockReptile, deleteMockGrowthEntry, getMockGrowthEntries, getMockReptile, getMockReptiles, normalizeGrowthEntries, normalizeReptileDTO, normalizeReptileList, saveMockGrowthEntry, updateMockReptile } from "./reptileMock";

const isTauri = "__TAURI_INTERNALS__" in window;

export async function getReptiles(): Promise<ReptileDTO[]> {
    if (!isTauri) return getMockReptiles();
    return normalizeReptileList(await invoke<unknown>("get_reptile_list"));
}

export async function addReptile(reptile: AddReptileInput): Promise<ReptileDTO> {
    if (!isTauri) return addMockReptile(reptile);
    const result: unknown = await invoke<unknown>("add_reptile", { req: reptile });
    const normalized = normalizeReptileDTO(result);
    if (!normalized) throw new Error("Invalid reptile response");
    return normalized;
}

export async function updateReptile(id: string, reptile: Omit<ReptileDTO, "id">): Promise<ReptileDTO> {
    if (!isTauri) return updateMockReptile(id, reptile);
    const result: unknown = await invoke<unknown>("update_reptile", { reptileId: id, req: reptile });
    const normalized = normalizeReptileDTO(result);
    if (!normalized) throw new Error("Invalid reptile response");
    return normalized;
}

export async function getReptile(id: string): Promise<DetailedReptileDTO> {
    if (!isTauri) return getMockReptile(id);
    const [reptileRows, growthRows, feedingRows] = await Promise.all([
        invoke<unknown>("get_reptile_list"),
        invoke<unknown>("get_growth_entries", { reptileId: id }),
        invoke<unknown>("get_feeding_entries", { reptileId: id }),
    ]);
    const reptile = normalizeReptileList(reptileRows).find((item) => item.id === id);
    if (!reptile) throw new Error("Reptile not found");
    if (!Array.isArray(feedingRows)) throw new Error("Invalid feeding entries response");
    return { ...reptile, feedings: feedingRows.map((row) => normalizeFeeding(row as Omit<FeedingEntry, "foodType"> & { foodType: string })), growth: normalizeGrowthEntries(growthRows) };
}

import { deleteMockFeeding, getMockFeedingEntries, saveMockFeeding } from "./reptileMock";

function foodKey(food: SnakeFood) {
    return Object.entries(SnakeFood).find(([, label]) => label === food)?.[0] ?? "FUZZY";
}

function normalizeFeeding(entry: Omit<FeedingEntry, "foodType"> & { foodType: string }): FeedingEntry {
    const value = SnakeFood[entry.foodType as keyof typeof SnakeFood] ?? entry.foodType;
    return { ...entry, foodType: value as SnakeFood };
}

function serializeFeeding(entry: FeedingInput, id?: string) {
    return { ...entry, foodType: foodKey(entry.foodType), ...(id ? { id } : {}) };
}

export async function getFeedings(reptileId: string): Promise<FeedingEntry[]> {
    if (!isTauri) return getMockFeedingEntries(reptileId);
    const entries = await invoke<Array<Omit<FeedingEntry, "foodType"> & { foodType: string }>>("get_feeding_entries", { reptileId });
    return entries.map(normalizeFeeding);
}

export async function saveFeeding(reptileId: string, entry: FeedingInput, id?: string): Promise<FeedingEntry> {
    const saved = { ...entry, id: id ?? `feeding-${crypto.randomUUID()}` };
    if (!isTauri) return saveMockFeeding(reptileId, saved);
    const result = await invoke<Omit<FeedingEntry, "foodType"> & { foodType: string }>(id ? "update_feeding" : "add_feeding", { reptileId, req: serializeFeeding(entry, id) });
    return normalizeFeeding(result);
}

export async function removeFeeding(reptileId: string, id: string): Promise<void> {
    if (!isTauri) return deleteMockFeeding(reptileId, id);
    await invoke("delete_feeding", { reptileId, id });
}

export async function getGrowthEntries(reptileId: string): Promise<GrowthEntry[]> {
    if (!isTauri) return getMockGrowthEntries(reptileId);
    return normalizeGrowthEntries(await invoke<unknown>("get_growth_entries", { reptileId }));
}

export async function saveGrowthEntry(reptileId: string, entry: GrowthInput, id?: string): Promise<GrowthEntry> {
    if (!isTauri) return saveMockGrowthEntry(reptileId, entry, id);
    const saved = await invoke<unknown>(id ? "update_growth_entry" : "add_growth_entry", { reptileId, req: { ...entry, ...(id ? { id } : {}) } });
    const normalized = normalizeGrowthEntries([saved])[0];
    if (!normalized) throw new Error("Invalid growth entry response");
    return normalized;
}

export async function removeGrowthEntry(reptileId: string, id: string): Promise<void> {
    if (!isTauri) return deleteMockGrowthEntry(reptileId, id);
    await invoke("delete_growth_entry", { reptileId, id });
}
