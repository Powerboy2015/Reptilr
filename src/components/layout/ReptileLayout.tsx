import { Outlet, useParams } from "react-router-dom";
import useReptileData from "../../hooks/useReptileData";
import { DetailedReptileContext } from "../../context/SelectedReptileContext";
import { UI } from "../ui";

function getReptileID() {
    const params = useParams();
    const reptileID = params.reptileID;

    if (!reptileID) {
        throw new Error("Could not find reptileID");
    }
    else return reptileID;

}

export default function ReptileLayout() {
    const reptileID = getReptileID();
    const reptileQuery = useReptileData(reptileID);

    if (reptileQuery.isLoading) {
        return <div className="min-h-dvh bg-[#252525] p-4 text-white" role="status">Loading...</div>;
    }

    if (reptileQuery.isError || !reptileQuery.data) {
        return <div className="min-h-dvh bg-[#252525] p-4 text-white" role="alert">Failed to load reptile.</div>;
    }

    return (
        <div className="flex min-h-dvh flex-col bg-[#252525] text-white">
            <DetailedReptileContext.Provider value={reptileQuery.data}>
                <div className="page h-full p-4 overflow-auto">
                    <Outlet />
                </div>
                <UI.nav.reptile />
            </DetailedReptileContext.Provider>
        </div>
    );
}
