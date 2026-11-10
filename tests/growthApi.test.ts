import { beforeEach, describe, expect, it, vi } from "vitest";

const invoke = vi.hoisted(() => vi.fn());
vi.mock("@tauri-apps/api/core", () => ({ invoke }));

const loadApi = () => import("../src/helpers/reptileApi");
const measurement = { date: "2026-11-10", weight_grams: 125, length_cm: 41 };

function useBrowserRuntime() {
    Reflect.deleteProperty(window, "__TAURI_INTERNALS__");
}

function useTauriRuntime() {
    Object.defineProperty(window, "__TAURI_INTERNALS__", { value: {}, configurable: true });
}

describe("growth API", () => {
    beforeEach(() => {
        vi.resetModules();
        localStorage.clear();
        invoke.mockReset();
        useBrowserRuntime();
    });

    it("creates, updates, lists, and deletes browser measurements", async () => {
        const api = await loadApi();
        const created = await api.saveGrowthEntry("demo-ball-python", measurement);
        expect(created).toMatchObject({ ...measurement, id: expect.any(String) });
        await expect(api.getGrowthEntries("demo-ball-python")).resolves.toContainEqual(created);

        const updated = await api.saveGrowthEntry("demo-ball-python", { ...measurement, weight_grams: 130 }, created.id);
        expect(updated).toMatchObject({ ...measurement, weight_grams: 130, id: created.id });
        await expect(api.getGrowthEntries("demo-ball-python")).resolves.toContainEqual(updated);

        await api.removeGrowthEntry("demo-ball-python", created.id);
        await expect(api.getGrowthEntries("demo-ball-python")).resolves.not.toContainEqual(updated);
        expect(invoke).not.toHaveBeenCalled();
    });

    it("maps measurement CRUD to Tauri commands and rejects invalid responses", async () => {
        useTauriRuntime();
        const entry = { ...measurement, id: "g1" };
        invoke.mockResolvedValueOnce(entry).mockResolvedValueOnce(entry).mockResolvedValueOnce(undefined).mockResolvedValueOnce({ id: "bad" });
        const api = await loadApi();

        await expect(api.saveGrowthEntry("r1", measurement)).resolves.toEqual(entry);
        await expect(api.saveGrowthEntry("r1", measurement, "g1")).resolves.toEqual(entry);
        await expect(api.removeGrowthEntry("r1", "g1")).resolves.toBeUndefined();
        await expect(api.saveGrowthEntry("r1", measurement)).rejects.toThrow("Invalid growth entries response");
        expect(invoke).toHaveBeenNthCalledWith(1, "add_growth_entry", { reptileId: "r1", req: measurement });
        expect(invoke).toHaveBeenNthCalledWith(2, "update_growth_entry", { reptileId: "r1", req: { ...measurement, id: "g1" } });
        expect(invoke).toHaveBeenNthCalledWith(3, "delete_growth_entry", { reptileId: "r1", id: "g1" });
    });
});
