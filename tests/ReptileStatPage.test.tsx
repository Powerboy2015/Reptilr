import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    return render(<DetailedReptileContext.Provider value={selected}><ReptileStatPage /></DetailedReptileContext.Provider>);
}

describe("growth page", () => {
    beforeEach(() => { cleanup(); vi.clearAllMocks(); });

    it("shows the latest measurement and dated history", () => {
        renderPage();
        expect(screen.getByRole("heading", { name: "Noodle's size and weight" })).toBeTruthy();
        expect(screen.getByText("118")).toBeTruthy();
        expect(screen.getByText((_, element) => element?.textContent === "118 g · 39 cm")).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Measurement history" })).toBeTruthy();
    });

    it("shows the selected reptile's history after switching reptiles", async () => {
        const view = renderPage();
        const other = new DetailedReptile({ ...reptile, id: "r2", name: "Saffron", growth: [{ id: "g2", date: "2026-11-01", weight_grams: 82, length_cm: 31 }] });
        view.rerender(<DetailedReptileContext.Provider value={other}><ReptileStatPage /></DetailedReptileContext.Provider>);

        await waitFor(() => expect(screen.getByText("82 g · 31 cm")).toBeTruthy());
        expect(screen.queryByText("118 g · 39 cm")).toBeNull();
    });

    it("creates and edits growth measurements", async () => {
        const created: GrowthEntry = { ...first, id: "g2", date: "2026-11-10", weight_grams: 125, length_cm: 41 };
        vi.mocked(saveGrowthEntry).mockResolvedValueOnce(created).mockResolvedValueOnce({ ...created, weight_grams: 130 });
        renderPage([]);
        expect(screen.getByText(/No measurements recorded yet/)).toBeTruthy();
        fireEvent.change(screen.getByLabelText("Weight (g)"), { target: { value: "125" } });
        fireEvent.change(screen.getByLabelText("Length (cm)"), { target: { value: "41" } });
        fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-11-10" } });
        fireEvent.click(screen.getByRole("button", { name: "Add measurement" }));
        await waitFor(() => expect(screen.getByText("125 g · 41 cm")).toBeTruthy());
        fireEvent.click(screen.getByRole("button", { name: /Edit measurement/ }));
        fireEvent.change(screen.getByLabelText("Weight (g)"), { target: { value: "130" } });
        fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
        await waitFor(() => expect(screen.getByText("130 g · 41 cm")).toBeTruthy());
    });

    it("keeps empty state and reports save/delete errors", async () => {
        vi.mocked(saveGrowthEntry).mockRejectedValueOnce(new Error("offline"));
        renderPage([]);
        fireEvent.change(screen.getByLabelText("Weight (g)"), { target: { value: "125" } });
        fireEvent.change(screen.getByLabelText("Length (cm)"), { target: { value: "41" } });
        fireEvent.click(screen.getByRole("button", { name: "Add measurement" }));
        expect((await screen.findByRole("alert")).textContent).toContain("Could not save this measurement");

        cleanup();
        vi.mocked(removeGrowthEntry).mockRejectedValueOnce(new Error("offline"));
        renderPage();
        fireEvent.click(screen.getByRole("button", { name: /Delete measurement/ }));
        expect((await screen.findByRole("alert")).textContent).toContain("Could not delete this measurement");
    });
});
