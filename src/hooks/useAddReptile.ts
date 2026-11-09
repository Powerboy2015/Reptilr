import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import Reptile from "../core/entities/Reptile";
import { addReptile } from "../helpers/reptileApi";

export default function useAddReptile() {
    const queryClient = useQueryClient();
    return useMutation<Reptile, Error, { name: string; birth_date: string }>({
        mutationFn: async ({ name, birth_date }) => {
            return Reptile.fromDTO(await addReptile(name, birth_date));
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reptile", "list"] }),
    });
}
