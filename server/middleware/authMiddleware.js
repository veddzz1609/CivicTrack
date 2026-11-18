
const jwt = require("jsonwebtoken");

function authenticateAuthority(req, res, next) {
    const authHeader = req.headers.authorization;

    // Check whether the token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied. Please log in."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check that this token belongs to an authority account
        if (!decoded.authorityId) {
            return res.status(403).json({
                message: "Access denied. Authority account required."
            });
        }

        req.authorityId = decoded.authorityId;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired login token."
        });
    }
}

module.exports = authenticateAuthority;
