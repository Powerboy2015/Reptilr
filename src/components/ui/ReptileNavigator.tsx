import HomeIcon from "@mui/icons-material/Home";
import ScaleIcon from "@mui/icons-material/Scale";
import PestControlRodentIcon from "@mui/icons-material/PestControlRodent";
import { NavLink } from "react-router-dom";
import { useDetailedReptileContext } from "../../context/SelectedReptileContext";
import { ROUTES } from "../../routers/AppRouter";

export default function ReptileNavigator() {
    const reptile = useDetailedReptileContext();
    if (!reptile) return null;

    const destinations = [
        { label: "Overview", icon: HomeIcon, route: ROUTES.REPTILE },
        { label: "Feedings", icon: PestControlRodentIcon, route: ROUTES.FEEDINGS },
        { label: "Growth", icon: ScaleIcon, route: ROUTES.STATS },
    ] as const;

    return <footer id="reptile-navigation" className="reptile-nav fixed bottom-0 left-0 z-10 h-[4.75rem] w-full border-t border-[#515151] bg-[#252525]">
        <nav aria-label={`${reptile.name} care pages`} className="h-full">
            <ul className="reptile-nav-list flex h-full w-full items-center justify-around">
                {destinations.map(({ label, icon: Icon, route }) => (
                    <li key={label} className="reptile-nav-item flex h-full flex-1 items-center justify-center">
                        <NavLink
                            to={route(reptile.id)}
                            end={label === "Overview"}
                            className={({ isActive }) => `reptile-nav-link relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg px-3 text-xs font-medium transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#89CFF0] ${isActive ? "text-[#89CFF0]" : "text-[#C2C2C2]"}`}
                        >
                            {({ isActive }) => <>
                                {isActive && <span className="absolute top-0 h-1 w-8 rounded-b bg-[#89CFF0]" aria-hidden="true" />}
                                <Icon aria-hidden="true" sx={{ fontSize: 23 }} />
                                <span>{label}</span>
                            </>}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    </footer>;
}
