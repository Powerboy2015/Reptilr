import Reptile from "../../core/entities/Reptile.ts";

interface ReptileListItemProps {
    reptile: Reptile;
    RouteToReptile?: () => void;
}

function displayBirthday(value: string) {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return `Born ${value}`;
    return `Born ${new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date)}`;
}

export default function ReptileItem({ reptile, RouteToReptile }: ReptileListItemProps) {
    const name = reptile.name.trim() !== "" ? reptile.name : "Unnamed reptile";
    const species = typeof reptile.species === "string" && reptile.species.trim() !== "" ? reptile.species : "Species not recorded";
    const birthday = displayBirthday(reptile.birth_date);

    return <button
        type="button"
        className="group flex min-h-24 w-full rounded-xl border border-[#89CFF0] bg-[#303030] items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/5 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#89CFF0] active:bg-white/10"
        onClick={RouteToReptile}
        aria-label={`Open ${name}`}
    >
        <span className="min-w-0">
            <span className="block truncate text-xl font-semibold text-white">{name}</span>
            <span className="mt-1 block text-sm text-[#C2C2C2]">{species}</span>
            {birthday && <span className="mt-1 block text-sm text-white/55">{birthday}</span>}
        </span>
        <span className="shrink-0 text-2xl text-[#C2C2C2] transition-transform group-hover:translate-x-0.5" aria-hidden="true">›</span>
    </button>;
}
