import DetailedReptile from "../../core/entities/DetailedReptile";
import { useQueryClient } from "@tanstack/react-query";
import Dialog from "@mui/material/Dialog";
import { localDate } from "../../helpers/date";
import { useEffect, useMemo, useState } from "react";
import { SnakeFood, type FeedingEntry, type FeedingInput } from "../../types";
import { useDetailedReptileContext } from "../../context/SelectedReptileContext";
import { removeFeeding, saveFeeding } from "../../helpers/reptileApi";

function prettyDate(value: string) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function ReptileFeedingPage() {
    const reptile = useDetailedReptileContext();
    const queryClient = useQueryClient();
    const [feedings, setFeedings] = useState<FeedingEntry[]>(reptile?.feedings ?? []);
    const [editing, setEditing] = useState<FeedingEntry | undefined>();
    const [formOpen, setFormOpen] = useState(false);
    const [formError, setFormError] = useState("");
    const [pageError, setPageError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [date, setDate] = useState(localDate());
    const [foodType, setFoodType] = useState<SnakeFood>(SnakeFood.FUZZY);
    const [amount, setAmount] = useState(1);
    const [powdered, setPowdered] = useState(false);
    const [today, setToday] = useState(() => new Date().toDateString());

    useEffect(() => {
        const refreshDay = () => setToday(new Date().toDateString());
        window.addEventListener("focus", refreshDay);
        document.addEventListener("visibilitychange", refreshDay);
        const timer = window.setInterval(refreshDay, 60_000);
        return () => {
            window.removeEventListener("focus", refreshDay);
            document.removeEventListener("visibilitychange", refreshDay);
            window.clearInterval(timer);
        };
    }, []);

    useEffect(() => setFeedings(reptile?.feedings ?? []), [reptile?.feedings]);

    const trend = useMemo(() => {
        const now = new Date();
        const countFor = (daysAgo: number) => feedings.filter(({ date: value }) => {
            const age = (now.getTime() - new Date(`${value}T00:00:00`).getTime()) / 86_400_000;
            return age >= daysAgo && age < daysAgo + 30;
        }).length;
        const recent = countFor(0);
        const prior = countFor(30);
        return { recent, prior, direction: recent > prior ? "More frequent" : recent < prior ? "Less frequent" : "Steady" };
    }, [feedings, today]);

    if (!reptile) return <p role="status">Loading reptile…</p>;
    const reptileId = reptile.id;

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!reptile) return;
        const input: FeedingInput = { date, foodType, amount, powdered, powderType: powdered ? "vitamin" : "" };
        setIsSaving(true);
        try {
            const saved = await saveFeeding(reptileId, input, editing?.id);
            setFeedings((items) => [...items.filter((item) => item.id !== saved.id), saved].sort((a, b) => b.date.localeCompare(a.date)));
            queryClient.setQueryData<DetailedReptile>(["reptile", reptileId], (current) => current && new DetailedReptile({ ...current, feedings: [...current.feedings.filter((item) => item.id !== saved.id), saved] }));
            closeForm();
        } catch {
            setFormError("Could not save this feeding. Try again.");
        } finally {
            setIsSaving(false);
        }
    }

    function edit(entry: FeedingEntry) {
        setEditing(entry);
        setDate(entry.date);
        setFoodType(entry.foodType);
        setAmount(entry.amount);
        setPowdered(entry.powdered);
        setFormError("");
        setFormOpen(true);
    }

    function closeForm() {
        if (isSaving) return;
        setFormOpen(false);
        setEditing(undefined);
        setDate(localDate());
        setFoodType(SnakeFood.FUZZY);
        setAmount(1);
        setPowdered(false);
        setFormError("");
    }

    async function deleteEntry(id: string) {
        try {
            await removeFeeding(reptileId, id);
            setFeedings((items) => items.filter((item) => item.id !== id));
            queryClient.setQueryData<DetailedReptile>(["reptile", reptileId], (current) => current && new DetailedReptile({ ...current, feedings: current.feedings.filter((item) => item.id !== id) }));
            setPageError("");
        } catch {
            setPageError("Could not delete this feeding. Try again.");
        }
    }

    return <main className="mx-auto w-full max-w-3xl pb-10 text-white">
        <header className="mb-6 border-b border-[#515151] pb-5">
            <p className="mb-2 text-sm font-medium text-[#89CFF0]">Care log</p>
            <h1 className="text-3xl font-semibold tracking-tight">Feedings</h1>
            <p className="mt-1 text-sm text-[#C2C2C2]">Record meals and review past entries for {reptile.name}.</p>
        </header>

        <div className="mb-5">
            <button type="button" onClick={() => { setEditing(undefined); setDate(localDate()); setFoodType(SnakeFood.FUZZY); setAmount(1); setPowdered(false); setFormError(""); setFormOpen(true); }} className="min-h-12 w-full rounded-xl bg-[#89CFF0] px-5 py-3 text-left font-semibold text-[#252525] hover:bg-[#b0e0f5] sm:w-auto">Add feeding entry</button>
        </div>

        <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="sm" aria-labelledby="feeding-form-title" sx={{ "& .MuiDialog-container": { alignItems: { xs: "flex-end", sm: "center" } }, "& .MuiDialog-paper": { m: { xs: 0, sm: 2 }, width: "100%", maxHeight: { xs: "90dvh", sm: "calc(100% - 64px)" }, borderRadius: { xs: "16px 16px 0 0", sm: "12px" }, backgroundColor: "#303030", color: "white" } }}>
            <div className="p-5 sm:p-6">
            <h2 id="feeding-form-title" className="mb-4 text-xl font-semibold">{editing ? "Edit feeding" : "Add feeding entry"}</h2>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <label className="grid min-h-16 gap-1 text-sm text-[#C2C2C2]">Date<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-h-11 rounded-lg border border-[#515151] bg-[#252525] px-3 text-white focus-visible:outline-[#89CFF0]" /></label>
                <label className="grid min-h-16 gap-1 text-sm text-[#C2C2C2]">Food<select value={foodType} onChange={(event) => setFoodType(event.target.value as SnakeFood)} className="min-h-11 rounded-lg border border-[#515151] bg-[#252525] px-3 text-white focus-visible:outline-[#89CFF0]">{Object.values(SnakeFood).map((food) => <option key={food} value={food}>{food}</option>)}</select></label>
                <label className="grid min-h-16 gap-1 text-sm text-[#C2C2C2]">Amount<input required min={1} type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="min-h-11 rounded-lg border border-[#515151] bg-[#252525] px-3 text-white focus-visible:outline-[#89CFF0]" /></label>
                <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={powdered} onChange={(event) => setPowdered(event.target.checked)} className="h-5 w-5 accent-[#89CFF0]" />Supplement added</label>
                <div className="flex flex-wrap gap-3 sm:col-span-2">
                    <button disabled={isSaving} className="min-h-11 rounded-lg bg-[#89CFF0] px-5 py-2 font-semibold text-[#252525] hover:bg-[#b0e0f5] disabled:cursor-wait disabled:opacity-60" type="submit">{isSaving ? "Saving…" : editing ? "Save changes" : "Add feeding entry"}</button>
                    <button type="button" onClick={closeForm} disabled={isSaving} className="min-h-11 rounded-lg border border-[#89CFF0] px-4 py-2 text-white hover:bg-white/5 disabled:opacity-60">Cancel</button>
                    {isSaving && <span role="status" className="self-center text-sm text-[#C2C2C2]">Saving feeding…</span>}
                </div>
            </form>
            {formError && <p role="alert" className="mt-3 rounded-lg border border-[#89CFF0] bg-[#89CFF0]/10 px-3 py-2 text-sm text-[#FFBABA]">{formError}</p>}
            </div>
        </Dialog>

        {pageError && <p role="alert" className="mb-4 rounded-lg border border-[#89CFF0] bg-[#89CFF0]/10 px-3 py-2 text-sm text-[#FFBABA]">{pageError}</p>}
        <section aria-labelledby="history-title" className="mb-8">
            <h2 id="history-title" className="mb-3 text-xl font-semibold">Feeding history</h2>
            {feedings.length === 0 ? <p className="rounded-xl border border-dashed border-[#89CFF0] bg-[#303030] p-4 text-sm text-[#C2C2C2]">No feedings recorded yet. Add the first meal above.</p> : <ul className="divide-y divide-[#515151] rounded-xl border border-[#89CFF0] bg-[#303030]">{[...feedings].sort((a, b) => b.date.localeCompare(a.date)).map((entry) => <li key={entry.id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div><p className="font-medium">{entry.amount} × {entry.foodType}</p><p className="mt-1 text-sm text-[#C2C2C2]">{prettyDate(entry.date)} · {entry.powdered ? `Supplement: ${entry.powderType || "added"}` : "No supplement"}</p></div><div className="flex gap-2"><button onClick={() => edit(entry)} className="min-h-11 rounded-md px-3 py-2 text-sm font-medium text-[#89CFF0] hover:bg-white/5" aria-label={`Edit feeding from ${prettyDate(entry.date)}`}>Edit</button><button onClick={() => void deleteEntry(entry.id)} className="min-h-11 rounded-md px-3 py-2 text-sm text-[#C2C2C2] hover:bg-white/5" aria-label={`Delete feeding from ${prettyDate(entry.date)}`}>Delete</button></div></li>)}</ul>}
        </section>

        <section aria-labelledby="trend-title" className="rounded-xl border border-[#89CFF0] bg-[#303030] p-4 sm:p-5">
            <h2 id="trend-title" className="text-lg font-semibold">Eating pattern</h2>
            <p className="mt-1 text-sm text-[#C2C2C2]">A record of meals, not a recommendation.</p>
            <div role="group" className="mt-4 grid grid-cols-2 divide-x divide-[#515151]" aria-label="Feeding frequency comparison">
                <div className="pr-4"><p className="text-sm text-[#C2C2C2]">Recent · last 30 days</p><p className="mt-1 text-2xl font-semibold">{trend.recent} <span className="text-sm font-normal">meals</span></p></div>
                <div className="pl-4"><p className="text-sm text-[#C2C2C2]">Previous · 30 days before</p><p className="mt-1 text-2xl font-semibold">{trend.prior} <span className="text-sm font-normal">meals</span></p></div>
            </div>
            <p className="mt-3 text-sm text-[#89CFF0]" aria-live="polite">{trend.direction}</p>
        </section>

    </main>;
}
