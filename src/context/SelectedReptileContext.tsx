import { createContext, useContext } from "react";
import DetailedReptile from "../core/entities/DetailedReptile";

export const DetailedReptileContext = createContext<DetailedReptile | undefined>(undefined);

export function useDetailedReptileContext() {
    console.debug("[CONTEXT] Attempting to load detailed reptile context.");
    const context = useContext(DetailedReptileContext);

    if (!context) return console.error("could not gather context.");

    console.debug("[CONTEXT] detailed reptile context loaded!");
    return context;
}