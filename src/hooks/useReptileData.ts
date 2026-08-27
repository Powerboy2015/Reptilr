import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { DetailedReptileDTO, ENVIRONMENT, SnakeFood } from "../types";
import DetailedReptile from "../core/entities/DetailedReptile";

export default function useReptileData(reptileID: string) {
    return useQuery({
        queryKey: ["reptile", reptileID],
        queryFn: async () => await getReptileData(reptileID, ENVIRONMENT.MOCK),
    });
}

const mockEntry = (reptileID: string) => {
    return {
        id: reptileID,
        name: "joseph",
        birth_date: "1985-10-10",
        feedings: [
            {
                date: "1920-10-10",
                foodType: SnakeFood.SM_PINKY,
                amount: 1,
                powdered: true,
                powderType: "vitamins",
            },
        ],
    };
};

async function getReptileData(reptileID: string, env?: ENVIRONMENT): Promise<DetailedReptile> {
    if (env === ENVIRONMENT.MOCK) {
        return mockEntry(reptileID);
    }

    const reptile = await invoke<DetailedReptileDTO>("get_reptile_data", { id: reptileID });

    return DetailedReptile.fromDTO(reptile);
}
