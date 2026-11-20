import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetailedReptile from "../src/core/entities/DetailedReptile";
import { DetailedReptileContext } from "../src/context/SelectedReptileContext";
import ReptilNavigator from "../src/components/ui/ReptileNavigator";

const reptile = new DetailedReptile({
    id: "r1",
    name: "Noodle",
    birth_date: "",
    species: "Ball python",
    weight_grams: 0,
    length_cm: 0,
    last_shed: "",
    feedings: [],
    growth: [],
});

afterEach(cleanup);

describe("reptile navigation", () => {
    it("provides named destinations and marks the current page", () => {
        render(
            <MemoryRouter initialEntries={["/reptile/r1/feedings"]}>
                <DetailedReptileContext.Provider value={reptile}>
                    <ReptilNavigator />
                    <Routes>
                        <Route path="/reptile/:id/*" element={<p>Care page</p>} />
                    </Routes>
                </DetailedReptileContext.Provider>
            </MemoryRouter>,
        );

        expect(screen.getByRole("link", { name: "Overview" }).getAttribute("href")).toBe("/reptile/r1");
        expect(screen.getByRole("link", { name: "Feedings" }).getAttribute("aria-current")).toBe("page");
        expect(screen.getByRole("link", { name: "Growth" }).getAttribute("href")).toBe("/reptile/r1/stats");
    });

    it("keeps bottom navigation fixed on mobile", () => {
        render(
            <MemoryRouter>
                <DetailedReptileContext.Provider value={reptile}>
                    <ReptilNavigator />
                </DetailedReptileContext.Provider>
            </MemoryRouter>,
        );

        const footer = screen.getByRole("contentinfo");
        expect(footer.classList.contains("fixed")).toBe(true);
        expect(footer.classList.contains("bottom-0")).toBe(true);
    });
});
