import { ListItems } from "../../components/ListItems";
import { useDetailedReptileContext } from "../../context/SelectedReptileContext";



export default function ReptileOverviewPage() {
    const detailedReptile = useDetailedReptileContext();

    const isReady = detailedReptile !== undefined;



    return <>
        <h1 className="text-3xl text-white text-center font-bold">{isReady ? detailedReptile.name : "not found"}</h1>
        {/* <ListItems.ReptileMeals recentMeals={isReady ? detailedReptile.feedings : []} /> */}
    </>
}