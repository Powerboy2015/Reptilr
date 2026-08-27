import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import Reptile from "../core/entities/Reptile";

export default function useAddReptile() {
    return useMutation<Reptile, Error, { name: string; birth_date: string }>({
        mutationFn: async ({ name, birth_date }) => {
            return await invoke("add_reptile", { req: { name, birth_date } });
        },
    });
}
