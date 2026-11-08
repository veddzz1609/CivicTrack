
import { useState } from "react";

function ReportForm({ onReportSubmitted }) {
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [evidence, setEvidence] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);

        const reportData = {
            category,
            description,
            location
        };

        try {
            const response = await fetch(
                "http://localhost:5000/api/reports",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(reportData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Report submission failed!");
                return;
            }

            console.log("Submitted report:", data.report);

            onReportSubmitted(data.report);

            setSubmitted(true);
            setCategory("");
            setDescription("");
            setLocation("");
            setEvidence(null);

        } catch (error) {
            console.error("Error submitting report:", error);
            alert("Backend server is not responding!");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="report-section" id="report">

            <div className="report-heading">
                <span className="section-tag">
                    MAKE YOUR VOICE COUNT
                </span>

                <h2>Report a civic issue</h2>

                <p>
                    Tell us what's happening in your neighbourhood.
                    Together, we can make a difference.
                </p>
            </div>

            {submitted ? (
                <div className="success-message">
                    <h2>Report submitted successfully!</h2>

                    <p>
                        Your report has been saved to our database.
                        You can now track it in the reports section.
                    </p>

                    <button onClick={() => setSubmitted(false)}>
                        Submit another report
                    </button>
                </div>
            ) : (
                <form
                    className="report-form"
                    onSubmit={handleSubmit}
                >

                    <label>Issue category</label>

                    <select
                        value={category}
                        onChange={(event) =>
                            setCategory(event.target.value)
                        }
                        required
                    >
                        <option value="">Select an issue</option>
                        <option value="Road damage">Road damage</option>
                        <option value="Streetlights">Streetlights</option>
                        <option value="Garbage">Garbage</option>
                        <option value="Water supply">Water supply</option>
                        <option value="Drainage">Drainage</option>
                        <option value="Other">Others</option>
                    </select>

                    <label>Describe the problem</label>

                    <textarea
                        placeholder="Explain what happened..."
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                        required
                        rows="5"
                    />

                    <label>Location</label>

                    <input
                        type="text"
                        placeholder="Enter your area or address"
                        value={location}
                        onChange={(event) =>
                            setLocation(event.target.value)
                        }
                        required
                    />

                    <label>Upload photo or video evidence</label>

                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(event) =>
                            setEvidence(event.target.files[0])
                        }
                    />

                    <button
                        type="submit"
                        className="submit-report"
                        disabled={submitting}
                    >
                        {submitting ? "Submitting..." : "Submit Report →"}
                    </button>

                </form>
            )}

        </section>
    );
}

export default ReportForm;

