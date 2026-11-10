
import AdminDashboard from "./components/AdminDashboard";
import TrackReport from "./components/TrackReport";
import ComplaintMap from "./components/ComplaintMap";
import { useEffect, useState } from "react";
import ReportForm from "./components/ReportForm";
import cityImage from "./assets/hola.jpeg";
import Navbar from "./components/Navbar";
import "./App.css";

const API_URL = "https://civictrack-backend-byxs.onrender.com/api/reports";

function App() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch all reports from backend
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch(`${API_URL}/api/reports`);

                if (!response.ok) {
                    throw new Error("Failed to fetch reports");
                }

                const data = await response.json();
                setReports(data);

            } catch (err) {
                console.error(err);
                setError("Unable to load reports. Please try again.");

            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    // Add newly submitted report
    function handleReportSubmitted(newReport) {
        setReports((previousReports) => [
            newReport,
            ...previousReports
        ]);
    }

    // Update a report everywhere in the application
    function handleReportUpdated(updatedReport) {
        setReports((previousReports) =>
            previousReports.map((report) =>
                report.id === updatedReport.id
                    ? { ...report, ...updatedReport }
                    : report
            )
        );
    }

    // Display uploaded image or video
    function renderEvidence(report) {
        if (!report.evidenceUrl) {
            return null;
        }

        const evidenceURL = report.evidenceUrl.startsWith("http")
            ? report.evidenceUrl
            : `https://civictrack-backend-byxs.onrender.com${report.evidenceUrl}`;;

        const isVideo = /\.(mp4|webm)$/i.test(report.evidenceUrl);

        return (
            <div className="report-evidence">
                {isVideo ? (
                    <video
                        src={evidenceURL}
                        controls
                        preload="metadata"
                        className="evidence-media"
                    >
                        Your browser does not support video.
                    </video>
                ) : (
                    <img
                        src={evidenceURL}
                        alt={`Evidence for report ${report.id}`}
                        className="evidence-media"
                        loading="lazy"
                    />
                )}
            </div>
        );
    }

    return (
        <div>
            <Navbar />

            {/* HERO SECTION */}
            <section className="hero" id="home">
                <div className="hero-content">
                    <div className="eyebrow">
                        <span className="live-dot"></span>
                        BUILDING BETTER COMMUNITIES
                    </div>

                    <h1>
                        Your city deserves
                        <br />
                        <span>a better voice.</span>
                    </h1>

                    <p className="hero-description">
                        Report civic problems, share real evidence,
                        and track the progress of your complaints.
                        Together, we can make our cities better.
                    </p>

                    <div className="hero-actions">
                        <a href="#report" className="primary-btn">
                            Report a problem <span>↗</span>
                        </a>

                        <a href="#categories" className="secondary-btn">
                            Explore issues →
                        </a>
                    </div>

                    <div className="hero-note">
                        <span>📍</span>
                        Starting with Tanakpur, India
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="city-image-card">
                        <img
                            src={cityImage}
                            alt="Urban city infrastructure"
                            className="city-image"
                        />

                        <div className="image-overlay">
                            <span className="image-tag">
                                <span className="live-dot"></span>
                                BUILDING BETTER CITIES
                            </span>

                            <h3>
                                Every street.
                                <br />
                                Every citizen.
                                <br />
                                Every change.
                            </h3>

                            <p>
                                Small actions create stronger communities.
                            </p>
                        </div>
                    </div>

                    <div className="floating-card">
                        <div className="floating-icon">✓</div>

                        <div>
                            <strong>Every report matters</strong>
                            <p>Track progress transparently</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CATEGORIES SECTION */}
            <section className="categories" id="categories">
                <div className="section-heading">
                    <div>
                        <span className="section-tag">
                            WHAT NEEDS ATTENTION?
                        </span>

                        <h2>
                            Small reports. <span>Big changes.</span>
                        </h2>
                    </div>

                    <p>
                        Identify local problems and help bring
                        them to the attention of the right people.
                    </p>
                </div>

                <div className="category-grid">
                    <div className="category-card">
                        <span className="category-icon">🛣️</span>
                        <h3>Road damage</h3>
                        <p>Potholes, broken roads and unsafe streets.</p>
                        <span className="category-arrow">↗</span>
                    </div>

                    <div className="category-card">
                        <span className="category-icon">💡</span>
                        <h3>Streetlights</h3>
                        <p>Non-working lights and dark public spaces.</p>
                        <span className="category-arrow">↗</span>
                    </div>

                    <div className="category-card">
                        <span className="category-icon">🗑️</span>
                        <h3>Waste management</h3>
                        <p>Garbage accumulation and sanitation issues.</p>
                        <span className="category-arrow">↗</span>
                    </div>

                    <div className="category-card">
                        <span className="category-icon">💧</span>
                        <h3>Water supply</h3>
                        <p>Leaks, water shortages and drainage problems.</p>
                        <span className="category-arrow">↗</span>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="how-section" id="how-it-works">
                <span className="section-tag">
                    SIMPLE. TRANSPARENT. ACCOUNTABLE.
                </span>

                <h2>
                    From reporting to <span>resolution.</span>
                </h2>

                <div className="steps-grid">
                    <div className="step-card">
                        <span>01</span>
                        <h3>Capture</h3>
                        <p>Record the civic problem using your camera.</p>
                    </div>

                    <div className="step-card">
                        <span>02</span>
                        <h3>Locate</h3>
                        <p>Attach GPS coordinates to identify the location.</p>
                    </div>

                    <div className="step-card">
                        <span>03</span>
                        <h3>Track</h3>
                        <p>Follow the complaint and its progress.</p>
                    </div>
                </div>
            </section>

            {/* REPORT FORM */}
            <ReportForm
                onReportSubmitted={handleReportSubmitted}
            />

            {/* INTERACTIVE COMPLAINT MAP */}
            <ComplaintMap reports={reports} />

            {/* TRACK REPORT */}
            <TrackReport />

            {/* ADMIN DASHBOARD */}
            <AdminDashboard
                onReportUpdated={handleReportUpdated}
            />

            {/* LIVE REPORTS */}
            <section className="reports-section" id="reports">
                <div className="section-heading">
                    <div>
                        <span className="section-tag">
                            COMMUNITY TRANSPARENCY
                        </span>

                        <h2>
                            Reported <span>Issues.</span>
                        </h2>
                    </div>

                    <p>
                        See the civic problems reported by your community.
                    </p>
                </div>

                {loading ? (
                    <p>Loading reports...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : reports.length === 0 ? (
                    <p>
                        No reports submitted yet.
                        Be the first to report a problem!
                    </p>
                ) : (
                    <div className="reports-grid">
                        {reports.map((report) => (
                            <div
                                className="report-card"
                                key={report.id}
                            >
                                <span className="report-status">
                                    {report.status}
                                </span>

                                <h3>{report.category}</h3>
                                <p>{report.description}</p>

                                <div className="report-location">
                                    📍 {report.location}
                                </div>

                                {renderEvidence(report)}

                                <small>
                                    Submitted:{" "}
                                    {new Date(
                                        report.createdAt
                                    ).toLocaleDateString()}
                                </small>

                                <p className="report-id">
                                    Report ID: #{report.id}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <a href="#home" className="brand footer-brand">
                    Civic<span className="brand-green">Track</span>
                </a>

                <p>Your City. Your Voice. Your Impact.</p>

                <span>
                    © 2026 CivicTrack. Built for better communities.
                </span>
            </footer>
        </div>
    );
}

export default App;
