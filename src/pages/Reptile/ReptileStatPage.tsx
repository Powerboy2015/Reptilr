import { useEffect, useState } from "react";
import { useDetailedReptileContext } from "../../context/SelectedReptileContext";
import { removeGrowthEntry, saveGrowthEntry } from "../../helpers/reptileApi";
import type { GrowthEntry, GrowthInput } from "../../types";

function today() {
    return new Date().toISOString().slice(0, 10);
}

function prettyDate(value: string) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function ReptileStatPage() {
    const reptile = useDetailedReptileContext();
    const [entries, setEntries] = useState<GrowthEntry[]>(() => [...(reptile?.growth ?? [])].sort((a, b) => b.date.localeCompare(a.date)));
    const [editing, setEditing] = useState<GrowthEntry>();
    const [date, setDate] = useState(today());
    const [weight, setWeight] = useState("");
    const [length, setLength] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!reptile) return;
        setEntries([...reptile.growth].sort((a, b) => b.date.localeCompare(a.date)));
        setEditing(undefined);
        setDate(today());
        setWeight("");
        setLength("");
        setError("");
    }, [reptile?.id]);

    if (!reptile) return <p role="status">Loading reptile…</p>;
    const reptileId = reptile.id;
    const latest = entries[0];

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!reptile) return;
        const input: GrowthInput = { date, weight_grams: Number(weight), length_cm: Number(length) };
        try {
            const saved = await saveGrowthEntry(reptileId, input, editing?.id);
            setEntries((current) => [...current.filter((entry) => entry.id !== saved.id), saved].sort((a, b) => b.date.localeCompare(a.date)));
            resetForm();
            setError("");
        } catch {
            setError("Could not save this measurement. Try again.");
        }
    }

    function edit(entry: GrowthEntry) {
        setEditing(entry);
        setDate(entry.date);
        setWeight(String(entry.weight_grams));
        setLength(String(entry.length_cm));
    }

    function resetForm() {
        setEditing(undefined);
        setDate(today());
        setWeight("");
        setLength("");
    }

    async function deleteEntry(id: string) {
        try {
            await removeGrowthEntry(reptileId, id);
            setEntries((current) => current.filter((entry) => entry.id !== id));
            setError("");
        } catch {
            setError("Could not delete this measurement. Try again.");
        }
    }

    return (
        <main className="mx-auto w-full max-w-3xl pb-10 text-white">
            <header className="mb-7 border-b border-white/15 pb-5">
                <p className="mb-2 text-sm text-[#FF9F9F]">Growth record</p>
                <h1 className="text-3xl font-semibold tracking-tight">{reptile.name}&apos;s size and weight</h1>
                <p className="mt-1 text-white/65">Track changes over time with dated measurements.</p>
            </header>

            <section aria-labelledby="latest-title" className="mb-8">
                <h2 id="latest-title" className="mb-3 text-xl font-semibold">Latest measurements</h2>
                {latest ? <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                    <div className="rounded-xl bg-black/20 p-4"><p className="text-sm text-white/60">Weight</p><p className="mt-1 text-2xl font-semibold">{latest.weight_grams} <span className="text-sm font-normal">g</span></p></div>
                    <div className="rounded-xl bg-black/20 p-4"><p className="text-sm text-white/60">Length</p><p className="mt-1 text-2xl font-semibold">{latest.length_cm} <span className="text-sm font-normal">cm</span></p></div>
                    <p className="col-span-2 text-sm text-white/60">Recorded {prettyDate(latest.date)}</p>
                </div> : <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-white/65">No measurements recorded yet. Add the first one below.</p>}
            </section>

            <section aria-labelledby="form-title" className="mb-8">
                <h2 id="form-title" className="mb-3 text-xl font-semibold">{editing ? "Edit measurement" : "Record a measurement"}</h2>
                <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm text-white/75">Date<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-lg border border-white/20 bg-[#252525] px-3 py-2 text-white focus-visible:outline-2 focus-visible:outline-[#FF9F9F]" /></label>
                    <label className="grid gap-1 text-sm text-white/75">Weight (g)<input required min="0" step="any" type="number" value={weight} onChange={(event) => setWeight(event.target.value)} className="rounded-lg border border-white/20 bg-[#252525] px-3 py-2 text-white focus-visible:outline-2 focus-visible:outline-[#FF9F9F]" /></label>
                    <label className="grid gap-1 text-sm text-white/75">Length (cm)<input required min="0" step="any" type="number" value={length} onChange={(event) => setLength(event.target.value)} className="rounded-lg border border-white/20 bg-[#252525] px-3 py-2 text-white focus-visible:outline-2 focus-visible:outline-[#FF9F9F]" /></label>
                    <div className="flex items-end gap-3"><button className="rounded-lg bg-[#FF9F9F] px-4 py-2 font-medium text-[#252525] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" type="submit">{editing ? "Save changes" : "Add measurement"}</button>{editing && <button type="button" onClick={resetForm} className="rounded-lg border border-white/25 px-4 py-2 focus-visible:outline-2 focus-visible:outline-[#FF9F9F]">Cancel edit</button>}</div>
                </form>
                {error && <p role="alert" className="mt-3 text-sm text-[#FF9F9F]">{error}</p>}
            </section>

            <section aria-labelledby="history-title">
                <h2 id="history-title" className="mb-3 text-xl font-semibold">Measurement history</h2>
                {entries.length === 0 ? <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-white/65">Your dated measurements will appear here.</p> : <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">{entries.map((entry) => <li key={entry.id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div><p className="font-medium">{entry.weight_grams} g · {entry.length_cm} cm</p><p className="mt-1 text-sm text-white/60">{prettyDate(entry.date)}</p></div><div className="flex gap-2"><button onClick={() => edit(entry)} className="rounded-md px-3 py-2 text-sm text-[#FF9F9F] focus-visible:outline-2 focus-visible:outline-[#FF9F9F]" aria-label={`Edit measurement from ${prettyDate(entry.date)}`}>Edit</button><button onClick={() => void deleteEntry(entry.id)} className="rounded-md px-3 py-2 text-sm text-white/70 focus-visible:outline-2 focus-visible:outline-[#FF9F9F]" aria-label={`Delete measurement from ${prettyDate(entry.date)}`}>Delete</button></div></li>)}</ul>}
            </section>
        </main>
    );
}
