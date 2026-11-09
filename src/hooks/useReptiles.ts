import { useQuery } from "@tanstack/react-query";
import Reptile from "../core/entities/Reptile.ts";
import { getReptiles } from "../helpers/reptileApi";

export default function useReptiles() {
    return useQuery<Reptile[]>({
        queryKey: ["reptile", "list"],
        queryFn: async () => {
            const reptiles = await getReptiles();
            return reptiles.map((reptile) => Reptile.fromDTO(reptile));
        },
    });
}
