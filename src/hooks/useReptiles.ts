import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { ReptileDTO } from "../types.ts";
import Reptile from "../core/entities/Reptile.ts";

export default function useReptiles() {
    return useQuery<Reptile[]>({
        queryKey: ["reptile", "list"],
        queryFn: async () => {
            const reptiles = await invoke<ReptileDTO[]>("get_reptile_list");
            return reptiles.map((reptile) => Reptile.fromDTO(reptile));
        },
    });
}
