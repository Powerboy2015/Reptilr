import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ReptileLayout from "../components/layout/ReptileLayout";
import ReptileOverviewPage from "../pages/Reptile/ReptileOverviewPage";
import ReptileFeedingPage from "../pages/Reptile/ReptileFeedingPage";

const APP_ROUTES = {
    HOME: "/",
    REPTILE: "/reptile/:reptileID",
    FEEDINGS: "/reptile/:reptileID/feedings"
}

export const ROUTES = {
    HOME: "/",
    REPTILE: (reptileID: string) => `/reptile/${reptileID}`
}

export default function AppRouter(): React.ReactNode {
    return <BrowserRouter>
        <Routes>
            <Route path={APP_ROUTES.HOME} element={<HomePage />} />

            <Route path={APP_ROUTES.REPTILE} element={<ReptileLayout />}>
                <Route index element={<ReptileOverviewPage />} />
                <Route path={APP_ROUTES.FEEDINGS} element={<ReptileFeedingPage />} />
            </Route>
        </Routes>
    </BrowserRouter>
}