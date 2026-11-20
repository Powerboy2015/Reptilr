import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DetailedReptile from "../src/core/entities/DetailedReptile";
import { DetailedReptileContext } from "../src/context/SelectedReptileContext";
import ReptileStatPage from "../src/pages/Reptile/ReptileStatPage";
import type { GrowthEntry } from "../src/types";
import { removeGrowthEntry, saveGrowthEntry } from "../src/helpers/reptileApi";

vi.mock("../src/helpers/reptileApi", () => ({ removeGrowthEntry: vi.fn(), saveGrowthEntry: vi.fn() }));

const first: GrowthEntry = { id: "g1", date: "2026-10-01", weight_grams: 118, length_cm: 39 };
const reptile = new DetailedReptile({ id: "r1", name: "Noodle", birth_date: "", species: "Ball python", weight_grams: 0, length_cm: 0, last_shed: "", feedings: [], growth: [first] });

function renderPage(growth = [first]) {
    const selected = new DetailedReptile({ ...reptile, growth });
    return render(<QueryClientProvider client={new QueryClient()}><DetailedReptileContext.Provider value={selected}><ReptileStatPage /></DetailedReptileContext.Provider></QueryClientProvider>);
}

describe("growth page", () => {
    beforeEach(() => { cleanup(); vi.clearAllMocks(); });

    it("shows the latest measurement and dated history", () => {
        renderPage();
        expect(screen.getByRole("heading", { name: "Growth" })).toBeTruthy();
        expect(screen.queryByLabelText("Weight (g)")).toBeNull();
        expect(screen.getByText("118 g")).toBeTruthy();
        expect(screen.getByText((_, element) => element?.textContent === "118 g · 39 cm")).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Measurement history" })).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Measurement history" }).compareDocumentPosition(screen.getByRole("heading", { name: "Latest measurement" })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("shows the selected reptile's history after switching reptiles", async () => {
        const view = renderPage();
        const other = new DetailedReptile({ ...reptile, id: "r2", name: "Saffron", growth: [{ id: "g2", date: "2026-11-01", weight_grams: 82, length_cm: 31 }] });
        view.rerender(<QueryClientProvider client={new QueryClient()}><DetailedReptileContext.Provider value={other}><ReptileStatPage /></DetailedReptileContext.Provider></QueryClientProvider>);

        await waitFor(() => expect(screen.getByText("82 g · 31 cm")).toBeTruthy());
        expect(screen.queryByText("118 g · 39 cm")).toBeNull();
    });

    it("opens and cancels the form, then creates and edits growth measurements", async () => {
        const created: GrowthEntry = { ...first, id: "g2", date: "2026-11-10", weight_grams: 125, length_cm: 41 };
        vi.mocked(saveGrowthEntry).mockResolvedValueOnce(created).mockResolvedValueOnce({ ...created, weight_grams: 130 });
        renderPage([]);
        expect(screen.getByText(/No measurements recorded yet/)).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Add weight entry" }));
        const addDialog = await screen.findByRole("dialog", { name: "Add weight entry" });
        fireEvent.change(within(addDialog).getByLabelText("Weight (g)"), { target: { value: "999" } });
        fireEvent.click(within(addDialog).getByRole("button", { name: "Cancel" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(screen.queryByLabelText("Weight (g)")).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Add weight entry" }));
        const dialog = await screen.findByRole("dialog", { name: "Add weight entry" });
        expect(within(dialog).getByLabelText("Weight (g)")).toHaveProperty("value", "");
        fireEvent.change(within(dialog).getByLabelText("Weight (g)"), { target: { value: "125" } });
        fireEvent.change(within(dialog).getByLabelText("Length (cm)"), { target: { value: "41" } });
        fireEvent.change(within(dialog).getByLabelText("Date"), { target: { value: "2026-11-10" } });
        fireEvent.click(within(dialog).getByRole("button", { name: "Add weight entry" }));
        await waitFor(() => expect(screen.getByText("125 g · 41 cm")).toBeTruthy());
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        fireEvent.click(screen.getByRole("button", { name: /Edit measurement/ }));
        const editDialog = await screen.findByRole("dialog", { name: "Edit measurement" });
        expect(within(editDialog).getByLabelText("Weight (g)")).toHaveProperty("value", "125");
        fireEvent.change(within(editDialog).getByLabelText("Weight (g)"), { target: { value: "130" } });
        fireEvent.click(within(editDialog).getByRole("button", { name: "Save changes" }));
        await waitFor(() => expect(screen.getByText("130 g · 41 cm")).toBeTruthy());
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });

    it("keeps empty state and reports save/delete errors", async () => {
        vi.mocked(saveGrowthEntry).mockRejectedValueOnce(new Error("offline"));
        renderPage([]);
        fireEvent.click(screen.getByRole("button", { name: "Add weight entry" }));
        const dialog = await screen.findByRole("dialog", { name: "Add weight entry" });
        fireEvent.change(within(dialog).getByLabelText("Weight (g)"), { target: { value: "125" } });
        fireEvent.change(within(dialog).getByLabelText("Length (cm)"), { target: { value: "41" } });
        fireEvent.click(within(dialog).getByRole("button", { name: "Add weight entry" }));
        expect((await within(dialog).findByRole("alert")).textContent).toContain("Could not save this measurement");
        expect(within(dialog).getByLabelText("Weight (g)")).toHaveProperty("value", "125");

        cleanup();
        vi.mocked(removeGrowthEntry).mockRejectedValueOnce(new Error("offline"));
        renderPage();
        fireEvent.click(screen.getByRole("button", { name: /Delete measurement/ }));
        expect((await screen.findByRole("alert")).textContent).toContain("Could not delete this measurement");
    });
});

describe("growth save feedback", () => {
    beforeEach(() => { cleanup(); vi.clearAllMocks(); });

    it("announces a save in progress and then shows the saved measurement", async () => {
        let finishSave: ((entry: GrowthEntry) => void) | undefined;
        const created = { ...first, id: "g2", date: "2026-11-10", weight_grams: 125, length_cm: 41 };
        vi.mocked(saveGrowthEntry).mockImplementationOnce(() => new Promise<GrowthEntry>((resolve) => { finishSave = resolve; }));
        renderPage([]);

        fireEvent.click(screen.getByRole("button", { name: "Add weight entry" }));
        const dialog = await screen.findByRole("dialog", { name: "Add weight entry" });
        fireEvent.change(within(dialog).getByLabelText("Weight (g)"), { target: { value: "125" } });
        fireEvent.change(within(dialog).getByLabelText("Length (cm)"), { target: { value: "41" } });
        fireEvent.click(within(dialog).getByRole("button", { name: "Add weight entry" }));
        expect(within(dialog).getByRole("status").textContent).toBe("Saving measurement…");
        expect(within(dialog).getByRole("button", { name: "Cancel" }).hasAttribute("disabled")).toBe(true);
        fireEvent.keyDown(dialog, { key: "Escape" });
        expect(screen.getByRole("dialog", { name: "Add weight entry" })).toBeTruthy();
        finishSave?.(created);
        expect(await screen.findByText("125 g · 41 cm")).toBeTruthy();
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });
});
