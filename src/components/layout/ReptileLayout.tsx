import { Link, Outlet, useParams } from "react-router-dom";
import useReptileData from "../../hooks/useReptileData";
import { DetailedReptileContext } from "../../context/SelectedReptileContext";
import { UI } from "../ui";

function getReptileID() {
    const params = useParams();
    const reptileID = params.reptileID;
    if (!reptileID) throw new Error("Could not find reptileID");
    return reptileID;
}

export default function ReptileLayout() {
    const reptileID = getReptileID();
    const reptileQuery = useReptileData(reptileID);

    if (reptileQuery.isLoading) {
        return <div className="app-shell min-h-dvh p-4 text-white" role="status">Loading reptile…</div>;
    }
    if (reptileQuery.isError || !reptileQuery.data) {
        return <div className="app-shell min-h-dvh p-4 text-white" role="alert">Failed to load reptile.</div>;
    }

    return <div className="app-shell reptile-layout-row flex min-h-dvh flex-col text-white">
        <DetailedReptileContext.Provider value={reptileQuery.data}>
            <div className="page min-h-0 flex-1 overflow-auto px-4 pt-4 sm:px-6 md:px-8">
                <div className="mx-auto mb-6 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 border-b border-[#515151] pb-4">
                    <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-[#89CFF0] hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#89CFF0]">
                        <span aria-hidden="true" className="text-xl">‹</span> Your reptiles
                    </Link>
                    <p className="text-sm text-[#C2C2C2]">{reptileQuery.data.name} <span className="text-white/40">·</span> {reptileQuery.data.species || "Species not recorded"}</p>
                </div>
                <Outlet />
            </div>
            <UI.nav.reptile />
        </DetailedReptileContext.Provider>
    </div>;
}
