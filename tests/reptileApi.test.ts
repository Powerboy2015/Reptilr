import { beforeEach, describe, expect, it, vi } from "vitest";
import { SnakeFood, type DetailedReptileDTO, type ReptileDTO } from "../src/types";

const invoke = vi.hoisted(() => vi.fn());
vi.mock("@tauri-apps/api/core", () => ({ invoke }));

const reptile: ReptileDTO = {
    id: "r1",
    name: "Noodle",
    birth_date: "2020-05-12",
};

const detailedReptile: DetailedReptileDTO = {
    ...reptile,
    feedings: [{
        date: "2024-05-01",
        foodType: SnakeFood.SM_PINKY,
        amount: 1,
        powdered: true,
        powderType: "vitamins",
    }],
};

const loadApi = () => import("../src/helpers/reptileApi");

describe("reptile API", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubGlobal("fetch", vi.fn());
        Reflect.deleteProperty(window, "__TAURI_INTERNALS__");
        invoke.mockReset();
    });

    it("loads the reptile list over HTTP in browser development", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => [reptile],
        } as Response);

        await expect((await loadApi()).getReptiles()).resolves.toEqual([reptile]);
        expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe("/api/reptiles");
    });

    it("creates a reptile over HTTP with the submitted fields", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => reptile,
        } as Response);

        await expect((await loadApi()).addReptile("Noodle", "2020-05-12")).resolves.toEqual(reptile);
        expect(fetch).toHaveBeenCalledWith("/api/reptiles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Noodle", birth_date: "2020-05-12" }),
        });
    });

    it("loads one reptile over HTTP with an encoded ID", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => detailedReptile,
        } as Response);

        await expect((await loadApi()).getReptile("r/1")).resolves.toEqual(detailedReptile);
        expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe("/api/reptiles/r%2F1");
    });

    it("rejects unsuccessful HTTP responses", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false, status: 404 } as Response);

        await expect((await loadApi()).getReptiles()).rejects.toThrow("Request failed (404)");
    });

    it("uses Tauri commands for list and create calls", async () => {
        Object.defineProperty(window, "__TAURI_INTERNALS__", { value: {}, configurable: true });
        invoke.mockResolvedValueOnce([reptile]).mockResolvedValueOnce(reptile);
        const api = await loadApi();

        await expect(api.getReptiles()).resolves.toEqual([reptile]);
        await expect(api.addReptile("Noodle", "2020-05-12")).resolves.toEqual(reptile);
        expect(invoke).toHaveBeenNthCalledWith(1, "get_reptile_list");
        expect(invoke).toHaveBeenNthCalledWith(2, "add_reptile", {
            req: { name: "Noodle", birth_date: "2020-05-12" },
        });
        expect(fetch).not.toHaveBeenCalled();
    });

    it("returns the desktop detail mock for the requested reptile ID", async () => {
        Object.defineProperty(window, "__TAURI_INTERNALS__", { value: {}, configurable: true });

        await expect((await loadApi()).getReptile("r2")).resolves.toEqual({
            id: "r2",
            name: "joseph",
            birth_date: "1985-10-10",
            feedings: [{
                date: "1920-10-10",
                foodType: SnakeFood.SM_PINKY,
                amount: 1,
                powdered: true,
                powderType: "vitamins",
            }],
        });
        expect(invoke).not.toHaveBeenCalled();
    });
});
