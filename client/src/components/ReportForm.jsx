
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

    // Capture current GPS location
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

                // Save GPS coordinates separately
                setLatitude(String(lat));
                setLongitude(String(lng));

                // Do NOT put GPS coordinates inside the address field
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
                <span className="section-tag">REPORT AN ISSUE</span>
                <h2>Make Your Voice Heard</h2>
                <p>
                    Help improve your community by reporting civic problems around you.
                </p>
            </div>

            <form className="report-form" onSubmit={handleSubmit}>

                <div className="form-group">
                    <label htmlFor="category">Select Issue Category</label>

                    <select
                        id="category"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        required
                    >
                        <option value="">Choose a category</option>
                        <option value="Road Damage">Road Damage</option>
                        <option value="Street Light">Street Light</option>
                        <option value="Garbage">Garbage</option>
                        <option value="Water Supply">Water Supply</option>
                        <option value="Drainage">Drainage</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Public Safety">Public Safety</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Describe the Problem</label>

                    <textarea
                        id="description"
                        placeholder="Explain the civic issue in detail..."
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows="5"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="location">Issue Location</label>

                    <input
                        id="location"
                        type="text"
                        placeholder="Enter area, street or landmark"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        required
                    />

                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation}
                    >
                        {gettingLocation
                            ? "Getting Location..."
                            : "Use My Current Location"}
                    </button>

                    {locationMessage && (
                        <p>{locationMessage}</p>
                    )}

                    {latitude !== "" && longitude !== "" && (
    <div
        style={{
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "#e8f5e9",
            borderRadius: "8px",
            color: "#1b5e20"
        }}
    >
        <p><strong>GPS Location Captured Successfully!</strong></p>

        <p>Latitude: {latitude}</p>

        <p>Longitude: {longitude}</p>
    </div>
)}
                </div>

                <div className="form-group">
                    <label htmlFor="evidence">
                        Upload Photo or Video (Optional)
                    </label>

                    <input
                        id="evidence"
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

                    {evidence && (
                        <p>Selected file: {evidence.name}</p>
                    )}

                    <small>
                        Supported formats: JPG, PNG, WEBP, MP4 and WEBM.
                        Maximum size: 20 MB.
                    </small>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="submit-btn"
                >
                    {submitting ? "Submitting Report..." : "Submit Report"}
                </button>

                {submitted && (
                    <p className="success-message">
                        Your report has been submitted successfully!
                    </p>
                )}

            </form>
        </section>
    );
}

export default ReportForm;
