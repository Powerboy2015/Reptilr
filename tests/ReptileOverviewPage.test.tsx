import { cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetailedReptile from "../src/core/entities/DetailedReptile";
import { DetailedReptileContext } from "../src/context/SelectedReptileContext";
import ReptileOverviewPage from "../src/pages/Reptile/ReptileOverviewPage";
import { SnakeFood, type FeedingEntry, type GrowthEntry } from "../src/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

const updateReptileMock = vi.hoisted(() => vi.fn());
vi.mock("../src/helpers/reptileApi", () => ({ updateReptile: updateReptileMock }));

function renderOverview(growth: GrowthEntry[] = [], feedings: FeedingEntry[] = []) {
    const reptile = new DetailedReptile({
        id: "r1",
        name: "Noodle",
        birth_date: "2020-05-12",
        species: "Ball python",
        weight_grams: 120,
        length_cm: 40,
        last_shed: "2026-10-02",
        feedings,
        growth,
    });

    return render(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter initialEntries={["/reptile/r1"]}>
            <DetailedReptileContext.Provider value={reptile}>
                <Routes>
                    <Route path="/reptile/:reptileID" element={<ReptileOverviewPage />} />
                    <Route path="/reptile/:reptileID/feedings" element={<p>Feeding log</p>} />
                    <Route path="/reptile/:reptileID/stats" element={<p>Growth log</p>} />
                </Routes>
            </DetailedReptileContext.Provider>
        </MemoryRouter></QueryClientProvider>,
    );
}

afterEach(cleanup);

describe("reptile overview", () => {
    it("shows profile details and direct actions for empty histories", () => {
        renderOverview();

        expect(screen.getByRole("heading", { name: "Noodle" })).toBeTruthy();
        expect(screen.getByText("Ball python")).toBeTruthy();
        expect(screen.getByText("May 12, 2020")).toBeTruthy();
        expect(screen.getByText(/(?:Under 1 year|\d+ years?)/)).toBeTruthy();
        expect(screen.getByText("120 g")).toBeTruthy();
        expect(screen.getByText("40 cm")).toBeTruthy();
        expect(screen.getByText("October 2, 2026")).toBeTruthy();
        expect(screen.getByText("No weight or length entries recorded yet.")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Record a measurement" }).getAttribute("href")).toBe("/reptile/r1/stats");
        expect(screen.getByText("No feedings recorded yet.")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Record the first feeding" }).getAttribute("href")).toBe("/reptile/r1/feedings");
        expect(screen.getByRole("link", { name: "View feeding log" }).getAttribute("href")).toBe("/reptile/r1/feedings");
    });

    it("lists the newest weight and length measurements first", () => {
        renderOverview([
            { id: "older", date: "2026-08-02", weight_grams: 110, length_cm: 38 },
            { id: "newer", date: "2026-10-02", weight_grams: 120, length_cm: 40 },
        ]);

        const list = screen.getByRole("list");
        const rows = within(list).getAllByRole("listitem");
        expect(rows).toHaveLength(2);
        expect(rows[0].textContent).toContain("October 2, 2026");
        expect(rows[0].textContent).toContain("120 g · 40 cm");
        expect(rows[1].textContent).toContain("August 2, 2026");
    });

    it("shows the newest feeding when feeding data exists", () => {
        renderOverview([], [
            { date: "2026-10-01", foodType: SnakeFood.SM_PINKY, amount: 1, powdered: false, powderType: "" },
            { date: "2026-11-01", foodType: SnakeFood.FUZZY, amount: 2, powdered: true, powderType: "vitamin" },
        ]);

        expect(screen.getByText("2 × Fuzzy")).toBeTruthy();
        expect(screen.getByText("Supplement: vitamin")).toBeTruthy();
        expect(screen.queryByText("No feedings recorded yet.")).toBeNull();
    });

    it("saves edited profile details and reports storage failures", async () => {
        localStorage.clear();
        updateReptileMock.mockImplementation(async (id, profile) => ({ id, ...profile }));
        renderOverview();
        fireEvent.click(screen.getByRole("button", { name: "Edit profile" }));
        fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Noodle updated" } });
        fireEvent.change(screen.getByLabelText("Last shed"), { target: { value: "Early October" } });
        fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
        await waitFor(() => expect(screen.queryByLabelText("Name")).toBeNull());
        expect(updateReptileMock).toHaveBeenCalledWith("r1", expect.objectContaining({ name: "Noodle updated", last_shed: "Early October" }));

        cleanup();
        updateReptileMock.mockRejectedValueOnce(new Error("Corrupt mock storage"));
        renderOverview();
        fireEvent.click(screen.getByRole("button", { name: "Edit profile" }));
        fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
        expect((await screen.findByRole("alert")).textContent).toContain("Could not save this profile");
        expect(localStorage.getItem("reptilr.mock-reptiles.v1")).toBeNull();
    });
});
