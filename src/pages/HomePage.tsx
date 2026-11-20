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
        return <main className="app-shell min-h-screen px-5 text-white sm:px-8">
            <div className="mx-auto max-w-2xl"><UI.header />
                <p className="mt-12 rounded-xl border border-[#89CFF0] bg-[#303030] p-5 text-[#C2C2C2]" role="status">Loading your reptiles…</p>
            </div>
        </main>;
    }

    if (isError || !data) {
        return <main className="app-shell min-h-screen px-5 text-white sm:px-8">
            <div className="mx-auto max-w-2xl"><UI.header />
                <section className="mt-10 rounded-xl border border-[#89CFF0] bg-[#303030] p-6" role="alert">
                    <h1 className="text-2xl font-semibold">Your reptiles couldn’t load</h1>
                    <p className="mt-2 text-[#C2C2C2]">Try again in a moment.</p>
                </section>
            </div>
        </main>;
    }

    return <main className="app-shell min-h-screen px-5 pb-10 text-white sm:px-8">
        <div className="mx-auto max-w-2xl">
            <UI.header />
            <section className="mt-8" aria-labelledby="reptiles-heading">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 id="reptiles-heading" className="text-3xl font-semibold tracking-tight">Your reptiles</h1>
                        <p className="mt-2 text-sm text-[#C2C2C2]">{data.length} {data.length === 1 ? "reptile" : "reptiles"}</p>
                    </div>
                    <button type="button" onClick={() => setIsAddOpen(true)} className="min-h-11 rounded-lg bg-[#89CFF0] px-4 py-2.5 text-sm font-semibold text-[#252525] transition-colors hover:bg-[#b0e0f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89CFF0]">Add reptile</button>
                </div>
                {data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#89CFF0] bg-[#303030] px-5 py-8">
                        <h2 className="text-lg font-semibold">Start a care record</h2>
                        <p className="mt-2 max-w-sm text-sm text-[#C2C2C2]">Add your first reptile to keep its feeding and growth history in one place.</p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-3">
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
