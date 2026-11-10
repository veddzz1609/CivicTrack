
import { useEffect, useMemo, useState } from "react";

import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function FitMapToReports({ positions }) {
    const map = useMap();

    useEffect(() => {
        if (positions.length === 1) {
            map.setView(positions[0], 13);
        } else if (positions.length > 1) {
            map.fitBounds(positions, {
                padding: [50, 50],
                maxZoom: 13
            });
        }
    }, [positions, map]);

    return null;
}

function ComplaintMap({ reports = [] }) {
    const [selectedStatus, setSelectedStatus] = useState("All");

    const validReports = useMemo(() => {
        return reports.filter((report) => {
            const latitude = Number(report.latitude);
            const longitude = Number(report.longitude);

            return (
                report.latitude !== null &&
                report.longitude !== null &&
                report.latitude !== undefined &&
                report.longitude !== undefined &&
                Number.isFinite(latitude) &&
                Number.isFinite(longitude) &&
                latitude >= -90 &&
                latitude <= 90 &&
                longitude >= -180 &&
                longitude <= 180
            );
        });
    }, [reports]);

    const filteredReports = useMemo(() => {
        if (selectedStatus === "All") {
            return validReports;
        }

        return validReports.filter(
            (report) => report.status === selectedStatus
        );
    }, [validReports, selectedStatus]);

    const positions = useMemo(() => {
        return filteredReports.map((report) => [
            Number(report.latitude),
            Number(report.longitude)
        ]);
    }, [filteredReports]);

    const defaultPosition = [20.5937, 78.9629];

    const getMarkerColor = (status) => {
        if (status === "Resolved") return "#16a34a";
        if (status === "In Progress") return "#eab308";
        return "#dc2626";
    };

    const statuses = ["All", "Pending", "In Progress", "Resolved"];

    return (
        <section
            id="complaint-map"
            style={{
                padding: "60px 5%",
                background: "#f8fafc"
            }}
        >
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto"
            }}>

                <div style={{ marginBottom: "25px" }}>
                    <span style={{
                        color: "#16a34a",
                        fontWeight: "700",
                        fontSize: "13px",
                        letterSpacing: "1px"
                    }}>
                        LIVE COMMUNITY MAP
                    </span>

                    <h2 style={{
                        fontSize: "32px",
                        margin: "10px 0"
                    }}>
                        Civic Issues{" "}
                        <span style={{ color: "#16a34a" }}>
                            Around You.
                        </span>
                    </h2>

                    <p style={{ color: "#64748b" }}>
                        Explore reported civic problems and their
                        geographical locations.
                    </p>

                    <p style={{
                        color: "#475569",
                        fontWeight: "600"
                    }}>
                        Showing {filteredReports.length} of {validReports.length} GPS-enabled reports
                    </p>
                </div>

                {/* STATUS FILTERS */}
                <div style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "20px"
                }}>
                    {statuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            style={{
                                padding: "10px 18px",
                                borderRadius: "25px",
                                border: "1px solid #cbd5e1",
                                background:
                                    selectedStatus === status
                                        ? "#16a34a"
                                        : "#ffffff",
                                color:
                                    selectedStatus === status
                                        ? "#ffffff"
                                        : "#334155",
                                fontWeight: "600",
                                cursor: "pointer"
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* MAP */}
                <div style={{
                    width: "100%",
                    height: "500px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid #cbd5e1",
                    position: "relative",
                    zIndex: 0
                }}>
                    <MapContainer
                        center={defaultPosition}
                        zoom={5}
                        scrollWheelZoom={true}
                        style={{
                            width: "100%",
                            height: "100%"
                        }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <FitMapToReports positions={positions} />

                        {filteredReports.map((report) => (
                            <CircleMarker
                                key={report.id}
                                center={[
                                    Number(report.latitude),
                                    Number(report.longitude)
                                ]}
                                radius={9}
                                pathOptions={{
                                    color: getMarkerColor(report.status),
                                    fillColor: getMarkerColor(report.status),
                                    fillOpacity: 0.85
                                }}
                            >
                                <Popup>
                                    <strong>{report.category}</strong>
                                    <p>{report.description}</p>
                                    <p>Location: {report.location}</p>
                                    <p>Status: {report.status}</p>
                                    <p>Report ID: #{report.id}</p>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                </div>

                <div style={{
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap",
                    marginTop: "20px",
                    fontSize: "14px"
                }}>
                    <span>🔴 Pending</span>
                    <span>🟡 In Progress</span>
                    <span>🟢 Resolved</span>
                </div>

                {filteredReports.length === 0 && (
                    <p style={{
                        marginTop: "15px",
                        color: "#64748b"
                    }}>
                        No GPS-enabled reports found for this filter.
                    </p>
                )}
            </div>
        </section>
    );
}

export default ComplaintMap;
