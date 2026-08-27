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
        return <div className="p-4">Loading...</div>;
    }

    if (reptileQuery.isError || !reptileQuery.data) {
        return <div className="p-4">Failed to load reptile.</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <DetailedReptileContext.Provider value={reptileQuery.data}>
                <div className="page h-full p-4">
                    <Outlet />
                </div>
                <UI.nav.reptile />
            </DetailedReptileContext.Provider>
        </div>
    );
}