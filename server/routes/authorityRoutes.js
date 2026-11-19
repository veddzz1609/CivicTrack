
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db");
const authenticateAuthority = require("../middleware/authMiddleware");

const router = express.Router();

// Map complaint categories to their responsible departments
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

// Normalize department and category names
function normalizeName(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+department$/, "");
}

// Authority login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const authority = await prisma.authority.findUnique({
            where: {
                email: email.trim().toLowerCase()
            }
        });

        if (!authority) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            authority.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Server authentication is not configured."
            });
        }

        const token = jwt.sign(
            {
                authorityId: authority.id,
                department: authority.department
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful.",
            token,
            authority: {
                id: authority.id,
                name: authority.name,
                email: authority.email,
                department: authority.department
            }
        });

    } catch (error) {
        console.error("Authority login error:", error);

        return res.status(500).json({
            message: "Something went wrong during login."
        });
    }
});

// Fetch complaints belonging to the logged-in officer's department
router.get("/reports", authenticateAuthority, async (req, res) => {
    try {
        const officerDepartment = normalizeName(
            req.authorityDepartment
        );

        const reports = await prisma.report.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });

        const departmentReports = reports.filter(report => {
            const category = normalizeName(report.category);
            const reportDepartment = categoryDepartmentMap[category];

            return reportDepartment === officerDepartment;
        });

        console.log("Officer department:", officerDepartment);
        console.log(
            "All report categories:",
            reports.map(report => report.category)
        );
        console.log(
            "Matching complaints:",
            departmentReports.length
        );

        return res.status(200).json(departmentReports);

    } catch (error) {
        console.error("Department reports error:", error);

        return res.status(500).json({
            message: "Unable to fetch department reports."
        });
    }
});

module.exports = router;
