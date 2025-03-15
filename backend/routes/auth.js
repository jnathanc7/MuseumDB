const url = require("url");
const bcrypt = require("bcryptjs");
const db = require("../db");

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // 🔹 POST /auth/register - Register a new user
    if (parsedUrl.pathname === "/auth/register" && method === "POST") {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {
            try {
                const newUser = JSON.parse(body);
                const { email, password, role } = newUser;

                // validate required fields
                if (!email || !password || !role) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Email, password, and role are required." }));
                }

                // check if email already exists
                db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
                    if (err) {
                        res.writeHead(500, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ message: "Database error.", error: err }));
                    }

                    if (results.length > 0) {
                        res.writeHead(409, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ message: "Email already in use." }));
                    }

                    // hash the password
                    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
                        if (hashErr) {
                            res.writeHead(500, { "Content-Type": "application/json" });
                            return res.end(JSON.stringify({ message: "Error hashing password.", error: hashErr }));
                        }

                        // 🔹 Insert new user into the database
                        const query = "INSERT INTO users (email, password, role) VALUES (?, ?, ?)";
                        db.query(query, [email, hashedPassword, role], (insertErr, results) => {
                            if (insertErr) {
                                res.writeHead(500, { "Content-Type": "application/json" });
                                return res.end(JSON.stringify({ message: "Error creating user.", error: insertErr }));
                            }

                            res.writeHead(201, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ message: "User registered successfully!", userId: results.insertId }));
                        });
                    });
                });
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Invalid JSON format.", error }));
            }
        });
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
};
