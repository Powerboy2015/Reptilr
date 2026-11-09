import { useState } from "react";
import { ListItems } from "../components/ListItems/index.ts";
import { UI } from "../components/ui/index.ts";
import AddReptile from "../components/forms/AddReptile.tsx";
import useReptiles from "../hooks/useReptiles.ts";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routers/AppRouter.tsx";

export default function HomePage(): React.ReactNode {
    const { data, isLoading, isError } = useReptiles();
    const navigate = useNavigate();
    const [isAddOpen, setIsAddOpen] = useState(false);

    if (isLoading) {
        return <main className="min-h-screen bg-[#252525] p-5 text-white">
            <UI.header />
            <p className="mx-auto mt-12 max-w-xl text-center text-white/80" role="status">Loading your reptiles…</p>
        </main>;
    }

    if (isError || !data) {
        return <main className="min-h-screen bg-[#252525] p-5 text-white">
            <UI.header />
            <section className="mx-auto mt-12 max-w-xl rounded-xl border border-white/15 bg-white/5 p-6 text-center" role="alert">
                <h1 className="text-xl font-semibold">Your reptiles couldn’t load</h1>
                <p className="mt-2 text-white/80">Check your connection and try again.</p>
            </section>
        </main>;
    }

    return <main className="min-h-screen bg-[#252525] px-5 pb-10 text-white sm:px-8">
        <div className="mx-auto max-w-2xl">
            <UI.header />
            <section className="mt-9" aria-labelledby="reptiles-heading">
                <div className="mb-4 flex items-baseline justify-between gap-4">
                    <h1 id="reptiles-heading" className="text-2xl font-semibold tracking-tight">Your reptiles</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-white/75">{data.length} {data.length === 1 ? "reptile" : "reptiles"}</span>
                        <button type="button" onClick={() => setIsAddOpen(true)} className="rounded-lg bg-[#FF9F9F] px-3 py-2 text-sm font-semibold text-[#252525] transition-colors hover:bg-[#ffb5b5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Add reptile</button>
                    </div>
                </div>
                {data.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/25 px-5 py-8 text-center text-white/85">No reptiles yet.</p>
                ) : (
                    <ul className="divide-y divide-white/15 overflow-hidden rounded-xl border border-white/15 bg-white/5">
                        {data.map((reptile) => (
                            <li key={reptile.id}>
                                <ListItems.Reptile reptile={reptile} RouteToReptile={() => navigate(ROUTES.REPTILE(reptile.id))} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
        {isAddOpen ? <AddReptile onClose={() => setIsAddOpen(false)} /> : null}
    </main>;
}
