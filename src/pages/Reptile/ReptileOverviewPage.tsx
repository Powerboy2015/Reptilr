import { NavLink } from "react-router-dom";
import { useDetailedReptileContext } from "../../context/SelectedReptileContext";
import { ROUTES } from "../../routers/AppRouter";

function displayDate(value: string) {
    if (!value) return "Not recorded";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}

function ageFromBirthDate(value: string) {
    if (!value) return "Not recorded";
    const birthDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) return "Not recorded";
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    const beforeBirthday = now.getMonth() < birthDate.getMonth()
        || (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate());
    if (beforeBirthday) years -= 1;
    return years === 0 ? "Under 1 year" : `${years} ${years === 1 ? "year" : "years"}`;
}

export default function ReptileOverviewPage() {
    const reptile = useDetailedReptileContext();
    if (!reptile) return <p role="status">Loading reptile…</p>;

    const latestFeeding = [...reptile.feedings].sort((left, right) => right.date.localeCompare(left.date))[0];
    const recentGrowth = [...reptile.growth]
        .sort((left, right) => right.date.localeCompare(left.date))
        .slice(0, 5);
    const fields = [
        { label: "Age", value: ageFromBirthDate(reptile.birth_date) },
        { label: "Weight", value: reptile.weight_grams > 0 ? `${reptile.weight_grams} g` : "Not recorded" },
        { label: "Length", value: reptile.length_cm > 0 ? `${reptile.length_cm} cm` : "Not recorded" },
        { label: "Last shed", value: displayDate(reptile.last_shed) },
    ];

    return (
        <main className="mx-auto w-full max-w-3xl pb-8 text-white">
            <header className="mb-6 border-b border-white/15 pb-5">
                <p className="mb-2 text-sm text-[#FF9F9F]">Reptile profile</p>
                <h1 className="text-4xl font-semibold tracking-tight">{reptile.name}</h1>
                <p className="mt-1 text-lg text-white/70">{reptile.species || "Species not recorded"}</p>
            </header>

            <section aria-label="Profile details" className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/15">
                {fields.map(({ label, value }) => (
                    <div key={label} className="min-h-28 bg-white/5 p-4">
                        <h2 className="text-sm text-white/60">{label}</h2>
                        <p className="mt-2 text-lg font-medium">{value}</p>
                    </div>
                ))}
                <div className="col-span-2 bg-white/5 p-4">
                    <h2 className="text-sm text-white/60">Birth date</h2>
                    <p className="mt-2 text-lg font-medium">{displayDate(reptile.birth_date)}</p>
                </div>
            </section>

            <section aria-labelledby="growth-heading" className="mt-8">
                <h2 id="growth-heading" className="mb-3 text-xl font-semibold">Recent measurements</h2>
                {recentGrowth.length ? (
                    <div className="overflow-hidden rounded-xl border border-white/15">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/10 text-white/65">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-medium">Date</th>
                                    <th scope="col" className="px-4 py-3 font-medium">Weight</th>
                                    <th scope="col" className="px-4 py-3 font-medium">Length</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {recentGrowth.map((entry) => (
                                    <tr key={entry.id}>
                                        <td className="px-4 py-3">{displayDate(entry.date)}</td>
                                        <td className="px-4 py-3">{entry.weight_grams} g</td>
                                        <td className="px-4 py-3">{entry.length_cm} cm</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-white/65">No weight or length entries recorded yet.</p>
                )}
            </section>

            <section aria-labelledby="feeding-heading" className="mt-8">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                    <h2 id="feeding-heading" className="text-xl font-semibold">Feeding</h2>
                    <NavLink className="rounded px-2 py-1 text-sm text-[#FF9F9F] underline decoration-white/30 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9F9F]" to={ROUTES.FEEDINGS(reptile.id)}>
                        View feeding log
                    </NavLink>
                </div>
                {latestFeeding ? (
                    <div className="rounded-xl bg-white/5 p-4">
                        <p className="font-medium">{latestFeeding.amount} × {latestFeeding.foodType}</p>
                        <p className="mt-1 text-sm text-white/65">{displayDate(latestFeeding.date)}</p>
                        {latestFeeding.powdered && <p className="mt-2 text-sm text-[#FF9F9F]">Supplement: {latestFeeding.powderType || "recorded"}</p>}
                    </div>
                ) : (
                    <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-white/65">No feedings recorded yet. Add the first entry in the feeding log.</p>
                )}
            </section>
        </main>
    );
}
