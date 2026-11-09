import { ReactNode } from "react"
import HomeIcon from '@mui/icons-material/Home';
import ScaleIcon from '@mui/icons-material/Scale';
import PestControlRodentIcon from '@mui/icons-material/PestControlRodent';
import PetsIcon from '@mui/icons-material/Pets';
import { ROUTES } from "../../routers/AppRouter";
import { NavLink } from "react-router-dom";
import { useDetailedReptileContext } from "../../context/SelectedReptileContext";

export default function ReptilNavigator() {
    const reptile = useDetailedReptileContext();


    if (!reptile) return <h1>loading...</h1>

    console.log(location.pathname);
    console.log(ROUTES.REPTILE(reptile.id));

    return <footer id="reptile-navigation" className="w-full h-20 border-t border-white/10 bg-[#252525]">
        <nav className="w-full h-full">
            <ul className="flex flex-row w-full items-center justify-center h-full">
                <NavItem route={ROUTES.REPTILE(reptile.id)}>
                    <HomeIcon sx={{ color: "#FF9F9F", fontSize: 36 }} />
                </NavItem>

                <NavItem route={ROUTES.STATS(reptile.id)}>
                    <ScaleIcon sx={{ color: "#FF9F9F", fontSize: 36 }} />
                </NavItem>

                <NavItem route={ROUTES.FEEDINGS(reptile.id)}>
                    <PestControlRodentIcon sx={{ color: "#FF9F9F", fontSize: 36 }} />
                </NavItem>

                <NavItem>
                    <PetsIcon sx={{ color: "#FF9F9F", fontSize: 36 }} />
                </NavItem>
            </ul>
        </nav>
    </footer>
}

interface NavItemProps {
    children: ReactNode | string | undefined
    route?: string
    onClick?: (routeName: string) => void
}
const NavItem = ({ children, route = "/" }: NavItemProps) => {
    const currentRoute = location.pathname === route;
    const styling = currentRoute ? "bg-[#FF9F9F]/20" : "";

    return <ol className="w-full text-center flex items-center justify-center">
        <NavLink to={route} className={`hover:bg-[#FF9F9F]/15 focus-visible:outline-2 focus-visible:outline-[#FF9F9F] p-1 min-w-12 min-h-12 w-fit h-fit rounded ${styling}`}>
            {children}
        </NavLink>
    </ol>
}
