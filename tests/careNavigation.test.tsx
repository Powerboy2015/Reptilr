import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "../src/App";

beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("reptilr.mock-reptiles.v1", JSON.stringify([{ id: "navigation-test", name: "Noodle", species: "Python", birth_date: "", weight_grams: 100, length_cm: 30, last_shed: "" }]));
    localStorage.setItem("reptilr.mock-growth.v1", "{}");
    window.history.pushState({}, "", "/reptile/navigation-test");
});
afterEach(cleanup);

describe("care records across navigation", () => {
    it("shows saved and deleted feedings on the overview and after returning", async () => {
        const { container } = render(<App />);
        fireEvent.click(await screen.findByRole("link", { name: "View feeding log" }));
        fireEvent.click(await screen.findByRole("button", { name: "Add feeding" }));
        await screen.findByText("1 × Fuzzy");
        fireEvent.click(container.querySelector('a[href="/reptile/navigation-test"]')!);
        await screen.findByText("1 × Fuzzy");
        fireEvent.click(screen.getByRole("link", { name: "View feeding log" }));
        const list = await screen.findByRole("heading", { name: "Previous feedings" });
        expect(list.parentElement?.textContent).toContain("1 × Fuzzy");
        fireEvent.click(screen.getByRole("button", { name: /Delete feeding/ }));
        await screen.findByText(/No feedings recorded yet. Add the first meal/);
        fireEvent.click(container.querySelector('a[href="/reptile/navigation-test"]')!);
        await screen.findByText(/No feedings recorded yet. Add the first entry/);
    });

    it("shows the latest saved measurement on the overview and after returning", async () => {
        const { container } = render(<App />);
        await screen.findByRole("heading", { name: "Noodle" });
        fireEvent.click(container.querySelector('a[href="/reptile/navigation-test/stats"]')!);
        fireEvent.change(await screen.findByLabelText("Weight (g)"), { target: { value: "150" } });
        fireEvent.change(screen.getByLabelText("Length (cm)"), { target: { value: "45" } });
        fireEvent.click(screen.getByRole("button", { name: "Add measurement" }));
        await screen.findByText("150 g · 45 cm");
        fireEvent.click(container.querySelector('a[href="/reptile/navigation-test"]')!);
        const details = await screen.findByRole("region", { name: "Profile details" });
        await waitFor(() => expect(within(details).getByText("150 g")).toBeTruthy());
        expect(within(details).getByText("45 cm")).toBeTruthy();
        fireEvent.click(container.querySelector('a[href="/reptile/navigation-test/stats"]')!);
        await screen.findByText("150 g · 45 cm");
        fireEvent.click(screen.getByRole("button", { name: /Delete measurement/ }));
        await screen.findByText(/No measurements recorded yet/);
        fireEvent.click(container.querySelector('a[href="/reptile/navigation-test"]')!);
        await waitFor(() => expect(within(screen.getByRole("region", { name: "Profile details" })).getByText("100 g")).toBeTruthy());
    });
});
