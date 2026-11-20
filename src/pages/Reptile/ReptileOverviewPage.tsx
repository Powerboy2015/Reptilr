import { NavLink } from "react-router-dom";
import { useDetailedReptileContext } from "../../context/SelectedReptileContext";
import { ROUTES } from "../../routers/AppRouter";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import DetailedReptile from "../../core/entities/DetailedReptile";
import { updateReptile } from "../../helpers/reptileApi";
import type { ReptileDTO } from "../../types";

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
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    if (!reptile) return <p role="status">Loading reptile…</p>;

    const latestFeeding = [...reptile.feedings].sort((left, right) => right.date.localeCompare(left.date))[0];
    const recentGrowth = [...reptile.growth]
        .sort((left, right) => right.date.localeCompare(left.date))
        .slice(0, 5);
    const latestGrowth = recentGrowth[0];
    const weight = latestGrowth?.weight_grams ?? reptile.weight_grams;
    const length = latestGrowth?.length_cm ?? reptile.length_cm;
    const fields = [
        { label: "Birthday", value: displayDate(reptile.birth_date) },
        { label: "Age", value: ageFromBirthDate(reptile.birth_date) },
        { label: "Weight", value: latestGrowth || weight > 0 ? `${weight} g` : "Not recorded" },
        { label: "Length", value: latestGrowth || length > 0 ? `${length} cm` : "Not recorded" },
        { label: "Last shed", value: displayDate(reptile.last_shed) },
    ];

    return <main className="mx-auto w-full max-w-3xl pb-8 text-white">
        <header className="mb-7 border-b border-[#515151] pb-5">
            <p className="mb-2 text-sm font-medium text-[#89CFF0]">Overview</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{reptile.name}</h1>
            <p className="mt-1 text-base text-[#C2C2C2]">{reptile.species || "Species not recorded"}</p>
        </header>

        <section aria-label="Profile details" className="mb-8 overflow-hidden rounded-xl border border-[#89CFF0] bg-[#303030]">
            <div className="flex justify-end p-3"><button type="button" onClick={() => { setEditing(true); setError(""); }} className="min-h-11 rounded-lg px-3 text-sm font-medium text-[#89CFF0]">Edit profile</button></div>
            <dl className="grid grid-cols-2 divide-x divide-y divide-[#515151]">
                {fields.map(({ label, value }) => <div key={label} className="min-h-24 p-4">
                    <dt className="text-sm text-[#C2C2C2]">{label}</dt>
                    <dd className="mt-2 text-lg font-medium">{value}</dd>
                </div>)}
            </dl>
        </section>

        {editing && <form className="mb-8 grid gap-3 rounded-xl border border-[#89CFF0] bg-[#303030] p-4 sm:grid-cols-2" onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const field = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value;
            const profile: Omit<ReptileDTO, "id"> = { name: field("name"), species: field("species"), birth_date: field("birth_date"), weight_grams: Number(field("weight_grams")), length_cm: Number(field("length_cm")), last_shed: field("last_shed") };
            setSaving(true);
            try {
                const updated = await updateReptile(reptile.id, profile);
                queryClient.setQueryData<DetailedReptile>(["reptile", reptile.id], (current) => current && new DetailedReptile({ ...current, ...updated }));
                void queryClient.invalidateQueries({ queryKey: ["reptile", "list"] });
                setEditing(false);
            } catch { setError("Could not save this profile. Try again."); }
            finally { setSaving(false); }
        }}>
            <label>Name<input required name="name" defaultValue={reptile.name} className="block min-h-11 w-full rounded bg-[#252525] p-2" /></label>
            <label>Species<input name="species" defaultValue={reptile.species} className="block min-h-11 w-full rounded bg-[#252525] p-2" /></label>
            <label>Birthday<input type="date" name="birth_date" defaultValue={reptile.birth_date} className="block min-h-11 w-full rounded bg-[#252525] p-2" /></label>
            <label>Last shed<input name="last_shed" defaultValue={reptile.last_shed} placeholder="Date or note" className="block min-h-11 w-full rounded bg-[#252525] p-2" /></label>
            <label>Weight (g)<input required min="0" step="any" type="number" name="weight_grams" defaultValue={reptile.weight_grams} className="block min-h-11 w-full rounded bg-[#252525] p-2" /></label>
            <label>Length (cm)<input required min="0" step="any" type="number" name="length_cm" defaultValue={reptile.length_cm} className="block min-h-11 w-full rounded bg-[#252525] p-2" /></label>
            {error && <p role="alert" className="sm:col-span-2">{error}</p>}
            <div className="flex gap-2 sm:col-span-2"><button disabled={saving} className="min-h-11 rounded-lg bg-[#89CFF0] px-4 text-[#252525]">{saving ? "Saving…" : "Save profile"}</button><button type="button" onClick={() => setEditing(false)} className="min-h-11 px-4">Cancel</button></div>
        </form>}

        <section aria-labelledby="growth-heading" className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 id="growth-heading" className="text-xl font-semibold">Recent measurements</h2>
                <NavLink className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-[#89CFF0] hover:bg-white/5" to={ROUTES.STATS(reptile.id)}>View growth</NavLink>
            </div>
            {recentGrowth.length ? <ul className="divide-y divide-[#515151] rounded-xl border border-[#89CFF0] bg-[#303030]">
                {recentGrowth.map((entry) => <li key={entry.id} className="flex flex-wrap justify-between gap-2 px-4 py-3">
                    <span className="text-sm text-[#C2C2C2]">{displayDate(entry.date)}</span>
                    <span className="font-medium">{entry.weight_grams} g · {entry.length_cm} cm</span>
                </li>)}
            </ul> : <div className="rounded-xl border border-dashed border-[#89CFF0] px-4 py-4">
                <p className="text-sm text-[#C2C2C2]">No weight or length entries recorded yet.</p>
                <NavLink className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-[#89CFF0]" to={ROUTES.STATS(reptile.id)}>Record a measurement</NavLink>
            </div>}
        </section>

        <section aria-labelledby="feeding-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 id="feeding-heading" className="text-xl font-semibold">Recent feeding</h2>
                <NavLink className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-[#89CFF0] hover:bg-white/5" to={ROUTES.FEEDINGS(reptile.id)}>View feeding log</NavLink>
            </div>
            {latestFeeding ? <div className="rounded-xl border border-[#89CFF0] bg-[#303030] p-4">
                <p className="font-medium">{latestFeeding.amount} × {latestFeeding.foodType}</p>
                <p className="mt-1 text-sm text-[#C2C2C2]">{displayDate(latestFeeding.date)}</p>
                {latestFeeding.powdered && <p className="mt-2 text-sm text-[#89CFF0]">Supplement: {latestFeeding.powderType || "recorded"}</p>}
            </div> : <div className="rounded-xl border border-dashed border-[#89CFF0] px-4 py-4">
                <p className="text-sm text-[#C2C2C2]">No feedings recorded yet.</p>
                <NavLink className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-[#89CFF0]" to={ROUTES.FEEDINGS(reptile.id)}>Record the first feeding</NavLink>
            </div>}
        </section>
    </main>;
}
