import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
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
    it("stays fixed at the bottom of the viewport", () => {
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
