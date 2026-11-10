import { createContext, useContext } from "react";
import DetailedReptile from "../core/entities/DetailedReptile";

export const DetailedReptileContext = createContext<DetailedReptile | undefined>(undefined);

export function useDetailedReptileContext() {
    const context = useContext(DetailedReptileContext);

    if (!context) return undefined;

    return context;
}