const url = require("url");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

module.exports = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  // Set CORS headers (adjust as needed)
  res.setHeader("Access-Control-Allow-Origin", "https://museum-db-kappa.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // GET request: Retrieve memberships.
  // GET request: Retrieve memberships for the logged-in customer.
if (method === "GET" && parsedUrl.pathname === "/membership") {
  // Protect the GET route as well so we know which customer is making the request.
  authMiddleware([])(req, res, () => {
    const customerId = req.user.id;
    const query = "SELECT * FROM memberships WHERE customer_id = ?";
    db.query(query, [customerId], (err, results) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Error fetching membership", details: err.message }));
      }
      // If results is an array, return the first record if it exists.
      if (Array.isArray(results) && results.length > 0) {
        return res.end(JSON.stringify(results[0]));
      }
      // Otherwise, no membership exists for this customer.
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Membership not found" }));
    });
  });
  return;
}


  // POST request: Create a new membership (protected route)
  if (method === "POST" && parsedUrl.pathname === "/membership") {
    // Protect the route using authMiddleware
    authMiddleware([])(req, res, () => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          // Expected JSON: { membership_type, payment_type, payment_amount, reason }
          const { membership_type, payment_type, payment_amount, reason } = JSON.parse(body);
          if (!membership_type || !payment_type || !payment_amount) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Missing required fields" }));
          }
          
          // Use authenticated user's ID from JWT for customer_id
          const customer_id = req.user.id;

          // Calculate start and end dates based on payment_type
          const startDate = new Date();
          let endDate = new Date(startDate);
          if (payment_type === "monthly") {
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (payment_type === "annual") {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Invalid payment_type" }));
          }

          const formattedStart = startDate.toISOString().slice(0, 10);
          const formattedEnd = endDate.toISOString().slice(0, 10);

          // Insert membership record into the database
          const query = `
            INSERT INTO memberships 
              (customer_id, membership_type, payment_type, payment_amount, reason, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          const values = [customer_id, membership_type, payment_type, payment_amount, reason, formattedStart, formattedEnd];
          db.query(query, values, (err, result) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Database error", details: err.message }));
            }
            res.writeHead(201, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Membership created", membership_id: result.insertId }));
          });
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Invalid JSON format" }));
        }
      });
    });
    return;
  }

  // PUT: Update an existing membership (protected)
  // PUT: Update existing membership for the logged-in customer
if (method === "PUT" && parsedUrl.pathname === "/membership") {
    authMiddleware([])(req, res, () => {
      let body = "";
      req.on("data", (chunk) => { body += chunk.toString(); });
      req.on("end", () => {
        try {
          // Expected JSON: { membership_type, payment_type, payment_amount, reason }
          const { membership_type, payment_type, payment_amount, reason } = JSON.parse(body);
          if (!membership_type || !payment_type || !payment_amount) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Missing required fields" }));
          }
          
          const customer_id = req.user.id;
          const startDate = new Date();
          let endDate = new Date(startDate);
          if (payment_type === "monthly") {
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (payment_type === "annual") {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Invalid payment_type" }));
          }
          const formattedStart = startDate.toISOString().slice(0, 10);
          const formattedEnd = endDate.toISOString().slice(0, 10);
          const query = `
            UPDATE memberships 
            SET membership_type = ?, payment_type = ?, payment_amount = ?, reason = ?, start_date = ?, end_date = ?
            WHERE customer_id = ?
          `;
          const values = [membership_type, payment_type, payment_amount, reason, formattedStart, formattedEnd, customer_id];
          db.query(query, values, (err, result) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Database error", details: err.message }));
            }
            if (result.affectedRows === 0) {
              res.writeHead(404, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Membership not found" }));
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Membership updated" }));
          });
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Invalid JSON format" }));
        }
      });
    });
    return;
  }
  

  // Fallback for unsupported routes/methods
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Route not found" }));
};
