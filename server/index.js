
const express = require("express");
const cors = require("cors");
const prisma = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authorityRoutes = require("./routes/authorityRoutes");
const authenticateAuthority = require("./middleware/authMiddleware");

const app = express();

// ========================================
// DEPARTMENT MAPPING
// ========================================

const categoryDepartmentMap = {
    "road damage": "road maintenance",
    "street light": "electricity",
    "electricity": "electricity",
    "water supply": "water supply",
    "garbage": "sanitation",
    "drainage": "sanitation",
    "hygiene": "sanitation",
    "public safety": "public safety",
    "others": "general administration"
};

function normalizeDepartment(department) {
    return department
        .trim()
        .toLowerCase()
        .replace(/\s+department$/, "");
}

function officerCanAccessReport(report, officerDepartment) {
    const category = report.category.trim().toLowerCase();
    const reportDepartment = categoryDepartmentMap[category];

    return (
        reportDepartment === normalizeDepartment(officerDepartment)
    );
}


app.use(cors());
app.use(express.json());
app.use("/api/authority", authorityRoutes);

// ========================================
// 1. FILE UPLOAD CONFIGURATION
// ========================================

const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(
            null,
            uniqueName + path.extname(file.originalname).toLowerCase()
        );
    }
});

const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm"
];

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, PNG, WEBP, MP4 and WEBM files are allowed."
            )
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});

// Make uploaded files accessible
app.use("/uploads", express.static(uploadFolder));

// ========================================
// 2. HOME ROUTE
// ========================================

app.get("/", (req, res) => {
    res.send("CivicTrack API is running!");
});

// ========================================
// 3. GET ALL REPORTS
// ========================================

app.get("/api/reports", async (req, res) => {
    try {
        const reports = await prisma.report.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });

        res.json(reports);

    } catch (error) {
        console.error("Error fetching reports:", error);

        res.status(500).json({
            message: "Could not fetch reports."
        });
    }
});

// ========================================
// 4. GET A SINGLE REPORT
// ========================================

app.get("/api/reports/:id", async (req, res) => {
    try {
        const reportId = Number(req.params.id);

        if (!Number.isInteger(reportId) || reportId <= 0) {
            return res.status(400).json({
                message: "Invalid report ID."
            });
        }

        const report = await prisma.report.findUnique({
            where: {
                id: reportId
            }
        });

        if (!report) {
            return res.status(404).json({
                message: "Report not found."
            });
        }

        res.json({
            message: "Report found successfully!",
            report
        });

    } catch (error) {
        console.error("Error tracking report:", error);

        res.status(500).json({
            message: "Could not track report."
        });
    }
});

// ========================================
// 5. UPDATE REPORT STATUS
// ========================================


// ========================================
// 5. UPDATE REPORT STATUS
// ========================================

app.patch(
    "/api/reports/:id/status",
    authenticateAuthority,
    async (req, res) => {
        try {
            const reportId = Number(req.params.id);
            const { status } = req.body;

            const allowedStatuses = [
                "Pending",
                "In Progress",
                "Resolved"
            ];

            if (!Number.isInteger(reportId) || reportId <= 0) {
                return res.status(400).json({
                    message: "Invalid report ID."
                });
            }

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid status."
                });
            }

            // Find the complaint first
            const existingReport = await prisma.report.findUnique({
                where: {
                    id: reportId
                }
            });

            if (!existingReport) {
                return res.status(404).json({
                    message: "Report not found."
                });
            }

            // Verify that the complaint belongs to this officer's department
            if (
                !officerCanAccessReport(
                    existingReport,
                    req.authorityDepartment
                )
            ) {
                return res.status(403).json({
                    message: "Access denied. This complaint belongs to another department."
                });
            }

            // Update the complaint status
            const updatedReport = await prisma.report.update({
                where: {
                    id: reportId
                },
                data: {
                    status
                }
            });

            return res.json({
                message: "Report status updated successfully!",
                report: updatedReport
            });

        } catch (error) {
            console.error("Error updating report:", error);

            res.status(500).json({
                message: "Could not update report status."
            });
        }
    }
);

// ========================================
// 6. DELETE A SPECIFIC REPORT
// ========================================


// ========================================
// 6. DELETE A SPECIFIC REPORT
// ========================================

app.delete(
    "/api/reports/:id",
    authenticateAuthority,
    async (req, res) => {
        try {
            const reportId = Number(req.params.id);

            if (!Number.isInteger(reportId) || reportId <= 0) {
                return res.status(400).json({
                    message: "Invalid report ID."
                });
            }

            const existingReport = await prisma.report.findUnique({
                where: {
                    id: reportId
                }
            });

            if (!existingReport) {
                return res.status(404).json({
                    message: "Report not found."
                });
            }

            // Verify the officer's department
            if (
                !officerCanAccessReport(
                    existingReport,
                    req.authorityDepartment
                )
            ) {
                return res.status(403).json({
                    message: "Access denied. You cannot delete another department's complaint."
                });
            }

            // Delete the report
            await prisma.report.delete({
                where: {
                    id: reportId
                }
            });

            // Delete locally stored evidence, if available
            if (
                existingReport.evidenceUrl &&
                existingReport.evidenceUrl.startsWith("/uploads/")
            ) {
                const filename = path.basename(
                    existingReport.evidenceUrl
                );

                const evidencePath = path.join(
                    uploadFolder,
                    filename
                );

                if (fs.existsSync(evidencePath)) {
                    fs.unlinkSync(evidencePath);
                }
            }

            return res.json({
                message: "Report deleted successfully.",
                deletedReportId: reportId
            });

        } catch (error) {
            console.error("Error deleting report:", error);

            return res.status(500).json({
                message: "Could not delete report."
            });
        }
    }
);


// ========================================
// 7. SUBMIT A NEW REPORT WITH GPS + EVIDENCE
// ========================================

app.post(
    "/api/reports",
    upload.single("evidence"),
    async (req, res) => {
        try {
            const {
                category,
                description,
                location,
                latitude,
                longitude
            } = req.body;

            // Check required fields
            if (
                !category?.trim() ||
                !description?.trim() ||
                !location?.trim()
            ) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(400).json({
                    message: "Please provide all required fields."
                });
            }

            // Convert GPS coordinates into numbers
            const lat = latitude?.trim()
                ? Number(latitude)
                : null;

            const lng = longitude?.trim()
                ? Number(longitude)
                : null;

            // Validate GPS coordinates
            if (
                (lat !== null &&
                    (!Number.isFinite(lat) || lat < -90 || lat > 90)) ||

                (lng !== null &&
                    (!Number.isFinite(lng) || lng < -180 || lng > 180)) ||

                ((lat === null) !== (lng === null))
            ) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(400).json({
                    message: "Invalid GPS coordinates."
                });
            }

            // Save uploaded file path
            const evidenceUrl = req.file
                ? `/uploads/${req.file.filename}`
                : null;

            // Save report in PostgreSQL
            const newReport = await prisma.report.create({
                data: {
                    category,
                    description,
                    location,
                    latitude: lat,
                    longitude: lng,
                    evidenceUrl
                }
            });

            res.status(201).json({
                message: "Report submitted successfully!",
                report: newReport
            });

        } catch (error) {
            console.error("Error creating report:", error);

            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                message: "Could not submit report."
            });
        }
    }
);

// ========================================
// 8. ERROR HANDLING
// ========================================

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "File size must not exceed 20 MB."
            });
        }

        return res.status(400).json({
            message: error.message
        });
    }

    if (
        error.message &&
        error.message.includes("Only JPG")
    ) {
        return res.status(400).json({
            message: error.message
        });
    }

    console.error("Server error:", error);

    res.status(500).json({
        message: "Something went wrong on the server."
    });
});

// ========================================
// 9. START SERVER
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`CivicTrack server running on port ${PORT}`);
});
