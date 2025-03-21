const url = require("url");
const db = require("../db"); // Import Database Connection

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // Handle CORS (Allow frontend to communicate with backend)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    // 🔹 GET /complaints - Retrieve all complaints from the database
    if (parsedUrl.pathname === "/complaints" && method === "GET") {
        db.query("SELECT * FROM complaints", (err, results) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Error retrieving complaints", error: err }));
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        });
    }

    // 🔹 POST /complaints - Add a new complaint
    else if (parsedUrl.pathname === "/complaints" && method === "POST") {
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", () => {
            try {
                const newComplaint = JSON.parse(body);

                // Validate required fields
                if (!newComplaint.customer_ID || !newComplaint.Complaint_Date || !newComplaint.Complaint_Type || !newComplaint.Description || !newComplaint.Status) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Missing required fields." }));
                }

                const query = `
                    INSERT INTO complaints (customer_ID, Complaint_Date, Complaint_Type, Description, Status, Ticket_ID, Staff_ID, Events_ID, Special_Exhibition_ID) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [
                    newComplaint.customer_ID,
                    newComplaint.Complaint_Date,
                    newComplaint.Complaint_Type,
                    newComplaint.Description,
                    newComplaint.Status,
                    newComplaint.Ticket_ID || null,
                    newComplaint.Staff_ID || null,
                    newComplaint.Events_ID || null,
                    newComplaint.Special_Exhibition_ID || null
                ];

                db.query(query, values, (err, results) => {
                    if (err) {
                        console.error("Database Insert Error:", err);
                        res.writeHead(500, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ message: "Error adding complaint", error: err }));
                    }

                    res.writeHead(201, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Complaint added successfully!", insertedId: results.insertId }));
                });
            } catch (error) {
                console.error("Invalid JSON format:", error);
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Invalid JSON format" }));
            }
        });
    }

    // 🔹 PUT /complaints/:id/status - Update complaint status
    else if (parsedUrl.pathname.startsWith("/complaints/") && method === "PUT") {
        const id = parsedUrl.pathname.split("/")[2]; // Extract Complaint ID from URL

        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", () => {
            try {
                const { Status, Resolution_Date, Resolution_Notes } = JSON.parse(body);

                if (!Status) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Missing status field." }));
                }

                const query = `
                    UPDATE complaints 
                    SET Status = ?, Resolution_Date = ?, Resolution_Notes = ? 
                    WHERE Complaint_ID = ?
                `;

                db.query(query, [Status, Resolution_Date || null, Resolution_Notes || null, id], (err, results) => {
                    if (err) {
                        res.writeHead(500, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ message: "Error updating complaint status", error: err }));
                    }

                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Complaint status updated" }));
                });
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Invalid JSON format" }));
            }
        });
    }

    // 🔹 DELETE /complaints/:id - Remove a complaint
    else if (parsedUrl.pathname.startsWith("/complaints/") && method === "DELETE") {
        const id = parsedUrl.pathname.split("/")[2];

        db.query("DELETE FROM complaints WHERE Complaint_ID = ?", [id], (err, results) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Error deleting complaint", error: err }));
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Complaint deleted successfully" }));
        });
    }

    // 🔹 Handle Unknown Routes
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
};
