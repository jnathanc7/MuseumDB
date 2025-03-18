const jwt = require("jsonwebtoken");
const cookie = require("cookie"); // Use 'cookie' module for better parsing
const { env } = require("process");

// Middleware to verify JWT and enforce role-based access
module.exports = (allowedRoles = []) => {
    if (typeof allowedRoles === "string") allowedRoles = [allowedRoles]; // edge case: convert to array if string is passed from route
    
    return (req, res, next) => {
        try {
            const token = extractToken(req);
            // also exempts /auth/reset-password and /auth/forgot-password from requiring a JWT, allowing unauthenticated users to reset passwords
            if (!token) { 
                return respondWithError(res, 401, "Access denied. No token provided.");
            }
    
            // verify JWT
            jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return respondWithError(res, 403, "Invalid or expired token.");
                }

                req.user = decoded; // attach user data to request

                // role-based access check (supports multiple roles)
                if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
                    return respondWithError(res, 403, "Access denied. Insufficient permissions.");
                }

                next(); // proceed to next middleware or route handler
            });

        } catch (error) {
            console.error("JWT Middleware Error:", error);
            respondWithError(res, 500, "Internal server error.");
        }
    };
};

// helper to extract JWT from cookies
function extractToken(req) {
    if (!req.headers.cookie) return null;
    const cookies = cookie.parse(req.headers.cookie);
    return cookies.jwt || null; // Extract 'jwt' cookie if available
}

// generic error response helper
function respondWithError(res, statusCode, message) {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: message }));
}
