import { Outlet, useParams } from "react-router-dom";
import useReptileData from "../../hooks/useReptileData";
import { DetailedReptileContext } from "../../context/SelectedReptileContext";

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
        <div className="p-4">
            <DetailedReptileContext.Provider value={reptileQuery.data}>
                <Outlet />
            </DetailedReptileContext.Provider>
        </div>
    );
}