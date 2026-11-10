import type { AddReptileInput, DetailedReptileDTO, GrowthEntry, ReptileDTO } from "../types";

const STORAGE_KEY = "reptilr.mock-reptiles.v1";
const GROWTH_STORAGE_KEY = "reptilr.mock-growth.v1";

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

const seedGrowth: Record<string, GrowthEntry[]> = {
    "demo-ball-python": [
        { id: "seed-growth-1", date: "2026-08-02", weight_grams: 110, length_cm: 38 },
        { id: "seed-growth-2", date: "2026-10-02", weight_grams: 120, length_cm: 40 },
    ],
};

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

export function normalizeGrowthEntries(value: unknown): GrowthEntry[] {
    if (!Array.isArray(value)) throw new Error("Invalid growth entries response");
    return value.map((entry) => {
        if (!isRecord(entry) || typeof entry.id !== "string" || typeof entry.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)
            || typeof entry.weight_grams !== "number" || !Number.isFinite(entry.weight_grams) || entry.weight_grams < 0
            || typeof entry.length_cm !== "number" || !Number.isFinite(entry.length_cm) || entry.length_cm < 0) {
            throw new Error("Invalid growth entries response");
        }
        return { id: entry.id, date: entry.date, weight_grams: entry.weight_grams, length_cm: entry.length_cm };
    });
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

export function getMockGrowthEntries(id: string): GrowthEntry[] {
    try {
        const serialized = localStorage.getItem(GROWTH_STORAGE_KEY);
        const stored: unknown = serialized === null ? seedGrowth : JSON.parse(serialized);
        if (!isRecord(stored)) throw new Error("Invalid mock growth data");
        const entries = normalizeGrowthEntries(stored[id] ?? []);
        if (serialized === null) localStorage.setItem(GROWTH_STORAGE_KEY, JSON.stringify(seedGrowth));
        return entries;
    } catch {
        return seedGrowth[id] ?? [];
    }
}

export function getMockReptile(id: string): DetailedReptileDTO {
    const reptile = getMockReptiles().find((item) => item.id === id);
    if (!reptile) throw new Error("Reptile not found");

    return { ...reptile, feedings: getMockFeedingEntries(id), growth: getMockGrowthEntries(id) };
}

const FEEDING_STORAGE_KEY = "reptilr.mock-feedings.v1";

function getMockFeedings(): Record<string, import("../types").FeedingEntry[]> {
    try {
        const serialized = localStorage.getItem(FEEDING_STORAGE_KEY);
        return serialized ? JSON.parse(serialized) as Record<string, import("../types").FeedingEntry[]> : {};
    } catch {
        return {};
    }
}

export function getMockFeedingEntries(reptileId: string) {
    return getMockFeedings()[reptileId] ?? [];
}

export function saveMockFeeding(reptileId: string, entry: import("../types").FeedingEntry) {
    const feedings = getMockFeedings();
    feedings[reptileId] = [...(feedings[reptileId] ?? []).filter((item) => item.id !== entry.id), entry].sort((a, b) => b.date.localeCompare(a.date));
    localStorage.setItem(FEEDING_STORAGE_KEY, JSON.stringify(feedings));
    return entry;
}

export function deleteMockFeeding(reptileId: string, id: string) {
    const feedings = getMockFeedings();
    feedings[reptileId] = (feedings[reptileId] ?? []).filter((item) => item.id !== id);
    localStorage.setItem(FEEDING_STORAGE_KEY, JSON.stringify(feedings));
}
