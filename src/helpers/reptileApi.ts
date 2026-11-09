import { invoke } from "@tauri-apps/api/core";
import { SnakeFood, type DetailedReptileDTO, type ReptileDTO } from "../types";

const isTauri = "__TAURI_INTERNALS__" in window;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(path, options);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response.json() as Promise<T>;
}

export function getReptiles(): Promise<ReptileDTO[]> {
    return isTauri ? invoke("get_reptile_list") : request("/api/reptiles");
}

export function addReptile(name: string, birth_date: string): Promise<ReptileDTO> {
    return isTauri
        ? invoke("add_reptile", { req: { name, birth_date } })
        : request("/api/reptiles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, birth_date }),
        });
}

export function getReptile(id: string): Promise<DetailedReptileDTO> {
    return isTauri
        ? Promise.resolve({
            id,
            name: "joseph",
            birth_date: "1985-10-10",
            feedings: [{ date: "1920-10-10", foodType: SnakeFood.SM_PINKY, amount: 1, powdered: true, powderType: "vitamins" }],
        })
        : request(`/api/reptiles/${encodeURIComponent(id)}`);
}
