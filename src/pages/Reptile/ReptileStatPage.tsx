import DetailedReptile from "../../core/entities/DetailedReptile";
import { useQueryClient } from "@tanstack/react-query";
import Dialog from "@mui/material/Dialog";
import { localDate } from "../../helpers/date";
import { useEffect, useState } from "react";
import { useDetailedReptileContext } from "../../context/SelectedReptileContext";
import { removeGrowthEntry, saveGrowthEntry } from "../../helpers/reptileApi";
import type { GrowthEntry, GrowthInput } from "../../types";

function prettyDate(value: string) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function ReptileStatPage() {
    const reptile = useDetailedReptileContext();
    const queryClient = useQueryClient();
    const [entries, setEntries] = useState<GrowthEntry[]>(() => [...(reptile?.growth ?? [])].sort((a, b) => b.date.localeCompare(a.date)));
    const [editing, setEditing] = useState<GrowthEntry>();
    const [formOpen, setFormOpen] = useState(false);
    const [date, setDate] = useState(localDate());
    const [weight, setWeight] = useState("");
    const [length, setLength] = useState("");
    const [formError, setFormError] = useState("");
    const [pageError, setPageError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => setEntries([...(reptile?.growth ?? [])].sort((a, b) => b.date.localeCompare(a.date))), [reptile?.growth]);
    useEffect(() => {
        if (!reptile) return;
        setFormOpen(false);
        setEditing(undefined);
        setDate(localDate());
        setWeight("");
        setLength("");
        setFormError("");
        setPageError("");
    }, [reptile?.id]);

    if (!reptile) return <p role="status">Loading reptile…</p>;
    const reptileId = reptile.id;
    const latest = entries[0];

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!reptile) return;
        const input: GrowthInput = { date, weight_grams: Number(weight), length_cm: Number(length) };
        setIsSaving(true);
        try {
            const saved = await saveGrowthEntry(reptileId, input, editing?.id);
            setEntries((current) => [...current.filter((entry) => entry.id !== saved.id), saved].sort((a, b) => b.date.localeCompare(a.date)));
            queryClient.setQueryData<DetailedReptile>(["reptile", reptileId], (current) => current && new DetailedReptile({ ...current, growth: [...current.growth.filter((entry) => entry.id !== saved.id), saved] }));
            closeForm();
        } catch {
            setFormError("Could not save this measurement. Try again.");
        } finally {
            setIsSaving(false);
        }
    }

    function edit(entry: GrowthEntry) {
        setEditing(entry);
        setDate(entry.date);
        setWeight(String(entry.weight_grams));
        setLength(String(entry.length_cm));
        setFormError("");
        setFormOpen(true);
    }

    function closeForm() {
        if (isSaving) return;
        setFormOpen(false);
        setEditing(undefined);
        setDate(localDate());
        setWeight("");
        setLength("");
        setFormError("");
    }

    function openForm() {
        setEditing(undefined);
        setDate(localDate());
        setWeight("");
        setLength("");
        setFormError("");
        setFormOpen(true);
    }

    async function deleteEntry(id: string) {
        try {
            await removeGrowthEntry(reptileId, id);
            setEntries((current) => current.filter((entry) => entry.id !== id));
            queryClient.setQueryData<DetailedReptile>(["reptile", reptileId], (current) => current && new DetailedReptile({ ...current, growth: current.growth.filter((entry) => entry.id !== id) }));
            setPageError("");
        } catch {
            setPageError("Could not delete this measurement. Try again.");
        }
    }

    return <main className="mx-auto w-full max-w-3xl pb-10 text-white">
        <header className="mb-6 border-b border-[#515151] pb-5">
            <p className="mb-2 text-sm font-medium text-[#89CFF0]">Care record</p>
            <h1 className="text-3xl font-semibold tracking-tight">Growth</h1>
            <p className="mt-1 text-sm text-[#C2C2C2]">Dated weight and length measurements for {reptile.name}.</p>
        </header>

        <div className="mb-5">
            <button type="button" onClick={openForm} className="min-h-12 w-full rounded-xl bg-[#89CFF0] px-5 py-3 text-left font-semibold text-[#252525] hover:bg-[#b0e0f5] sm:w-auto">Add weight entry</button>
        </div>

        <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="sm" aria-labelledby="growth-form-title" sx={{ "& .MuiDialog-container": { alignItems: { xs: "flex-end", sm: "center" } }, "& .MuiDialog-paper": { m: { xs: 0, sm: 2 }, width: "100%", maxHeight: { xs: "90dvh", sm: "calc(100% - 64px)" }, borderRadius: { xs: "16px 16px 0 0", sm: "12px" }, backgroundColor: "#303030", color: "white" } }}>
            <div className="p-5 sm:p-6">
            <h2 id="growth-form-title" className="mb-4 text-xl font-semibold">{editing ? "Edit measurement" : "Add weight entry"}</h2>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <label className="grid min-h-16 gap-1 text-sm text-[#C2C2C2]">Date<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-h-11 rounded-lg border border-[#515151] bg-[#252525] px-3 text-white focus-visible:outline-[#89CFF0]" /></label>
                <label className="grid min-h-16 gap-1 text-sm text-[#C2C2C2]">Weight (g)<input required min="0" step="any" type="number" value={weight} onChange={(event) => setWeight(event.target.value)} className="min-h-11 rounded-lg border border-[#515151] bg-[#252525] px-3 text-white focus-visible:outline-[#89CFF0]" /></label>
                <label className="grid min-h-16 gap-1 text-sm text-[#C2C2C2]">Length (cm)<input required min="0" step="any" type="number" value={length} onChange={(event) => setLength(event.target.value)} className="min-h-11 rounded-lg border border-[#515151] bg-[#252525] px-3 text-white focus-visible:outline-[#89CFF0]" /></label>
                <div className="flex flex-wrap items-end gap-3">
                    <button className="min-h-11 rounded-lg bg-[#89CFF0] px-5 py-2 font-semibold text-[#252525] hover:bg-[#b0e0f5] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isSaving}>{isSaving ? "Saving…" : editing ? "Save changes" : "Add weight entry"}</button>
                    <button type="button" onClick={closeForm} disabled={isSaving} className="min-h-11 rounded-lg border border-[#89CFF0] px-4 py-2 hover:bg-white/5 disabled:opacity-60">Cancel</button>
                    {isSaving && <span role="status" className="text-sm text-[#C2C2C2]">Saving measurement…</span>}
                </div>
            </form>
            {formError && <p role="alert" className="mt-3 rounded-lg border border-[#89CFF0] bg-[#89CFF0]/10 px-3 py-2 text-sm text-[#FFBABA]">{formError}</p>}
            </div>
        </Dialog>

        {pageError && <p role="alert" className="mb-4 rounded-lg border border-[#89CFF0] bg-[#89CFF0]/10 px-3 py-2 text-sm text-[#FFBABA]">{pageError}</p>}

        <section aria-labelledby="history-title">
            <h2 id="history-title" className="mb-3 text-xl font-semibold">Measurement history</h2>
            {entries.length === 0 ? <p className="rounded-xl border border-dashed border-[#89CFF0] bg-[#303030] p-4 text-sm text-[#C2C2C2]">Your dated measurements will appear here.</p> : <ul className="divide-y divide-[#515151] rounded-xl border border-[#89CFF0] bg-[#303030]">{entries.map((entry) => <li key={entry.id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div><p className="font-medium">{entry.weight_grams} g · {entry.length_cm} cm</p><p className="mt-1 text-sm text-[#C2C2C2]">{prettyDate(entry.date)}</p></div><div className="flex gap-2"><button onClick={() => edit(entry)} className="min-h-11 rounded-md px-3 py-2 text-sm font-medium text-[#89CFF0] hover:bg-white/5" aria-label={`Edit measurement from ${prettyDate(entry.date)}`}>Edit</button><button onClick={() => void deleteEntry(entry.id)} className="min-h-11 rounded-md px-3 py-2 text-sm text-[#C2C2C2] hover:bg-white/5" aria-label={`Delete measurement from ${prettyDate(entry.date)}`}>Delete</button></div></li>)}</ul>}
        </section>
        <section aria-labelledby="latest-title" className="mt-8">
            <h2 id="latest-title" className="mb-3 text-xl font-semibold">Latest measurement</h2>
            {latest ? <div className="rounded-xl border border-[#89CFF0] bg-[#303030] p-4 sm:p-5">
                <p className="mb-3 text-sm text-[#C2C2C2]">Recorded {prettyDate(latest.date)}</p>
                <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-[#C2C2C2]">Weight</p><p className="mt-1 text-xl font-semibold">{latest.weight_grams} g</p></div>
                    <div><p className="text-sm text-[#C2C2C2]">Length</p><p className="mt-1 text-xl font-semibold">{latest.length_cm} cm</p></div>
                </div>
            </div> : <p className="rounded-xl border border-dashed border-[#89CFF0] bg-[#303030] p-4 text-sm text-[#C2C2C2]">No measurements recorded yet. Add the first one above.</p>}
        </section>
    </main>;
}
