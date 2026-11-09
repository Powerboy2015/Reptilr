import { useQuery } from "@tanstack/react-query";
import DetailedReptile from "../core/entities/DetailedReptile";
import { getReptile } from "../helpers/reptileApi";

export default function useReptileData(reptileID: string) {
    return useQuery({
        queryKey: ["reptile", reptileID],
        queryFn: async () => DetailedReptile.fromDTO(await getReptile(reptileID)),
    });
}
