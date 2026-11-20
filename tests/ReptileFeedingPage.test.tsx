import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
    return render(<QueryClientProvider client={new QueryClient()}><DetailedReptileContext.Provider value={selected}><ReptileFeedingPage /></DetailedReptileContext.Provider></QueryClientProvider>);
}

describe("feeding page", () => {
    beforeEach(() => { cleanup(); vi.clearAllMocks(); });

    it("shows feeding history and recent-versus-prior trend counts", () => {
        const recent = { ...initial, id: "f2", date: new Date().toISOString().slice(0, 10) };
        renderPage([initial, recent]);
        expect(screen.queryByLabelText("Amount")).toBeNull();
        expect(screen.getByRole("heading", { name: "Feeding history" })).toBeTruthy();
        expect(screen.getByRole("list").classList.contains("divide-[#515151]")).toBe(true);
        expect(screen.getByRole("list").classList.contains("border-[#89CFF0]")).toBe(true);
        expect(screen.getByText("Eating pattern")).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Feeding history" }).compareDocumentPosition(screen.getByRole("heading", { name: "Eating pattern" })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(screen.getByText("2", { selector: "p" })).toBeTruthy();
    });

    it("refreshes the trend windows when the local day changes while foregrounded", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-11-18T12:00:00"));
        renderPage([{ ...initial, date: "2026-10-20" }]);
        const counts = () => Array.from(screen.getByRole("group", { name: "Feeding frequency comparison" }).querySelectorAll("div > p:nth-child(2)"), (node) => node.textContent);
        try {
            expect(counts()).toEqual(["1 meals", "0 meals"]);
            vi.setSystemTime(new Date("2026-11-19T12:00:00"));
            fireEvent.focus(window);
            expect(counts()).toEqual(["0 meals", "1 meals"]);
        } finally { vi.useRealTimers(); }
    });

    it("opens and cancels the form, then creates and edits feeding records", async () => {
        const created = { ...initial, id: "f2" };
        vi.mocked(saveFeeding).mockResolvedValueOnce(created).mockResolvedValueOnce({ ...created, amount: 2 });
        renderPage([]);
        fireEvent.click(screen.getByRole("button", { name: "Add feeding entry" }));
        const addDialog = await screen.findByRole("dialog", { name: "Add feeding entry" });
        expect(within(addDialog).getByLabelText("Amount").classList.contains("border-[#515151]")).toBe(true);
        fireEvent.change(within(addDialog).getByLabelText("Amount"), { target: { value: "3" } });
        fireEvent.click(within(addDialog).getByRole("button", { name: "Cancel" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(screen.queryByLabelText("Amount")).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Add feeding entry" }));
        const dialog = await screen.findByRole("dialog", { name: "Add feeding entry" });
        expect(within(dialog).getByLabelText("Amount")).toHaveProperty("value", "1");
        fireEvent.click(within(dialog).getByRole("button", { name: "Add feeding entry" }));
        await waitFor(() => expect(screen.getByText("1 × Fuzzy")).toBeTruthy());
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        fireEvent.click(screen.getByRole("button", { name: /Edit feeding/ }));
        const editDialog = await screen.findByRole("dialog", { name: "Edit feeding" });
        expect(within(editDialog).getByLabelText("Amount")).toHaveProperty("value", "1");
        fireEvent.change(within(editDialog).getByLabelText("Amount"), { target: { value: "2" } });
        fireEvent.click(within(editDialog).getByRole("button", { name: "Save changes" }));
        await waitFor(() => expect(saveFeeding).toHaveBeenLastCalledWith("r1", expect.objectContaining({ amount: 2 }), "f2"));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });

    it("keeps entered values and an error visible when saving fails", async () => {
        vi.mocked(saveFeeding).mockRejectedValueOnce(new Error("offline"));
        renderPage([]);
        fireEvent.click(screen.getByRole("button", { name: "Add feeding entry" }));
        const dialog = await screen.findByRole("dialog", { name: "Add feeding entry" });
        fireEvent.change(within(dialog).getByLabelText("Amount"), { target: { value: "4" } });
        fireEvent.click(within(dialog).getByRole("button", { name: "Add feeding entry" }));
        expect((await within(dialog).findByRole("alert")).textContent).toContain("Could not save this feeding");
        expect(within(dialog).getByLabelText("Amount")).toHaveProperty("value", "4");
    });

    it("deletes a record and exposes persistence errors", async () => {
        vi.mocked(removeFeeding).mockRejectedValueOnce(new Error("offline"));
        renderPage();
        fireEvent.click(screen.getByRole("button", { name: /Delete feeding/ }));
        expect((await screen.findByRole("alert")).textContent).toContain("Could not delete this feeding");
    });
});

describe("feeding save feedback", () => {
    beforeEach(() => { cleanup(); vi.clearAllMocks(); });

    it("announces a save in progress and then shows the saved meal", async () => {
        let finishSave: ((entry: FeedingEntry) => void) | undefined;
        vi.mocked(saveFeeding).mockImplementationOnce(() => new Promise<FeedingEntry>((resolve) => { finishSave = resolve; }));
        renderPage([]);

        fireEvent.click(screen.getByRole("button", { name: "Add feeding entry" }));
        const dialog = await screen.findByRole("dialog", { name: "Add feeding entry" });
        fireEvent.click(within(dialog).getByRole("button", { name: "Add feeding entry" }));
        expect(within(dialog).getByRole("status").textContent).toBe("Saving feeding…");
        expect(within(dialog).getByRole("button", { name: "Cancel" }).hasAttribute("disabled")).toBe(true);
        fireEvent.keyDown(dialog, { key: "Escape" });
        expect(screen.getByRole("dialog", { name: "Add feeding entry" })).toBeTruthy();
        finishSave?.({ ...initial, id: "f2" });
        expect(await screen.findByText("1 × Fuzzy")).toBeTruthy();
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });
});
