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

  // 🔹 Fetch all tickets
  if (method === "GET" && parsedUrl.pathname === "/tickets") {
    const query = "SELECT * FROM tickets";
    db.query(query, (err, results) => { 
      if (err) {
        console.error("Database Error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Error fetching tickets", details: err.message }));
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(results));
    });
    return;
  }

  // 🔹 Fetch all purchases (for debugging or admin)
  if (method === "GET" && parsedUrl.pathname === "/purchase") {
    const query = "SELECT * FROM purchases";
    db.query(query, (err, results) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Error fetching purchases" }));
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(results));
    });
    return;
  }

  // 🔹 Handle ticket purchase (protected route)
  if (method === "POST" && parsedUrl.pathname === "/purchase") {
    // Use auth middleware
    authMiddleware([])(req, res, () => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        try {
          const { payment_Method, tickets } = JSON.parse(body);
          const customer_ID = req.user.id; // ✅ Extracted from JWT

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
                      res.end(JSON.stringify({
                        message: "Purchase successful",
                        totalAmount,
                      }));
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

  // 🔸 Fallback
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Route not found" }));
};


