import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const devReptiles = [
  { id: "demo-reptile", name: "Noodle", birth_date: "2020-05-12", feedings: [] },
];

function devApi() {
  return {
    name: "reptilr-dev-api",
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use("/api/reptiles", (req, res, next) => {
        const id = req.url?.split("/").filter(Boolean)[0];
        if (req.method === "GET" && !id) {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(devReptiles.map(({ feedings, ...reptile }) => reptile)));
          return;
        }
        if (req.method === "GET" && id) {
          const reptile = devReptiles.find((item) => item.id === id);
          res.statusCode = reptile ? 200 : 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(reptile ?? { error: "Reptile not found" }));
          return;
        }
        if (req.method === "POST" && !id) {
          let body = "";
          req.on("data", (chunk) => { body += chunk; });
          req.on("end", () => {
            try {
              const input = JSON.parse(body) as { name?: unknown; birth_date?: unknown };
              if (typeof input.name !== "string" || typeof input.birth_date !== "string") {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: "name and birth_date must be strings" }));
                return;
              }
              const reptile = { id: crypto.randomUUID(), name: input.name, birth_date: input.birth_date, feedings: [] };
              devReptiles.push(reptile);
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(reptile));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), devApi(),
  tailwindcss()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || "0.0.0.0",
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  test: {
    environment: "jsdom",
    restoreMocks: true,
    unstubGlobals: true,
  },
}));
