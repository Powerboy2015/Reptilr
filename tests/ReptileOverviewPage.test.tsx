import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetailedReptile from "../src/core/entities/DetailedReptile";
import { DetailedReptileContext } from "../src/context/SelectedReptileContext";
import ReptileOverviewPage from "../src/pages/Reptile/ReptileOverviewPage";
import { SnakeFood, type FeedingEntry, type GrowthEntry } from "../src/types";

const feedings: FeedingEntry[] = [];

function renderOverview(growth: GrowthEntry[] = [], reptileFeedings = feedings) {
    const reptile = new DetailedReptile({
        id: "r1",
        name: "Noodle",
        birth_date: "2020-05-12",
        species: "Ball python",
        weight_grams: 120,
        length_cm: 40,
        last_shed: "2026-10-02",
        feedings: reptileFeedings,
        growth,
    });

    return render(
        <MemoryRouter initialEntries={["/reptile/r1"]}>
            <DetailedReptileContext.Provider value={reptile}>
                <Routes>
                    <Route path="/reptile/:reptileID" element={<ReptileOverviewPage />} />
                    <Route path="/reptile/:reptileID/feedings" element={<p>Feeding log</p>} />
                </Routes>
            </DetailedReptileContext.Provider>
        </MemoryRouter>,
    );
}

afterEach(cleanup);

describe("reptile overview", () => {
    it("shows the saved profile fields and empty states", () => {
        renderOverview();

        expect(screen.getByRole("heading", { name: "Noodle" })).toBeTruthy();
        expect(screen.getByText("Ball python")).toBeTruthy();
        expect(screen.getByText("120 g")).toBeTruthy();
        expect(screen.getByText("40 cm")).toBeTruthy();
        expect(screen.getByText("October 2, 2026")).toBeTruthy();
        expect(screen.getByText("No weight or length entries recorded yet.")).toBeTruthy();
        expect(screen.getByText("No feedings recorded yet. Add the first entry in the feeding log.")).toBeTruthy();
        expect(screen.getByRole("link", { name: "View feeding log" }).getAttribute("href")).toBe("/reptile/r1/feedings");
    });

    it("lists the newest weight and length measurements first", () => {
        renderOverview([
            { id: "older", date: "2026-08-02", weight_grams: 110, length_cm: 38 },
            { id: "newer", date: "2026-10-02", weight_grams: 120, length_cm: 40 },
        ]);

        const table = screen.getByRole("table");
        const rows = within(table).getAllByRole("row");
        expect(rows).toHaveLength(3);
        expect(rows[1].textContent).toContain("October 2, 2026");
        expect(rows[1].textContent).toContain("120 g");
        expect(rows[1].textContent).toContain("40 cm");
        expect(rows[2].textContent).toContain("August 2, 2026");
    });

    it("shows the newest feeding when feeding data exists", () => {
        renderOverview([], [
            { date: "2026-10-01", foodType: SnakeFood.SM_PINKY, amount: 1, powdered: false, powderType: "" },
            { date: "2026-11-01", foodType: SnakeFood.FUZZY, amount: 2, powdered: true, powderType: "vitamin" },
        ]);

        expect(screen.getByText("2 × Fuzzy")).toBeTruthy();
        expect(screen.getByText("Supplement: vitamin")).toBeTruthy();
        expect(screen.queryByText("No feedings recorded yet. Add the first entry in the feeding log.")).toBeNull();
    });
});
