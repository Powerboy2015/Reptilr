import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("web app installation metadata", () => {
    it("links to a public manifest that launches Reptilr fullscreen", () => {
        const html = readFileSync("index.html", "utf8");
        const document = new DOMParser().parseFromString(html, "text/html");
        const manifestLink = document.querySelector('link[rel="manifest"]');

        expect(manifestLink).not.toBeNull();

        const manifestPath = resolve("public", `.${manifestLink.getAttribute("href")}`);
        const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

        expect(manifest).toMatchObject({
            name: "Reptilr",
            start_url: "/",
            display: "fullscreen",
            background_color: "#252525",
            theme_color: "#252525",
        });
    });
});

