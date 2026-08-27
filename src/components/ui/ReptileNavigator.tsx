import { ReactNode } from "react"
import HomeIcon from '@mui/icons-material/Home';
import ScaleIcon from '@mui/icons-material/Scale';
import SetMealIcon from '@mui/icons-material/SetMeal';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { ROUTES } from "../../routers/AppRouter";
import { NavLink } from "react-router-dom";
import { useDetailedReptileContext } from "../../context/SelectedReptileContext";

export default function ReptilNavigator() {
    const reptile = useDetailedReptileContext();

    if (!reptile) return <h1>loading...</h1>

    return <footer id="reptile-navigation" className="w-full h-20 bg-white/10">
        <nav className="w-full h-full">
            <ul className="flex flex-row w-full items-center justify-center h-full">
                <NavItem route={ROUTES.REPTILE(reptile.id)} currentRoute><HomeIcon sx={{ color: "#FF9F9F", fontSize: 36 }} /></NavItem>
                <NavItem><ScaleIcon sx={{ color: "#FF9F9F", fontSize: 36 }} /></NavItem>
                <NavItem><SetMealIcon sx={{ color: "#FF9F9F", fontSize: 36 }} /></NavItem>
                <NavItem><AccountBoxIcon sx={{ color: "#FF9F9F", fontSize: 36 }} /></NavItem>
            </ul>
        </nav>
    </footer>
}

interface NavItemProps {
    children: ReactNode | string | undefined
    currentRoute?: boolean
    route?: string
    onClick?: (routeName: string) => void
}
const NavItem = ({ children, currentRoute = false, route = "/" }: NavItemProps) => {
    const styling = currentRoute ? "bg-white/20" : ""

    return <ol className="w-full text-center flex items-center justify-center">
        <NavLink to={route} className={`hover:bg-white/20 p-1 min-w-12 min-h-12 w-fit h-fit rounded ${styling}`}>
            {children}
        </NavLink>
    </ol>
}