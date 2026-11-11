
import { useState } from "react";

function TrackReport() {
    const [reportId, setReportId] = useState("");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleTrack(event) {
        event.preventDefault();

        setLoading(true);
        setError("");
        setReport(null);

        try {
            const response = await fetch(
                `https://civictrack-backend-byxs.onrender.com/api/reports/${reportId}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Report not found.");
            }

            setReport(data.report);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="track-section" id="track">

            <div className="track-heading">
                <span className="section-tag">STAY UPDATED</span>
                <h2>Track your report</h2>
                <p>
                    Enter your report ID to check the latest status
                    of your civic complaint.
                </p>
            </div>

            <div className="track-search-card">
                <div className="track-search-label">
                    <span className="track-search-icon">⌕</span>
                    <div>
                        <h3>Find your complaint</h3>
                        <p>Enter the unique ID you received after submitting your report.</p>
                    </div>
                </div>

                <form className="track-form" onSubmit={handleTrack}>
                    <div className="track-input-wrapper">
                        <span className="track-input-icon">#</span>
                        <input
                            type="number"
                            min="1"
                            placeholder="Enter your Report ID"
                            value={reportId}
                            onChange={(event) => setReportId(event.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Searching..." : "Track Complaint"}
                        {!loading && <span> →</span>}
                    </button>
                </form>

                <p className="track-search-hint">
                    <span>🔒</span> Your complaint details are retrieved securely.
                </p>
            </div>

            {error && (
                <p className="track-error">{error}</p>
            )}

            {report && (
                <div className="tracked-report">
                    <h3>Report Details</h3>

                    <p><strong>Report ID:</strong> CT-{String(report.id).padStart(4, "0")}</p>
                    <p><strong>Category:</strong> {report.category}</p>
                    <p><strong>Description:</strong> {report.description}</p>
                    <p><strong>Location:</strong> {report.location}</p>

                    <div className="status-timeline">
                        <h3>Report Progress</h3>

                        {["Pending", "In Progress", "Resolved"].map((status, index) => {
                            const statusOrder = {
                                "Pending": 0,
                                "In Progress": 1,
                                "Resolved": 2
                            };

                            const currentStep = statusOrder[report.status] ?? 0;
                            const completed = index <= currentStep;
                            const active = index === currentStep;

                            return (
                                <div className="timeline-step" key={status}>
                                    <div className="timeline-marker">
                                        <span className={completed ? "completed" : ""}>
                                            {completed ? "✓" : ""}
                                        </span>
                                    </div>

                                    <div className="timeline-content">
                                        <h4>{status}</h4>

                                        <p>
                                            {index === 0 && "Your report has been submitted."}
                                            {index === 1 && "Work on your reported issue is in progress."}
                                            {index === 2 && "The reported issue has been resolved."}
                                        </p>

                                        {active && (
                                            <span className="current-status">
                                                Current Status
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <p>
                        <strong>Submitted:</strong>{" "}
                        {new Date(report.createdAt).toLocaleString()}
                    </p>
                </div>
            )}
        </section>
    );
}

export default TrackReport;
