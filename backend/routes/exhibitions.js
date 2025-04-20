const url = require("url");
const db = require("../db");

module.exports = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  res.setHeader("Access-Control-Allow-Origin", "https://museum-db-kappa.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // Aggregation endpoint: no middleware
  if (method === "GET" && parsedUrl.pathname === "/exhibition-purchases") {
    const query = `
      SELECT 
        e.Exhibition_ID,
        CASE 
          WHEN e.requires_ticket THEN COALESCE(agg.Tickets_Bought, 0)
          ELSE COALESCE(regular.Tickets_Bought, 0)
        END AS Tickets_Bought,
        CASE 
          WHEN e.requires_ticket THEN COALESCE(agg.Amount_Made, 0)
          ELSE COALESCE(regular.Amount_Made, 0)
        END AS Amount_Made
      FROM exhibitions e
      LEFT JOIN (
        SELECT 
          t.Exhibition_ID,
          SUM(pt.Quantity) AS Tickets_Bought,
          SUM(pt.Quantity * pt.Price) AS Amount_Made
        FROM purchase_tickets pt
        JOIN tickets t ON pt.Ticket_ID = t.Ticket_ID
        GROUP BY t.Exhibition_ID
      ) agg ON e.Exhibition_ID = agg.Exhibition_ID
      CROSS JOIN (
        SELECT 
          SUM(pt.Quantity) AS Tickets_Bought,
          SUM(pt.Quantity * pt.Price) AS Amount_Made
        FROM purchase_tickets pt
        JOIN tickets t ON pt.Ticket_ID = t.Ticket_ID
        WHERE t.Exhibition_ID IS NULL
      ) regular
      WHERE e.is_active = TRUE;
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error aggregating exhibition purchases:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Error aggregating exhibition data", details: err.message }));
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(results));
    });
    return;
  }

  // GET /manage-exhibition without middleware
  if (parsedUrl.pathname === "/manage-exhibition" && method === "GET") {
    db.query(
      "SELECT * FROM exhibitions WHERE is_active = TRUE",
      (err, results) => {
        if (err) {
          console.error("Error retrieving exhibitions:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Error retrieving exhibitions", error: err }));
        }

        const updatedResults = results.map((row) => {
          if (row.exhibition_image && Buffer.isBuffer(row.exhibition_image)) {
            try {
              row.exhibition_image = `data:image/jpeg;base64,${row.exhibition_image.toString("base64")}`;
            } catch {
              row.exhibition_image = null;
            }
          }
          return row;
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(updatedResults));
      }
    );
    return;
  }


};

