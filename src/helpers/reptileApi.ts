import { invoke } from "@tauri-apps/api/core";
import { type AddReptileInput, type DetailedReptileDTO, type ReptileDTO } from "../types";
import { addMockReptile, getMockReptile, getMockReptiles, normalizeGrowthEntries, normalizeReptileDTO, normalizeReptileList } from "./reptileMock";

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

export async function getReptile(id: string): Promise<DetailedReptileDTO> {
    if (!isTauri) return getMockReptile(id);
    const [reptileRows, growthRows] = await Promise.all([
        invoke<unknown>("get_reptile_list"),
        invoke<unknown>("get_growth_entries", { reptileId: id }),
    ]);
    const reptile = normalizeReptileList(reptileRows).find((item) => item.id === id);
    if (!reptile) throw new Error("Reptile not found");
    return { ...reptile, feedings: [], growth: normalizeGrowthEntries(growthRows) };
}
