const url = require("url");
const db = require("../db"); // Import Database Connection
const authMiddleware = require("../middleware/authMiddleware"); // Uncomment if needed

module.exports = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "https://museum-db-kappa.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  // 🔹 GET /tickets - Fetch all tickets
  if (method === "GET" && parsedUrl.pathname === "/tickets") {
    const query = "SELECT * FROM tickets";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Error fetching tickets", details: err.message })
        );
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(results));
    });
    return;
  }

  // 🔹 GET /purchase - Fetch all purchases (for debugging or admin)
  if (method === "GET" && parsedUrl.pathname === "/purchase") {
    const query = "SELECT * FROM purchases";
    db.query(query, (err, results) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Error fetching purchases" }));
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(results));
    });
    return;
  }

  // 🔹 POST /tickets - Create a new ticket (regular ticket)
  // This route does not expect an Exhibition_ID.
  if (method === "POST" && parsedUrl.pathname === "/tickets") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const ticket = JSON.parse(body);
        // Validate required fields
        if (!ticket.Ticket_Type || !ticket.Price) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Ticket_Type and Price are required" }));
        }
        // Insert a new ticket.
        // We set Status to 'Available', Visit_Date to CURDATE(), and leave Exhibition_ID and Purchase_ID as NULL.
        const sql = `
          INSERT INTO tickets (Ticket_Type, Price, Status, Visit_Date, Exhibition_ID, Purchase_ID)
          VALUES (?, ?, 'Available', CURDATE(), NULL, NULL)
        `;
        const values = [ticket.Ticket_Type, ticket.Price];
        db.query(sql, values, (err, result) => {
          if (err) {
            console.error("MySQL Insert Error:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Error creating ticket", details: err.message }));
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Ticket created successfully", Ticket_ID: result.insertId }));
        });
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid JSON format", details: parseError.message }));
      }
    });
    return;
  }

  // 🔹 PUT /tickets - Update an existing ticket (only Ticket_Type and Price)
  if (method === "PUT" && parsedUrl.pathname === "/tickets") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const ticket = JSON.parse(body);
        if (!ticket.Ticket_ID) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Ticket_ID is required for update" }));
        }
        // Update Ticket_Type and Price
        const sql = `
          UPDATE tickets 
          SET Ticket_Type = ?, Price = ?
          WHERE Ticket_ID = ?
        `;
        const values = [ticket.Ticket_Type, ticket.Price, ticket.Ticket_ID];
        db.query(sql, values, (err, result) => {
          if (err) {
            console.error("MySQL Update Error:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Error updating ticket", details: err.message }));
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Ticket updated successfully" }));
        });
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid JSON format", details: parseError.message }));
      }
    });
    return;
  }

  // 🔸 Fallback
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Route not found" }));
};
