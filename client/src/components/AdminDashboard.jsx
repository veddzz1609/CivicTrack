
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/reports";

function AdminDashboard({ onReportUpdated }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortOrder, setSortOrder] = useState("newest");

    async function fetchReports() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to fetch reports.");
            }

            const data = await response.json();
            setReports(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReports();
    }, []);

    async function updateStatus(id, status) {
        try {
            setUpdatingId(id);
            setError("");

            const response = await fetch(
                `${API_URL}/${id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ status })
                }
            );

            if (!response.ok) {
                throw new Error("Could not update complaint status.");
            }

            const updatedData = await response.json();

            const existingReport = reports.find(
                (report) => report.id === id
            ) || {};

            const updatedReport = {
                ...existingReport,
                ...updatedData,
                id,
                status
            };

            setReports((previousReports) =>
                previousReports.map((report) =>
                    report.id === id ? updatedReport : report
                )
            );

            // Update the main App.jsx reports state too.
            if (onReportUpdated) {
                onReportUpdated(updatedReport);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingId(null);
        }
    }

    const filteredReports = reports
        .filter((report) => {
            const search = searchTerm.toLowerCase();

            const matchesSearch =
                String(report.id).includes(search) ||
                report.category?.toLowerCase().includes(search) ||
                report.location?.toLowerCase().includes(search) ||
                report.description?.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "All" ||
                report.status === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            return sortOrder === "newest"
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt);
        });

    const totalReports = reports.length;
    const pendingReports = reports.filter(
        (report) => report.status === "Pending"
    ).length;
    const progressReports = reports.filter(
        (report) => report.status === "In Progress"
    ).length;
    const resolvedReports = reports.filter(
        (report) => report.status === "Resolved"
    ).length;

    function renderGPS(report) {
        const latitude = Number(report.latitude);
        const longitude = Number(report.longitude);

        if (
            report.latitude == null ||
            report.longitude == null ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return <p>GPS Location: Not provided</p>;
        }

        const mapURL = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

        return (
            <div className="gps-details">
                <p><strong>GPS Latitude:</strong> {latitude}</p>
                <p><strong>GPS Longitude:</strong> {longitude}</p>

                <a
                    href={mapURL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    📍 View Location on Google Maps
                </a>
            </div>
        );
    }

    function renderEvidence(report) {
        if (!report.evidenceUrl) {
            return null;
        }

        const evidenceURL = report.evidenceUrl.startsWith("http")
            ? report.evidenceUrl
            : `http://localhost:5000${report.evidenceUrl}`;

        const isVideo = /\.(mp4|webm)$/i.test(report.evidenceUrl);

        return (
            <div className="report-evidence">
                <h4>Submitted Evidence</h4>

                {isVideo ? (
                    <video
                        src={evidenceURL}
                        controls
                        width="100%"
                        style={{ maxWidth: "400px" }}
                    />
                ) : (
                    <img
                        src={evidenceURL}
                        alt="Complaint evidence"
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            borderRadius: "10px"
                        }}
                    />
                )}
            </div>
        );
    }

    if (loading) {
        return <p>Loading admin dashboard...</p>;
    }

    return (
        <section className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            <p>Manage and monitor citizen complaints.</p>

            {error && (
                <p style={{ color: "red" }}>{error}</p>
            )}

            <div className="admin-stats">
                <div className="stat-card">
                    <h3>Total Reports</h3>
                    <h2>{totalReports}</h2>
                </div>

                <div className="stat-card">
                    <h3>Pending</h3>
                    <h2>{pendingReports}</h2>
                </div>

                <div className="stat-card">
                    <h3>In Progress</h3>
                    <h2>{progressReports}</h2>
                </div>

                <div className="stat-card">
                    <h3>Resolved</h3>
                    <h2>{resolvedReports}</h2>
                </div>
            </div>

            <div className="admin-controls">
                <input
                    type="text"
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>

                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
            </div>

            <h3>Manage Complaints ({filteredReports.length})</h3>

            {filteredReports.length === 0 ? (
                <p>No complaints found.</p>
            ) : (
                <div className="admin-report-list">
                    {filteredReports.map((report) => (
                        <div className="admin-report-card" key={report.id}>
                            <h3>Report #{report.id}</h3>

                            <p>
                                <strong>Category:</strong> {report.category}
                            </p>

                            <p>
                                <strong>Description:</strong> {report.description}
                            </p>

                            <p>
                                <strong>Location:</strong> {report.location}
                            </p>

                            {renderGPS(report)}
                            {renderEvidence(report)}

                            <p>
                                <strong>Submitted:</strong>{" "}
                                {new Date(report.createdAt).toLocaleString()}
                            </p>

                            <p>
                                <strong>Current Status:</strong> {report.status}
                            </p>

                            <label>
                                Update Status:{" "}
                                <select
                                    value={report.status}
                                    disabled={updatingId === report.id}
                                    onChange={(e) =>
                                        updateStatus(report.id, e.target.value)
                                    }
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </label>

                            {updatingId === report.id && (
                                <p>Updating status...</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default AdminDashboard;
