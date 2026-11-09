import { ListItems } from "../components/ListItems/index.ts";
import { UI } from "../components/ui/index.ts";
import useReptiles from "../hooks/useReptiles.ts";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routers/AppRouter.tsx";
import AddReptile from "../components/forms/AddReptile";

export default function HomePage(): React.ReactNode {
    const { data, isLoading, isError } = useReptiles();
    const navigate = useNavigate();

    const RouteToReptile = (reptileID: string) => {
        navigate(ROUTES.REPTILE(reptileID))
    }


    if (isLoading || isError || !data) return <h1>Loading....</h1>
    console.log(data);

    const mappedReptiles = data.map(
        (reptile) =>
            <ListItems.Reptile reptile={reptile} RouteToReptile={() => RouteToReptile(reptile.id)} />
    );


    return <div className="p-4">
        <UI.header />
        <AddReptile />
        <div id="ReptileList" className="flex flex-col space-y-2">
            {mappedReptiles}
        </div>
    </div>
}

