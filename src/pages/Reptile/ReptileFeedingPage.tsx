import { useMemo, useState } from "react";
import { SnakeFood, type FeedingEntry, type FeedingInput } from "../../types";
import { useDetailedReptileContext } from "../../context/SelectedReptileContext";
import { removeFeeding, saveFeeding } from "../../helpers/reptileApi";

function today() {
    return new Date().toISOString().slice(0, 10);
}

function prettyDate(value: string) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function ReptileFeedingPage() {
    const reptile = useDetailedReptileContext();
    const [feedings, setFeedings] = useState<FeedingEntry[]>(reptile?.feedings ?? []);
    const [editing, setEditing] = useState<FeedingEntry | undefined>();
    const [error, setError] = useState("");
    const [date, setDate] = useState(today());
    const [foodType, setFoodType] = useState<SnakeFood>(SnakeFood.FUZZY);
    const [amount, setAmount] = useState(1);
    const [powdered, setPowdered] = useState(false);

    const trend = useMemo(() => {
        const now = new Date();
        const countFor = (daysAgo: number) => feedings.filter(({ date: value }) => {
            const age = (now.getTime() - new Date(`${value}T00:00:00`).getTime()) / 86_400_000;
            return age >= daysAgo && age < daysAgo + 30;
        }).length;
        const recent = countFor(0);
        const prior = countFor(30);
        return { recent, prior, direction: recent > prior ? "More frequent" : recent < prior ? "Less frequent" : "Steady" };
    }, [feedings]);

    if (!reptile) return <p role="status">Loading reptile…</p>;
    const reptileId = reptile.id;

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!reptile) return;
        const input: FeedingInput = { date, foodType, amount, powdered, powderType: powdered ? "vitamin" : "" };
        try {
            const saved = await saveFeeding(reptileId, input, editing?.id);
            setFeedings((items) => [...items.filter((item) => item.id !== saved.id), saved].sort((a, b) => b.date.localeCompare(a.date)));
            setEditing(undefined);
            setDate(today());
            setError("");
        } catch {
            setError("Could not save this feeding. Try again.");
        }
    }

    function edit(entry: FeedingEntry) {
        setEditing(entry);
        setDate(entry.date);
        setFoodType(entry.foodType);
        setAmount(entry.amount);
        setPowdered(entry.powdered);
    }

    async function deleteEntry(id: string) {
        try {
            await removeFeeding(reptileId, id);
            setFeedings((items) => items.filter((item) => item.id !== id));
            setError("");
        } catch {
            setError("Could not delete this feeding. Try again.");
        }
    }

    return (
        <main className="mx-auto w-full max-w-3xl pb-10 text-white">
            <header className="mb-7 border-b border-white/15 pb-5">
                <p className="mb-2 text-sm text-[#FF9F9F]">Care log</p>
                <h1 className="text-3xl font-semibold tracking-tight">{reptile.name}&apos;s feedings</h1>
                <p className="mt-1 text-white/65">Track meals and notice changes in appetite.</p>
            </header>

            <section aria-labelledby="trend-title" className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 id="trend-title" className="text-lg font-semibold">Eating pattern</h2>
                        <p className="mt-1 text-sm text-white/60">Meals in the last 30 days compared with the 30 days before.</p>
                    </div>
                    <p className="text-[#FF9F9F]" aria-live="polite">{trend.direction}</p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3" aria-label="Feeding frequency comparison">
                    <div className="rounded-xl bg-black/20 p-4"><p className="text-sm text-white/60">Recent</p><p className="mt-1 text-2xl font-semibold">{trend.recent} <span className="text-sm font-normal">meals</span></p></div>
                    <div className="rounded-xl bg-black/20 p-4"><p className="text-sm text-white/60">Previous period</p><p className="mt-1 text-2xl font-semibold">{trend.prior} <span className="text-sm font-normal">meals</span></p></div>
                </div>
            </section>

            <section aria-labelledby="form-title" className="mb-8">
                <h2 id="form-title" className="mb-3 text-xl font-semibold">{editing ? "Edit feeding" : "Record a feeding"}</h2>
                <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm text-white/75">Date<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-lg border border-white/20 bg-[#252525] px-3 py-2 text-white focus-visible:outline-2 focus-visible:outline-[#FF9F9F]" /></label>
                    <label className="grid gap-1 text-sm text-white/75">Food<select value={foodType} onChange={(event) => setFoodType(event.target.value as SnakeFood)} className="rounded-lg border border-white/20 bg-[#252525] px-3 py-2 text-white focus-visible:outline-2 focus-visible:outline-[#FF9F9F]">{Object.values(SnakeFood).map((food) => <option key={food} value={food}>{food}</option>)}</select></label>
                    <label className="grid gap-1 text-sm text-white/75">Amount<input required min={1} type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="rounded-lg border border-white/20 bg-[#252525] px-3 py-2 text-white focus-visible:outline-2 focus-visible:outline-[#FF9F9F]" /></label>
                    <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={powdered} onChange={(event) => setPowdered(event.target.checked)} className="accent-[#FF9F9F]" />Supplement added</label>
                    <div className="flex gap-3 sm:col-span-2"><button className="rounded-lg bg-[#FF9F9F] px-4 py-2 font-medium text-[#252525] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" type="submit">{editing ? "Save changes" : "Add feeding"}</button>{editing && <button type="button" onClick={() => setEditing(undefined)} className="rounded-lg border border-white/25 px-4 py-2 focus-visible:outline-2 focus-visible:outline-[#FF9F9F]">Cancel edit</button>}</div>
                </form>
                {error && <p role="alert" className="mt-3 text-sm text-[#FF9F9F]">{error}</p>}
            </section>

            <section aria-labelledby="history-title">
                <h2 id="history-title" className="mb-3 text-xl font-semibold">Previous feedings</h2>
                {feedings.length === 0 ? <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-white/65">No feedings recorded yet. Add the first meal above.</p> : <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">{[...feedings].sort((a, b) => b.date.localeCompare(a.date)).map((entry) => <li key={entry.id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div><p className="font-medium">{entry.amount} × {entry.foodType}</p><p className="mt-1 text-sm text-white/60">{prettyDate(entry.date)}{entry.powdered ? " · Supplement added" : ""}</p></div><div className="flex gap-2"><button onClick={() => edit(entry)} className="rounded-md px-3 py-2 text-sm text-[#FF9F9F] focus-visible:outline-2 focus-visible:outline-[#FF9F9F]" aria-label={`Edit feeding from ${prettyDate(entry.date)}`}>Edit</button><button onClick={() => void deleteEntry(entry.id)} className="rounded-md px-3 py-2 text-sm text-white/70 focus-visible:outline-2 focus-visible:outline-[#FF9F9F]" aria-label={`Delete feeding from ${prettyDate(entry.date)}`}>Delete</button></div></li>)}</ul>}
            </section>
        </main>
    );
}
