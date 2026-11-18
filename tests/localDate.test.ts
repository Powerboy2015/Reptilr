import { describe, expect, it } from "vitest";
import { localDate } from "../src/helpers/date";

describe("local date", () => {
    it("uses the device calendar date near UTC midnight", () => {
        const previous = process.env.TZ;
        try {
            process.env.TZ = "Europe/Amsterdam";
            expect(localDate(new Date("2026-11-17T23:30:00Z"))).toBe("2026-11-18");
        } finally {
            if (previous === undefined) delete process.env.TZ;
            else process.env.TZ = previous;
        }
    });
});
