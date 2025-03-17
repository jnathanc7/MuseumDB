const url = require("url");
const db = require("../db"); // Import Database Connection

module.exports = (req, res) => { 
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // Handle CORS (Allow frontend to communicate with backend)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    //  GET /reports/total-tickets - Retrieve all ticket sales
    if (parsedUrl.pathname === "/total-report" && method === "GET") {
        db.query(
            "SELECT Ticket_ID, Customer_ID, Ticket_Type, Price, Date_Purchased FROM Tickets ORDER BY Date_Purchased DESC;",
            (err, results) => {
                if (err) {
                    if (!res.headersSent) {
                        res.writeHead(500, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ message: "Error retrieving ticket sales", error: err }));
                    }
                    return; // 💡 Stops execution after sending the error response
                }

                if (!res.headersSent) {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(results));
                }
            }
        );
        return; // 💡 Prevents multiple responses
    }

    // Handle Unknown Routes
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
};