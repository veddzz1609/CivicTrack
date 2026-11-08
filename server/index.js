
const express = require("express");
const cors = require("cors");
const prisma = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Route 1: Test API
app.get("/", (req, res) => {
    res.send("CivicTrack API is running!");
});

// Route 2: Get all reports from PostgreSQL
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

// Route 3: Submit a new report to PostgreSQL
app.post("/api/reports", async (req, res) => {
    try {
        const { category, description, location } = req.body;

        if (!category || !description || !location) {
            return res.status(400).json({
                message: "Please provide all required fields."
            });
        }

        const newReport = await prisma.report.create({
            data: {
                category,
                description,
                location
            }
        });

        res.status(201).json({
            message: "Report submitted successfully!",
            report: newReport
        });

    } catch (error) {
        console.error("Error creating report:", error);

        res.status(500).json({
            message: "Could not submit report."
        });
    }
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`CivicTrack server running on port ${PORT}`);
});

