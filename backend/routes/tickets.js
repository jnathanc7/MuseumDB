const url = require("url");
const db = require("../db"); // Import Database Connection

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

  // Handle CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Fetch all tickets (Tickets are unlimited, so no availability check)
  if (method === "GET" && parsedUrl.pathname === "/tickets") {
    console.log("Received request for /tickets");
  
    const query = "SELECT * FROM tickets";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Database Error:", err); // ✅ Log database errors
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Error fetching tickets", details: err.message }));
        return;
      }
  
      console.log("Fetched Tickets:", results); // ✅ Log successful results
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(results));
    });
  }
  

  // Fetch all purchases
  if (method === "GET" && parsedUrl.pathname === "/purchase") {
    const query = "SELECT * FROM purchases";
    db.query(query, (err, results) => {
                        if (err) {
                            res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Error fetching purchases" }));
                            return;
                        }

                        res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(results));
        });
    }

  // Handle ticket purchase (Unlimited tickets, no availability check)
  if (method === "POST" && parsedUrl.pathname === "/purchase") {
    let body = "";
    req.on("data", (chunk) => {
            body += chunk;
        });
    req.on("end", () => {
      try {
        const { payment_Method, tickets } = JSON.parse(body);

        if (!Array.isArray(tickets) || tickets.length === 0) {
                res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Invalid request data" }));
                return;
            }

        let totalAmount = 0;
        let ticketQueries = [];

        // Calculate total price (No availability check)
        tickets.forEach(({ ticket_ID, quantity }) => {
          ticketQueries.push(
            new Promise((resolve, reject) => {
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
            })
          );
        });

        // Execute ticket queries
        Promise.all(ticketQueries)
          .then(() => {
            // Insert into purchases table
            db.query(
              "INSERT INTO purchases (Customer_ID, Payment_Method, Total_Amount) VALUES (1, ?, ?)",
              [payment_Method, totalAmount],
              (err, purchaseResult) => {
                if (err) {
                  console.error("Error inserting into purchases:", err); // Debugging Log
                    res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: "Error recording purchase" }));
                    return;
                }

                const purchase_ID = purchaseResult.insertId;

                let purchaseTicketQueries = tickets.map(({ ticket_ID, quantity }) => {
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
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({
                      message: "Purchase successful",
                      totalAmount,
                    }));
                  })
                  .catch((err) => {
                    console.error("Error recording ticket purchase:", err);
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "Error recording ticket purchase" }));
            });
              }
            );
          })
          .catch(() => {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Ticket not found" }));
          });

      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Invalid JSON format" }));
      }
    });
  }

  // CORS Preflight Handling
  if (method === "OPTIONS") {
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.end();
    }
};

