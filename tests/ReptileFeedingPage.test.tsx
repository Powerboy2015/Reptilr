import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DetailedReptile from "../src/core/entities/DetailedReptile";
import { DetailedReptileContext } from "../src/context/SelectedReptileContext";
import ReptileFeedingPage from "../src/pages/Reptile/ReptileFeedingPage";
import { SnakeFood, type FeedingEntry } from "../src/types";
import { removeFeeding, saveFeeding } from "../src/helpers/reptileApi";

vi.mock("../src/helpers/reptileApi", () => ({ removeFeeding: vi.fn(), saveFeeding: vi.fn() }));

const initial: FeedingEntry = { id: "f1", date: "2026-11-01", foodType: SnakeFood.FUZZY, amount: 1, powdered: false, powderType: "" };
const reptile = new DetailedReptile({ id: "r1", name: "Noodle", birth_date: "", species: "Ball python", weight_grams: 0, length_cm: 0, last_shed: "", feedings: [initial], growth: [] });

function renderPage(feedings = [initial]) {
    const selected = new DetailedReptile({ ...reptile, feedings });
    return render(<DetailedReptileContext.Provider value={selected}><ReptileFeedingPage /></DetailedReptileContext.Provider>);
}

describe("feeding page", () => {
    beforeEach(() => { cleanup(); vi.clearAllMocks(); });

    it("shows feeding history and recent-versus-prior trend counts", () => {
        const recent = { ...initial, id: "f2", date: new Date().toISOString().slice(0, 10) };
        renderPage([initial, recent]);
        expect(screen.getByRole("heading", { name: "Previous feedings" })).toBeTruthy();
        expect(screen.getByText("Eating pattern")).toBeTruthy();
        expect(screen.getByText("2", { selector: "p" })).toBeTruthy();
    });

    it("creates and edits feeding records", async () => {
        const created = { ...initial, id: "f2" };
        vi.mocked(saveFeeding).mockResolvedValue(created);
        renderPage([]);
        fireEvent.click(screen.getAllByRole("button", { name: "Add feeding" })[0]);
        await waitFor(() => expect(screen.getByText("1 × Fuzzy")).toBeTruthy());
        fireEvent.click(screen.getByRole("button", { name: /Edit feeding/ }));
        fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "2" } });
        fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
        await waitFor(() => expect(saveFeeding).toHaveBeenLastCalledWith("r1", expect.objectContaining({ amount: 2 }), "f2"));
    });

    it("deletes a record and exposes persistence errors", async () => {
        vi.mocked(removeFeeding).mockRejectedValueOnce(new Error("offline"));
        renderPage();
        fireEvent.click(screen.getByRole("button", { name: /Delete feeding/ }));
        expect((await screen.findByRole("alert")).textContent).toContain("Could not delete this feeding");
    });
});
