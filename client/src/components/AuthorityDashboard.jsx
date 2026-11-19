
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthorityDashboard.css";

const API_URL = "https://civictrack-backend-byxs.onrender.com";

function AuthorityDashboard() {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const token = localStorage.getItem("authorityToken");

    let authority = null;

    try {
        authority = JSON.parse(
            localStorage.getItem("authorityDetails") || "null"
        );
    } catch {
        authority = null;
    }

    // Read server response safely
    async function readResponse(response) {
        const text = await response.text();

        try {
            return text ? JSON.parse(text) : {};
        } catch {
            throw new Error(
                "Server returned an invalid response. Please try again."
            );
        }
    }

    // Fetch all complaints
    async function fetchReports() {
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/reports`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load complaints."
                );
            }

            if (!Array.isArray(data)) {
                throw new Error("Invalid complaints data received.");
            }

            setReports(data);

        } catch (err) {
            console.error("Fetch complaints error:", err);
            setError(err.message || "Unable to fetch complaints.");
        } finally {
            setLoading(false);
        }
    }

    // Check login and load complaints
    useEffect(() => {
        if (!token || !authority) {
            navigate("/authority");
            return;
        }

        fetchReports();
    }, [navigate, token]);

    // Update complaint status
    async function updateStatus(reportId, newStatus) {
        setUpdatingId(reportId);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/api/reports/${reportId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || "Status update failed."
                );
            }

            setReports((previousReports) =>
                previousReports.map((report) =>
                    report.id === reportId
                        ? { ...report, ...data.report }
                        : report
                )
            );

        } catch (err) {
            console.error("Status update error:", err);
            setError(err.message || "Unable to update status.");
        } finally {
            setUpdatingId(null);
        }
    }

    // Logout authority
    function handleLogout() {
        localStorage.removeItem("authorityToken");
        localStorage.removeItem("authorityDetails");
        navigate("/authority");
    }

    // Get evidence URL
    function getEvidenceURL(evidenceUrl) {
        if (!evidenceUrl) return "";

        return evidenceUrl.startsWith("http")
            ? evidenceUrl
            : `${API_URL}${evidenceUrl}`;
    }

    // Display uploaded image or video
    function renderEvidence(report) {
        if (!report.evidenceUrl) {
            return (
                <p className="authority-no-evidence">
                    No evidence uploaded.
                </p>
            );
        }

        const url = getEvidenceURL(report.evidenceUrl);
        const isVideo = /\.(mp4|webm)$/i.test(report.evidenceUrl);

        return isVideo ? (
            <video
                src={url}
                controls
                className="authority-evidence"
            />
        ) : (
            <img
                src={url}
                alt={`Evidence for complaint ${report.id}`}
                className="authority-evidence"
            />
        );
    }

    // Calculate complaint statistics
    const pending = reports.filter(
        (report) => report.status === "Pending"
    ).length;

    const inProgress = reports.filter(
        (report) => report.status === "In Progress"
    ).length;

    const resolved = reports.filter(
        (report) => report.status === "Resolved"
    ).length;

    return (
        <div className="authority-dashboard">

            {/* HEADER */}
            <header className="authority-header">
                <div>
                    <h1>
                        Civic<span>Track</span>
                    </h1>
                    <p>Authority Management Portal</p>
                </div>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </header>

            <main className="authority-main">

                {/* WELCOME SECTION */}
                <section className="authority-welcome">
                    <div>
                        <p>AUTHORITY DASHBOARD</p>

                        <h2>
                            Welcome, {authority?.name || "Officer"}
                        </h2>

                        <span>
                            Department: {authority?.department || "Not specified"}
                        </span>
                    </div>
                </section>

                {/* STATISTICS */}
                <section className="authority-stats">

                    <div className="authority-stat-card">
                        <span>Total Complaints</span>
                        <h2>{reports.length}</h2>
                    </div>

                    <div className="authority-stat-card pending">
                        <span>Pending</span>
                        <h2>{pending}</h2>
                    </div>

                    <div className="authority-stat-card progress">
                        <span>In Progress</span>
                        <h2>{inProgress}</h2>
                    </div>

                    <div className="authority-stat-card resolved">
                        <span>Resolved</span>
                        <h2>{resolved}</h2>
                    </div>

                </section>

                {/* COMPLAINTS SECTION */}
                <section className="authority-complaints">

                    <div className="authority-section-heading">
                        <div>
                            <h2>Citizen Complaints</h2>
                            <p>
                                Review complaints and update their progress.
                            </p>
                        </div>

                        <button onClick={fetchReports}>
                            Refresh
                        </button>
                    </div>

                    {error && (
                        <p className="authority-error">
                            {error}
                        </p>
                    )}

                    {loading ? (
                        <p className="authority-message">
                            Loading complaints...
                        </p>
                    ) : reports.length === 0 ? (
                        <p className="authority-message">
                            No complaints found.
                        </p>
                    ) : (

                        <div className="authority-report-list">

                            {reports.map((report) => (

                                <article
                                    className="authority-report-card"
                                    key={report.id}
                                >

                                    <div className="authority-report-top">
                                        <div>
                                            <span className="authority-report-id">
                                                REPORT #{report.id}
                                            </span>

                                            <h3>{report.category}</h3>
                                        </div>

                                        <span
                                            className={`authority-status ${report.status?.toLowerCase().replace(" ", "-")}`}
                                        >
                                            {report.status}
                                        </span>
                                    </div>

                                    <p className="authority-description">
                                        {report.description}
                                    </p>

                                    <p className="authority-location">
                                        Location: {report.location}
                                    </p>

                                    {report.latitude != null &&
                                        report.longitude != null && (
                                            <a
                                                href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="authority-map-link"
                                            >
                                                View on Google Maps
                                            </a>
                                        )}

                                    {renderEvidence(report)}

                                    <div className="authority-report-bottom">

                                        <small>
                                            Submitted:{" "}
                                            {new Date(
                                                report.createdAt
                                            ).toLocaleDateString()}
                                        </small>

                                        <select
                                            value={report.status}
                                            disabled={updatingId === report.id}
                                            onChange={(event) =>
                                                updateStatus(
                                                    report.id,
                                                    event.target.value
                                                )
                                            }
                                        >
                                            <option value="Pending">
                                                Pending
                                            </option>

                                            <option value="In Progress">
                                                In Progress
                                            </option>

                                            <option value="Resolved">
                                                Resolved
                                            </option>
                                        </select>

                                    </div>

                                    {updatingId === report.id && (
                                        <small>
                                            Updating status...
                                        </small>
                                    )}

                                </article>

                            ))}

                        </div>
                    )}

                </section>

            </main>

        </div>
    );
}

export default AuthorityDashboard;
