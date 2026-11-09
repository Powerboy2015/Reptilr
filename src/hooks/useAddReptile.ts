import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import Reptile from "../core/entities/Reptile";
import { addReptile } from "../helpers/reptileApi";
import type { AddReptileInput } from "../types";

export default function useAddReptile() {
    const queryClient = useQueryClient();
    return useMutation<Reptile, Error, AddReptileInput>({
        mutationFn: async (reptile) => {
            return Reptile.fromDTO(await addReptile(reptile));
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reptile", "list"] }),
    });
}
