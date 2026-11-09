import Reptile from "../../core/entities/Reptile.ts";

interface ReptileListItemProps {
    reptile: Reptile;
    RouteToReptile?: () => void;
}

export default function ReptileItem({ reptile, RouteToReptile }: ReptileListItemProps) {
    const name = reptile.name.trim() !== "" ? reptile.name : "Unnamed reptile";
    const species = typeof reptile.species === "string" && reptile.species.trim() !== "" ? reptile.species : "Species not recorded";
    const birthdate = reptile.birth_date !== "" ? reptile.birth_date : "Not recorded";

    return <button
        type="button"
        className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/10 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#FF9F9F] active:bg-white/15"
        onClick={RouteToReptile}
        aria-label={`Open ${name}`}
    >
        <span className="min-w-0">
            <span className="block truncate text-xl font-semibold text-white">{name}</span>
            <span className="mt-1 block text-sm text-white/75">{species}</span>
            <span className="mt-1 block text-xs text-white/55">Birthday: {birthdate}</span>
        </span>
        <span className="shrink-0 text-2xl text-white/70 transition-transform group-hover:translate-x-0.5" aria-hidden="true">›</span>
    </button>;
}
