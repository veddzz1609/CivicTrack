
import { Routes, Route, Navigate } from "react-router-dom";

import CitizenPortal from "./CitizenPortal";
import AuthorityLogin from "./components/AuthorityLogin";
import AuthorityDashboard from "./components/AuthorityDashboard";

function App() {
    return (
        <Routes>
            {/* Citizen Portal */}
            <Route
                path="/"
                element={<CitizenPortal />}
            />

            {/* Authority Login */}
            <Route
                path="/authority"
                element={<AuthorityLogin />}
            />

            {/* Authority Dashboard */}
            <Route
                path="/authority/dashboard"
                element={<AuthorityDashboard />}
            />

            {/* Redirect unknown routes */}
            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}

export default App;