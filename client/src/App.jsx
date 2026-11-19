
import { Routes, Route, Navigate } from "react-router-dom";

import CitizenPortal from "./CitizenPortal";
import AuthorityLogin from "./components/AuthorityLogin";
import AuthorityDashboard from "./components/AuthorityDashboard";

function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={<CitizenPortal />}
            />

            <Route
                path="/authority"
                element={<AuthorityLogin />}
            />

            <Route
                path="/authority/dashboard"
                element={<AuthorityDashboard />}
            />

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}

export default App;
