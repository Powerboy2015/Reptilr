import { useState } from "react";
import useAddReptile from "../../hooks/useAddReptile.ts";

interface AddReptileProps {
    onClose: () => void;
}

const inputClassName = "mt-1 w-full rounded-lg border border-white/20 bg-[#252525] px-3 py-2.5 text-white outline-none focus:border-[#FF9F9F] focus:ring-2 focus:ring-[#FF9F9F]/30";

export default function AddReptile({ onClose }: AddReptileProps) {
    const [values, setValues] = useState({
        name: "",
        species: "",
        birth_date: "",
        weight_grams: "",
        length_cm: "",
        last_shed: "",
    });
    const [submitError, setSubmitError] = useState(false);
    const { mutateAsync, isPending } = useAddReptile();

    function updateField(field: keyof typeof values, value: string) {
        setValues((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitError(false);
        try {
            await mutateAsync({
                name: values.name.trim(),
                species: values.species.trim(),
                ...(values.birth_date ? { birth_date: values.birth_date } : {}),
                ...(values.weight_grams ? { weight_grams: Number(values.weight_grams) } : {}),
                ...(values.length_cm ? { length_cm: Number(values.length_cm) } : {}),
                ...(values.last_shed.trim() ? { last_shed: values.last_shed.trim() } : {}),
            });
            onClose();
        } catch {
            setSubmitError(true);
            return;
        }
    }

    return <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-reptile-title"
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-5"
        onClick={(event) => {
            if (event.target === event.currentTarget && !isPending) onClose();
        }}
        onKeyDown={(event) => {
            if (event.key === "Escape" && !isPending) onClose();
        }}
    >
        <section className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/15 bg-[#302d2d] p-5 text-white shadow-2xl sm:rounded-2xl sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2 id="add-reptile-title" className="text-2xl font-semibold">Add a reptile</h2>
                    <p className="mt-1 text-sm text-white/70">Start a care record for your new reptile.</p>
                </div>
                <button type="button" onClick={onClose} disabled={isPending} aria-label="Close dialog" className="rounded-lg px-3 py-2 text-xl text-white/75 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#FF9F9F] disabled:opacity-50">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-white/85">
                        Name <span className="text-[#FF9F9F]">*</span>
                        <input autoFocus required maxLength={80} className={inputClassName} name="name" value={values.name} onChange={(event) => updateField("name", event.target.value)} />
                    </label>
                    <label className="text-sm font-medium text-white/85">
                        Species <span className="text-[#FF9F9F]">*</span>
                        <input required maxLength={80} className={inputClassName} name="species" value={values.species} onChange={(event) => updateField("species", event.target.value)} />
                    </label>
                    <label className="text-sm font-medium text-white/85">
                        Birthday <span className="font-normal text-white/50">Optional</span>
                        <input type="date" className={inputClassName} name="birth_date" value={values.birth_date} onChange={(event) => updateField("birth_date", event.target.value)} />
                    </label>
                    <label className="text-sm font-medium text-white/85">
                        Weight in grams <span className="font-normal text-white/50">Optional</span>
                        <input type="number" min="0" step="any" className={inputClassName} name="weight_grams" value={values.weight_grams} onChange={(event) => updateField("weight_grams", event.target.value)} />
                    </label>
                    <label className="text-sm font-medium text-white/85">
                        Length in cm <span className="font-normal text-white/50">Optional</span>
                        <input type="number" min="0" step="any" className={inputClassName} name="length_cm" value={values.length_cm} onChange={(event) => updateField("length_cm", event.target.value)} />
                    </label>
                    <label className="text-sm font-medium text-white/85">
                        Last shed <span className="font-normal text-white/50">Optional</span>
                        <input className={inputClassName} name="last_shed" placeholder="Date or note" value={values.last_shed} onChange={(event) => updateField("last_shed", event.target.value)} />
                    </label>
                </div>

                {submitError ? <p role="alert" className="rounded-lg border border-red-300/30 bg-red-950/40 px-3 py-2 text-sm text-red-100">Couldn’t add this reptile. Try again.</p> : null}

                <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                    <button type="button" onClick={onClose} disabled={isPending} className="rounded-lg px-4 py-2.5 font-medium text-white/75 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white disabled:opacity-50">Cancel</button>
                    <button type="submit" disabled={isPending} className="rounded-lg bg-[#FF9F9F] px-5 py-2.5 font-semibold text-[#252525] transition-colors hover:bg-[#ffb5b5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60">{isPending ? "Adding…" : "Add reptile"}</button>
                </div>
            </form>
        </section>
    </div>;
}
