import { beforeEach, describe, expect, it, vi } from "vitest";
import { type AddReptileInput, type ReptileDTO } from "../src/types";

const invoke = vi.hoisted(() => vi.fn());
vi.mock("@tauri-apps/api/core", () => ({ invoke }));

const reptile: ReptileDTO = {
    id: "r1",
    name: "Noodle",
    birth_date: "2020-05-12",
    species: "Ball python",
    weight_grams: 0,
    length_cm: 0,
    last_shed: "",
};

const addReptileInput: AddReptileInput = {
    name: "Noodle",
    species: "Ball python",
    birth_date: "2020-05-12",
    weight_grams: 120,
    length_cm: 40,
    last_shed: "2026-08-30",
};

const loadApi = () => import("../src/helpers/reptileApi");

function useBrowserRuntime() {
    Reflect.deleteProperty(window, "__TAURI_INTERNALS__");
}

function useTauriRuntime() {
    Object.defineProperty(window, "__TAURI_INTERNALS__", { value: {}, configurable: true });
}

describe("reptile API", () => {
    beforeEach(() => {
        vi.resetModules();
        localStorage.clear();
        vi.stubGlobal("fetch", vi.fn());
        useBrowserRuntime();
        invoke.mockReset();
    });

    it("loads mock reptiles in the browser without a backend", async () => {
        const api = await loadApi();

        await expect(api.getReptiles()).resolves.toEqual([expect.objectContaining({
            id: "demo-ball-python",
            name: "Noodle",
            species: "Ball python",
        })]);
        expect(fetch).not.toHaveBeenCalled();
        expect(invoke).not.toHaveBeenCalled();
    });

    it("creates a mock reptile and makes it available to list and detail views", async () => {
        const api = await loadApi();

        const created = await api.addReptile(addReptileInput);

        expect(created).toMatchObject({
            name: "Noodle",
            species: "Ball python",
            birth_date: "2020-05-12",
            weight_grams: 120,
            length_cm: 40,
            last_shed: "2026-08-30",
        });
        await expect(api.getReptiles()).resolves.toContainEqual(created);
        await expect(api.getReptile(created.id)).resolves.toMatchObject({ ...created, feedings: [] });

        vi.resetModules();
        const reloadedApi = await loadApi();
        await expect(reloadedApi.getReptiles()).resolves.toContainEqual(created);
        expect(fetch).not.toHaveBeenCalled();
        expect(invoke).not.toHaveBeenCalled();
    });

    it("uses the Tauri bridge for list and create and normalizes older reptile rows", async () => {
        useTauriRuntime();
        invoke.mockResolvedValueOnce([{ id: "r1", name: "Noodle", birth_date: "2020-05-12" }])
            .mockResolvedValueOnce({ id: "r2", name: "Saffron", birth_date: "2022-08-20" });
        const api = await loadApi();

        await expect(api.getReptiles()).resolves.toEqual([{ ...reptile, species: "" }]);
        await expect(api.addReptile({ name: "Saffron", species: "Corn snake" })).resolves.toEqual({
            id: "r2",
            name: "Saffron",
            birth_date: "2022-08-20",
            species: "",
            weight_grams: 0,
            length_cm: 0,
            last_shed: "",
        });
        expect(invoke).toHaveBeenNthCalledWith(1, "get_reptile_list");
        expect(invoke).toHaveBeenNthCalledWith(2, "add_reptile", {
            req: { name: "Saffron", species: "Corn snake" },
        });
        expect(fetch).not.toHaveBeenCalled();
    });

    it("rejects a reptile detail request for an unknown browser mock ID", async () => {
        const api = await loadApi();

        await expect(api.getReptile("missing")).rejects.toThrow("Reptile not found");
    });

    it("returns the existing desktop detail data for the requested ID", async () => {
        useTauriRuntime();
        const api = await loadApi();

        await expect(api.getReptile("r2")).resolves.toEqual({
            id: "r2",
            name: "joseph",
            birth_date: "1985-10-10",
            feedings: [{ date: "1920-10-10", foodType: "Small pinky", amount: 1, powdered: true, powderType: "vitamins" }],
        });
        expect(invoke).not.toHaveBeenCalled();
    });
});
