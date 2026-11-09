import { invoke } from "@tauri-apps/api/core";
import { SnakeFood, type AddReptileInput, type DetailedReptileDTO, type ReptileDTO } from "../types";
import { addMockReptile, getMockReptile, getMockReptiles, normalizeReptileDTO, normalizeReptileList } from "./reptileMock";

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
    return {
        id,
        name: "joseph",
        birth_date: "1985-10-10",
        feedings: [{ date: "1920-10-10", foodType: SnakeFood.SM_PINKY, amount: 1, powdered: true, powderType: "vitamins" }],
    };
}
