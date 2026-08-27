import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ReptileLayout from "../components/layout/ReptileLayout";
import ReptileOverviewPage from "../pages/Reptile/ReptileOverviewPage";
import ReptileFeedingPage from "../pages/Reptile/ReptileFeedingPage";
import ReptileStatPage from "../pages/Reptile/ReptileStatPage";

const APP_ROUTES = {
    HOME: "/",
    REPTILE: "/reptile/:reptileID",
    FEEDINGS: "/reptile/:reptileID/feedings",
    STATS: "/reptile/:reptileID/stats",
    INFO: "/reptile/:reptileID/info"
}

export const ROUTES = {
    HOME: "/",
    REPTILE: (reptileID: string) => `/reptile/${reptileID}`,
    FEEDINGS: (reptileID: string) => `/reptile/${reptileID}/feedings`,
    STATS: (reptileID: string) => `/reptile/${reptileID}/stats`,
    INFO: (reptileID: string) => `/reptile/${reptileID}/info`
}

export default function AppRouter(): React.ReactNode {
    return <BrowserRouter>
        <Routes>
            <Route path={APP_ROUTES.HOME} element={<HomePage />} />

            <Route path={APP_ROUTES.REPTILE} element={<ReptileLayout />}>
                <Route index element={<ReptileOverviewPage />} />
                <Route path={APP_ROUTES.FEEDINGS} element={<ReptileFeedingPage />} />
                <Route path={APP_ROUTES.STATS} element={<ReptileStatPage />} />
            </Route>
        </Routes>
    </BrowserRouter>
}