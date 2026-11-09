import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import Reptile from "../src/core/entities/Reptile";
import HomePage from "../src/pages/HomePage";

const { useReptiles, mutateAsync } = vi.hoisted(() => ({ useReptiles: vi.fn(), mutateAsync: vi.fn() }));

vi.mock("../src/hooks/useReptiles", () => ({ default: useReptiles }));
vi.mock("../src/hooks/useAddReptile", () => ({ default: () => ({ mutateAsync, isPending: false }) }));

function CurrentPath() {
    const location = useLocation();
    return <output aria-label="Current path">{location.pathname}</output>;
}

function renderHome() {
    return render(
        <MemoryRouter initialEntries={["/"]}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/reptile/:id" element={<CurrentPath />} />
            </Routes>
        </MemoryRouter>,
    );
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mutateAsync.mockResolvedValue(undefined);
});

describe("reptile list", () => {
    it("shows saved reptiles and opens the selected reptile", () => {
        useReptiles.mockReturnValue({
            data: [new Reptile({ id: "r1", name: "Noodle", birth_date: "2020-05-12", species: "Ball python", weight_grams: 0, length_cm: 0, last_shed: "" })],
            isLoading: false,
            isError: false,
        });

        renderHome();

        expect(screen.getByRole("heading", { name: "Your reptiles" })).toBeTruthy();
        expect(screen.getByText("1 reptile")).toBeTruthy();
        expect(screen.getByText("Ball python")).toBeTruthy();
        expect(screen.queryByText("sand boa")).toBeNull();
        expect(screen.queryByRole("textbox")).toBeNull();
        expect(screen.getByRole("button", { name: "Add reptile" })).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Open Noodle" }));
        expect(screen.getByLabelText("Current path").textContent).toBe("/reptile/r1");
    });

    it("shows a fallback for older reptile records without species", () => {
        useReptiles.mockReturnValue({
            data: [{ id: "legacy-1", name: "Old Noodle", birth_date: "2020-05-12" }],
            isLoading: false,
            isError: false,
        });

        renderHome();

        expect(screen.getByText("Species not recorded")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Open Old Noodle" })).toBeTruthy();
    });

    it("guides the user when the list is empty", () => {
        useReptiles.mockReturnValue({ data: [], isLoading: false, isError: false });

        renderHome();

        expect(screen.getByText("0 reptiles")).toBeTruthy();
        expect(screen.getByText("No reptiles yet.")).toBeTruthy();
        expect(screen.queryByRole("textbox")).toBeNull();
        expect(screen.getByRole("button", { name: "Add reptile" })).toBeTruthy();
    });

    it("opens the add dialog and saves the required and optional fields", async () => {
        useReptiles.mockReturnValue({ data: [], isLoading: false, isError: false });
        renderHome();

        fireEvent.click(screen.getByRole("button", { name: "Add reptile" }));
        const dialog = screen.getByRole("dialog", { name: "Add a reptile" });
        expect(within(dialog).getByLabelText(/Name/).getAttribute("required")).not.toBeNull();
        expect(within(dialog).getByLabelText(/Species/).getAttribute("required")).not.toBeNull();
        fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: "Noodle" } });
        fireEvent.change(within(dialog).getByLabelText(/Species/), { target: { value: "Ball python" } });
        fireEvent.change(within(dialog).getByLabelText(/Birthday/), { target: { value: "2020-05-12" } });
        fireEvent.change(within(dialog).getByLabelText(/Weight in grams/), { target: { value: "120" } });
        fireEvent.change(within(dialog).getByLabelText(/Length in cm/), { target: { value: "40" } });
        fireEvent.change(within(dialog).getByLabelText(/Last shed/), { target: { value: "2026-08-30" } });
        fireEvent.click(within(dialog).getByRole("button", { name: "Add reptile" }));

        await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
            name: "Noodle",
            species: "Ball python",
            birth_date: "2020-05-12",
            weight_grams: 120,
            length_cm: 40,
            last_shed: "2026-08-30",
        }));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });

    it("keeps the dialog open and reports a save failure", async () => {
        mutateAsync.mockRejectedValue(new Error("offline"));
        useReptiles.mockReturnValue({ data: [], isLoading: false, isError: false });
        renderHome();

        fireEvent.click(screen.getByRole("button", { name: "Add reptile" }));
        const dialog = screen.getByRole("dialog", { name: "Add a reptile" });
        fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: "Noodle" } });
        fireEvent.change(within(dialog).getByLabelText(/Species/), { target: { value: "Ball python" } });
        fireEvent.click(within(dialog).getByRole("button", { name: "Add reptile" }));

        expect((await within(dialog).findByRole("alert")).textContent).toContain("Couldn’t add this reptile");
        expect(screen.getByRole("dialog")).toBeTruthy();
    });

    it("shows loading and failure states", () => {
        useReptiles.mockReturnValue({ data: undefined, isLoading: true, isError: false });
        const { rerender } = renderHome();

        expect(screen.getByRole("status").textContent).toContain("Loading your reptiles");

        useReptiles.mockReturnValue({ data: undefined, isLoading: false, isError: true });
        rerender(
            <MemoryRouter initialEntries={["/"]}>
                <Routes><Route path="/" element={<HomePage />} /></Routes>
            </MemoryRouter>,
        );
        expect(screen.getByRole("alert").textContent).toContain("Your reptiles couldn’t load");
    });
});
