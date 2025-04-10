const url = require("url");
const db = require("../db"); // Import Database Connection
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Add middleware

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



  // 🔹 GET /tickets - Fetch all tickets (do not filter by Status)
  if (method === "GET" && parsedUrl.pathname === "/tickets") {
    const query = "SELECT * FROM tickets";
    db.query(query, (err, results) => { 
      if (err) {
        console.error("Database Error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Error fetching tickets", details: err.message }));
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(results));
    });
    return;
  }

  // 🔹 GET /tickets - Fetch all available tickets
  if (method === "GET" && parsedUrl.pathname === "/tickets/customers") {
    // Optionally filter to only return available tickets:
    const query = "SELECT * FROM tickets WHERE Status = 'Available'";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Error fetching tickets", details: err.message })
        );
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(results));
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

  // 🔹 Handle ticket purchase (protected route)
  if (method === "POST" && parsedUrl.pathname === "/purchase") {
    authMiddleware([])(req, res, () => {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        try {
          const { payment_Method, tickets } = JSON.parse(body);
          const customer_ID = req.user.id; // Extracted from JWT
          if (!Array.isArray(tickets) || tickets.length === 0) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Invalid request data" }));
          }
          let totalAmount = 0;
          const ticketQueries = tickets.map(({ ticket_ID, quantity }) => {
            return new Promise((resolve, reject) => {
              db.query(
                "SELECT Price FROM tickets WHERE Ticket_ID = ?",
                [ticket_ID],
                (err, results) => {
                  if (err || results.length === 0) {
                    reject("Ticket not found");
                  } else {
                    totalAmount += results[0].Price * quantity;
                    resolve();
                  }
                }
              );
            });
          });
          Promise.all(ticketQueries)
            .then(() => {
              db.query(
                "INSERT INTO purchases (Customer_ID, Payment_Method, Total_Amount) VALUES (?, ?, ?)",
                [customer_ID, payment_Method, totalAmount],
                (err, purchaseResult) => {
                  if (err) {
                    console.error("Error inserting into purchases:", err);
                    res.writeHead(500, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ error: "Error recording purchase" }));
                  }
                  const purchase_ID = purchaseResult.insertId;
                  const purchaseTicketQueries = tickets.map(({ ticket_ID, quantity }) => {
                    return new Promise((resolve, reject) => {
                      db.query(
                        "INSERT INTO purchase_tickets (Purchase_ID, Ticket_ID, Ticket_Type, Quantity, Price) VALUES (?, ?, (SELECT Ticket_Type FROM tickets WHERE Ticket_ID = ?), ?, (SELECT Price FROM tickets WHERE Ticket_ID = ?))",
                        [purchase_ID, ticket_ID, ticket_ID, quantity, ticket_ID],
                        (err) => {
                          if (err) reject(err);
                          else resolve();
                        }
                      );
                    });
                  });
                  Promise.all(purchaseTicketQueries)
                    .then(() => {
                      res.writeHead(200, { "Content-Type": "application/json" });
                      res.end(JSON.stringify({ message: "Purchase successful", totalAmount }));
                    })
                    .catch((err) => {
                      console.error("Error recording ticket purchase:", err);
                      res.writeHead(500, { "Content-Type": "application/json" });
                      res.end(JSON.stringify({ error: "Error recording ticket purchase" }));
                    });
                }
              );
            })
            .catch((err) => {
              console.error("Ticket validation failed:", err);
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Ticket not found" }));
            });
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON format" }));
        }
      });
    });
    return;
  }

  // 🔹 POST /tickets - Create a new ticket (regular, no exhibition)
  if (method === "POST" && parsedUrl.pathname === "/tickets") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const ticket = JSON.parse(body);
        if (!ticket.Ticket_Type || !ticket.Price) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Ticket_Type and Price are required" }));
        }
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

  // 🔹 PUT /tickets - Update an existing ticket (edit Ticket_Type, Price, and Exhibition_ID)
  if (method === "PUT" && parsedUrl.pathname === "/tickets") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const ticket = JSON.parse(body);
        if (!ticket.Ticket_ID) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Ticket_ID is required for update" }));
        }
        const sql = `
          UPDATE tickets 
          SET Ticket_Type = ?, Price = ?, Exhibition_ID = ?
          WHERE Ticket_ID = ?
        `;
        const values = [
          ticket.Ticket_Type,
          ticket.Price,
          ticket.Exhibition_ID || null,
          ticket.Ticket_ID,
        ];
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

  // 🔹 PUT /tickets/deactivate - Deactivate a ticket by updating its Status to "Sold"
  if (method === "PUT" && parsedUrl.pathname === "/tickets/deactivate") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const { Ticket_ID } = JSON.parse(body);
        if (!Ticket_ID) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Ticket_ID is required" }));
        }
        const sql = "UPDATE tickets SET Status = 'Sold' WHERE Ticket_ID = ?";
        db.query(sql, [Ticket_ID], (err, result) => {
          if (err) {
            console.error("Error deactivating ticket:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Error deactivating ticket", details: err.message }));
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Ticket deactivated successfully" }));
        });
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid JSON format", details: parseError.message }));
      }
    });
    return;
  }

  // 🔹 PUT /tickets/reactivate - Reactivate a ticket by updating its Status back to "Available"
  if (method === "PUT" && parsedUrl.pathname === "/tickets/reactivate") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const { Ticket_ID } = JSON.parse(body);
        if (!Ticket_ID) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Ticket_ID is required" }));
        }
        const sql = "UPDATE tickets SET Status = 'Available' WHERE Ticket_ID = ?";
        db.query(sql, [Ticket_ID], (err, result) => {
          if (err) {
            console.error("Error reactivating ticket:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Error reactivating ticket", details: err.message }));
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Ticket reactivated successfully" }));
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

