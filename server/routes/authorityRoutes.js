
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db");

const router = express.Router();

// Authority Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // Find authority account
        const authority = await prisma.authority.findUnique({
            where: {
                email: email.trim().toLowerCase()
            }
        });

        // Verify account and password
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

        // Check JWT secret
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Server authentication is not configured."
            });
        }

        // Generate login token
        const token = jwt.sign(
            {
                authorityId: authority.id,
                department: authority.department
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Send successful login response
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

module.exports = router;
