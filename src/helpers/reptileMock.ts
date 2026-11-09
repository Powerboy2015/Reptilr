import type { AddReptileInput, DetailedReptileDTO, ReptileDTO } from "../types";

const STORAGE_KEY = "reptilr.mock-reptiles.v1";

const seedReptiles: ReptileDTO[] = [
    {
        id: "demo-ball-python",
        name: "Noodle",
        birth_date: "2020-05-12",
        species: "Ball python",
        weight_grams: 120,
        length_cm: 40,
        last_shed: "2026-10-02",
    },
];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeReptileDTO(value: unknown): ReptileDTO | undefined {
    if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string") {
        return undefined;
    }

    return {
        id: value.id,
        name: value.name,
        birth_date: typeof value.birth_date === "string" ? value.birth_date : "",
        species: typeof value.species === "string" ? value.species : "",
        weight_grams: typeof value.weight_grams === "number" ? value.weight_grams : 0,
        length_cm: typeof value.length_cm === "number" ? value.length_cm : 0,
        last_shed: typeof value.last_shed === "string" ? value.last_shed : "",
    };
}

export function normalizeReptileList(value: unknown): ReptileDTO[] {
    if (!Array.isArray(value)) throw new Error("Invalid reptile list response");

    const reptiles = value.map(normalizeReptileDTO);
    if (reptiles.some((reptile) => reptile === undefined)) throw new Error("Invalid reptile list response");
    return reptiles.filter((reptile): reptile is ReptileDTO => reptile !== undefined);
}

function saveReptiles(reptiles: ReptileDTO[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reptiles));
}

export function getMockReptiles(): ReptileDTO[] {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (serialized === null) {
            saveReptiles(seedReptiles);
            return [...seedReptiles];
        }
        const parsed: unknown = JSON.parse(serialized);
        const reptiles = normalizeReptileList(parsed);
        saveReptiles(reptiles);
        return reptiles;
    } catch {
        return [...seedReptiles];
    }
}

export function addMockReptile(input: AddReptileInput): ReptileDTO {
    const reptile: ReptileDTO = {
        id: `mock-${crypto.randomUUID()}`,
        name: input.name,
        species: input.species,
        birth_date: input.birth_date ?? "",
        weight_grams: input.weight_grams ?? 0,
        length_cm: input.length_cm ?? 0,
        last_shed: input.last_shed ?? "",
    };
    saveReptiles([...getMockReptiles(), reptile]);
    return reptile;
}

export function getMockReptile(id: string): DetailedReptileDTO {
    const reptile = getMockReptiles().find((item) => item.id === id);
    if (!reptile) throw new Error("Reptile not found");

    return { ...reptile, feedings: [] };
}
