
import { useState } from "react";

function ReportForm({ onReportSubmitted }) {
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [evidence, setEvidence] = useState(null);
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [locationMessage, setLocationMessage] = useState("");

    function getCurrentLocation() {
        if (!navigator.geolocation) {
            setLocationMessage("GPS is not supported by your browser.");
            return;
        }

        setGettingLocation(true);
        setLocationMessage("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setLatitude(String(lat));
                setLongitude(String(lng));
                setLocationMessage("GPS location captured successfully!");
                setGettingLocation(false);
            },
            (error) => {
                let message = "Could not get your location.";

                if (error.code === 1) {
                    message = "Location permission denied. Please allow location access.";
                } else if (error.code === 2) {
                    message = "Your location is currently unavailable.";
                } else if (error.code === 3) {
                    message = "Location request timed out. Try again.";
                }

                setLocationMessage(message);
                setGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (submitting) return;

        setSubmitting(true);
        setSubmitted(false);

        const formData = new FormData();

        formData.append("category", category);
        formData.append("description", description);
        formData.append("location", location);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);

        if (evidence) {
            formData.append("evidence", evidence);
        }

        try {
            const response = await fetch(
                "https://civictrack-backend-byxs.onrender.com/api/reports",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Report submission failed!"
                );
            }

            console.log("Submitted report:", data.report);

            if (onReportSubmitted) {
                onReportSubmitted(data.report);
            }

            setSubmitted(true);
            setCategory("");
            setDescription("");
            setLocation("");
            setEvidence(null);
            setLatitude("");
            setLongitude("");
            setLocationMessage("");

            event.target.reset();

        } catch (error) {
            console.error("Error submitting report:", error);
            alert(error.message || "Backend server is not responding!");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="report-section" id="report">

            <div className="report-heading">
                <span className="section-tag">
                    <span className="tag-dot"></span>
                    CIVIC VOICE • COMMUNITY ACTION
                </span>

                <h2>
                    Make Your Voice <span>Heard.</span>
                </h2>

                <p>
                    Every small report can make a big difference.
                    Help us build a cleaner, safer and better city.
                </p>
            </div>

            <div className="report-form-wrapper">

                <div className="form-top-bar">
                    <div>
                        <span className="form-step">REPORT AN ISSUE</span>
                        <h3>Submit Your Report</h3>
                        <p>Share the details below to help us take action.</p>
                    </div>

                    <div className="form-icon">✦</div>
                </div>

                <form className="report-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="category">
                            Issue Category <span className="required-star">*</span>
                        </label>

                        <select
                            id="category"
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            required
                        >
                            <option value="">Choose the type of issue</option>
                            <option value="Road Damage">Road Damage</option>
                            <option value="Street Light">Street Light</option>
                            <option value="Garbage">Garbage</option>
                            <option value="Water Supply">Water Supply</option>
                            <option value="Drainage">Drainage</option>
                            <option value="Electricity">Electricity</option>
                            <option value="Public Safety">Public Safety</option>
                            <option value="Other">Other</option>
                        </select>

                        <small>Select the category that best describes the problem.</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">
                            Describe the Problem <span className="required-star">*</span>
                        </label>

                        <textarea
                            id="description"
                            placeholder="Tell us what happened, where it happened and how it affects the community..."
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows="5"
                            required
                        />

                        <small>Provide as much useful detail as possible.</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">
                            Issue Location <span className="required-star">*</span>
                        </label>

                        <input
                            id="location"
                            type="text"
                            placeholder="Enter area, street, locality or landmark"
                            value={location}
                            onChange={(event) => setLocation(event.target.value)}
                            required
                        />

                        <button
                            type="button"
                            className="location-btn"
                            onClick={getCurrentLocation}
                            disabled={gettingLocation}
                        >
                            <span className="location-icon">⌖</span>
                            {gettingLocation
                                ? "Getting your location..."
                                : "Use My Current Location"}
                        </button>

                        {locationMessage && (
                            <p className={`location-message ${
                                latitude && longitude ? "location-success" : "location-error"
                            }`}>
                                {locationMessage}
                            </p>
                        )}

                        {latitude !== "" && longitude !== "" && (
                            <div className="gps-details">
                                <div className="gps-heading">
                                    <span>✓</span>
                                    GPS Coordinates Captured
                                </div>

                                <p>Latitude: <strong>{latitude}</strong></p>
                                <p>Longitude: <strong>{longitude}</strong></p>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="evidence">
                            Supporting Evidence
                            <span className="optional-label">OPTIONAL</span>
                        </label>

                        <div className="evidence-upload-box">
                            <div className="upload-icon">↑</div>

                            <div className="upload-content">
                                <strong>Attach a photo or video</strong>
                                <p>Choose evidence from your device to support your report.</p>

                                <label htmlFor="evidence" className="upload-browse-btn">
                                    Browse Files
                                </label>
                            </div>

                            <input
                                id="evidence"
                                className="evidence-input"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                                onChange={(event) => {
                                    const file = event.target.files[0];

                                    if (file && file.size > 20 * 1024 * 1024) {
                                        alert("File size must not exceed 20 MB.");
                                        event.target.value = "";
                                        setEvidence(null);
                                        return;
                                    }

                                    setEvidence(file || null);
                                }}
                            />
                        </div>

                        {evidence && (
                            <div className="selected-file">
                                <span>✓</span>
                                <span>Selected: {evidence.name}</span>
                            </div>
                        )}

                        <small>
                            JPG, PNG, WEBP, MP4 and WEBM. Maximum file size: 20 MB.
                        </small>
                    </div>

                    <div className="form-submit-area">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="submit-btn"
                        >
                            {submitting ? "Submitting Your Report..." : "Submit Report"}
                            {!submitting && <span>→</span>}
                        </button>

                        <p className="form-privacy-note">
                            Your report helps make your community better.
                        </p>
                    </div>

                    {submitted && (
                        <div className="success-message">
                            <span>✓</span>
                            Your report has been submitted successfully!
                        </div>
                    )}

                </form>
            </div>
        </section>
    );
}

export default ReportForm;
