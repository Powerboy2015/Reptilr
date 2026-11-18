import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("mobile safe area", () => {
    it("reserves the top inset for all app screens", () => {
        const html = new DOMParser().parseFromString(readFileSync("index.html", "utf8"), "text/html");
        const viewport = html.querySelector('meta[name="viewport"]');
        const css = readFileSync("src/App.css", "utf8");

        expect(viewport?.getAttribute("content")).toContain("viewport-fit=cover");
        expect(css).toMatch(/#root\s*\{[^}]*padding-top:\s*env\(safe-area-inset-top,\s*0px\)/);
    });
});
