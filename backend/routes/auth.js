const url = require("url");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config(); // Load environment variables

/**
 * Handles incoming auth-related requests (register & login).
 */
module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;
    const { method } = req;

    if (pathname === "/auth/register" && method === "POST") {
        handleRegister(req, res);
    } else if (pathname === "/auth/login" && method === "POST") {
        handleLogin(req, res);
    } else {
        sendResponse(res, 404, { message: "Route not found" });
    }
};

/**
 * Handles user registration.
 */
function handleRegister(req, res) {
    let body = "";

    req.on("data", (chunk) => (body += chunk));

    req.on("end", () => {
        try {
            const { email, password, role } = JSON.parse(body);

            if (!email || !password || !role) {
                return sendResponse(res, 400, { message: "Email, password, and role are required." });
            }

            // Check if the user already exists
            db.query("SELECT user_id FROM users WHERE email = ?", [email], (err, results) => {
                if (err) return sendResponse(res, 500, { message: "Database error.", error: err });

                if (results.length > 0) {
                    return sendResponse(res, 409, { message: "Email already in use." });
                }

                // Hash the password before saving
                bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
                    if (hashErr) return sendResponse(res, 500, { message: "Error hashing password.", error: hashErr });

                    console.log("DEBUG: Plain Password:", password);
                    console.log("DEBUG: Hashed Password:", hashedPassword);

                    db.query("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", 
                        [email, hashedPassword, role], 
                        (insertErr, result) => {
                            if (insertErr) {
                                return sendResponse(res, 500, { message: "Error creating user.", error: insertErr });
                            }

                            sendResponse(res, 201, { message: "User registered successfully!", user_id: result.insertId });

                        }
                    );
                });
            });
        } catch (error) {
            sendResponse(res, 400, { message: "Invalid JSON format.", error });
        }
    });
}

/**
 * Handles user login.
 */
function handleLogin(req, res) {
    let body = "";

    req.on("data", (chunk) => (body += chunk));

    req.on("end", () => {
        try {
            const { email, password } = JSON.parse(body);

            if (!email || !password) {
                return sendResponse(res, 400, { message: "Email and password are required." });
            }

            // Check if the user exists
            db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
                if (err) return sendResponse(res, 500, { message: "Database error.", error: err });

                if (results.length === 0) {
                    return sendResponse(res, 401, { message: "Invalid email or password." });
                }

                const user = results[0];

                console.log("DEBUG: Input Password:", password);
                console.log("DEBUG: Stored Hashed Password:", user.password);

                // Compare hashed password
                bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
                    if (bcryptErr || !isMatch) {
                        return sendResponse(res, 401, { message: "Invalid email or password." });
                    }

                    // Generate JWT token
                    const token = jwt.sign(
                        { id: user.user_id, role: user.role },
                        process.env.JWT_SECRET,
                        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
                    );

                   
                    const headers = {
                        "Set-Cookie": `jwt=${token}; HttpOnly; Secure; SameSite=None`
                    };

                    sendResponse(res, 200, { 
                        message: "Login successful", 
                        user: { id: user.user_id, email: user.email, role: user.role } 
                    }, headers);
                });
            });
        } catch (error) {
            sendResponse(res, 400, { message: "Invalid JSON format.", error });
        }
    });
}

/**
 * Sends a structured JSON response.
 */
function sendResponse(res, statusCode, payload, headers = {}) {
    res.writeHead(statusCode, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
}
