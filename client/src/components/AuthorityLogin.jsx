
import "./AuthorityLogin.css";
import { useState } from "react";

const API_URL = "http://localhost:5000";

function AuthorityLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/authority/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Login failed."
                );
            }

            localStorage.setItem(
                "authorityToken",
                data.token
            );

            localStorage.setItem(
                "authorityDetails",
                JSON.stringify(data.authority)
            );

            window.location.href = "/authority/dashboard";

        } catch (err) {
            console.error("Authority login error:", err);

            setError(
                err.message || "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="authority-login-page">
            <div className="authority-login-card">

                <h1>
                    Civic<span>Track</span>
                </h1>

                <p className="authority-login-subtitle">
                    Authority Portal
                </p>

                <h2>Welcome back</h2>

                <p>
                    Sign in to manage civic complaints.
                </p>

                <form onSubmit={handleLogin}>

                    <label htmlFor="authority-email">
                        Official Email
                    </label>

                    <input
                        id="authority-email"
                        type="email"
                        placeholder="Enter your official email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                    />

                    <label htmlFor="authority-password">
                        Password
                    </label>

                    <input
                        id="authority-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                    />

                    {error && (
                        <p className="authority-login-error">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                </form>

                <a
                    href="/"
                    className="authority-back-link"
                >
                    ← Back to Citizen Portal
                </a>

            </div>
        </div>
    );
}

export default AuthorityLogin;
