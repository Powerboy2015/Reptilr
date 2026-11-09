import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { DetailedReptileDTO, ReptileDTO } from "../src/types";
import useAddReptile from "../src/hooks/useAddReptile";
import useReptileData from "../src/hooks/useReptileData";
import useReptiles from "../src/hooks/useReptiles";

const { addReptile, getReptile, getReptiles } = vi.hoisted(() => ({
    addReptile: vi.fn(),
    getReptile: vi.fn(),
    getReptiles: vi.fn(),
}));

vi.mock("../src/helpers/reptileApi", () => ({ addReptile, getReptile, getReptiles }));

const reptile: ReptileDTO = { id: "r1", name: "Noodle", birth_date: "2020-05-12" };
const newReptile: ReptileDTO = { id: "r2", name: "Saffron", birth_date: "2022-08-20" };
const detailedReptile: DetailedReptileDTO = { ...reptile, feedings: [] };

function createHarness() {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    return { client, wrapper };
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe("reptile data hooks", () => {
    it("returns list records as Reptile entities", async () => {
        getReptiles.mockResolvedValue([reptile]);
        const { wrapper } = createHarness();
        const { result } = renderHook(() => useReptiles(), { wrapper });

        await waitFor(() => expect(result.current.data?.[0]?.name).toBe("Noodle"));
        expect(result.current.data?.[0]?.id).toBe("r1");
    });

    it("returns one record with its feeding data", async () => {
        getReptile.mockResolvedValue(detailedReptile);
        const { wrapper } = createHarness();
        const { result } = renderHook(() => useReptileData("r1"), { wrapper });

        await waitFor(() => expect(result.current.data?.id).toBe("r1"));
        expect(result.current.data?.feedings).toEqual([]);
    });

    it("exposes detail request failures", async () => {
        getReptile.mockRejectedValue(new Error("missing"));
        const { wrapper } = createHarness();
        const { result } = renderHook(() => useReptileData("unknown"), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe("missing");
    });

    it("creates a reptile and refreshes the cached list", async () => {
        getReptiles.mockResolvedValueOnce([reptile]).mockResolvedValueOnce([reptile, newReptile]);
        addReptile.mockResolvedValue(newReptile);
        const { wrapper } = createHarness();
        const { result: list } = renderHook(() => useReptiles(), { wrapper });
        const { result: create } = renderHook(() => useAddReptile(), { wrapper });

        await waitFor(() => expect(list.current.data).toHaveLength(1));
        await create.current.mutateAsync({ name: "Saffron", birth_date: "2022-08-20" });
        await waitFor(() => expect(list.current.data).toHaveLength(2));
        expect(list.current.data?.map((item) => item.name)).toEqual(["Noodle", "Saffron"]);
    });

    it("exposes list request failures", async () => {
        getReptiles.mockRejectedValue(new Error("offline"));
        const { wrapper } = createHarness();
        const { result } = renderHook(() => useReptiles(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe("offline");
    });

    it("exposes create failures", async () => {
        addReptile.mockRejectedValue(new Error("offline"));
        const { wrapper } = createHarness();
        const { result } = renderHook(() => useAddReptile(), { wrapper });

        await expect(result.current.mutateAsync({ name: "Saffron", birth_date: "2022-08-20" }))
            .rejects.toThrow("offline");
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(getReptiles).not.toHaveBeenCalled();
    });
});
