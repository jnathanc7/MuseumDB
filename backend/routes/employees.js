const url = require("url");
const db = require("../db"); // Import Database Connection
//const authMiddleware = require("../middleware/authMiddleware"); // Import Authentication Middleware

module.exports = (req, res) => { 
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    const allowedOrigins = [
        "https://museum-db-kappa.vercel.app", // Vercel frontend (adjust if different)
        "http://localhost:5180", // Local frontend
        "http://localhost:5173", // gabe local frontend
    ];

    // Handle CORS (Allow frontend to communicate with backend)
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }    
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }
 
    // GET /manage-exhibition - Retrieve all exhibitions
  if (parsedUrl.pathname === "/manage-exhibition" && method === "GET") {
    // Optionally, insert authentication middleware here if required.
    db.query("SELECT * FROM exhibitions", (err, results) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Error retrieving exhibitions", error: err }));
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(results));
    });
    return;
  }

  // POST /manage-exhibition - Add a new exhibition
  if (parsedUrl.pathname === "/manage-exhibition" && method === "POST") {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const exhibition = JSON.parse(body);
        // Insert into exhibitions table.
        // Adjust the columns and parameters as needed. Here we assume that:
        // - The exhibition table now includes: Name, Start_Date, End_Date, Budget, Location,
        //   Num_Tickets_Sold, Themes, Num_Of_Artworks, description, exhibition_image, require_ticket.
        const query = `
          INSERT INTO exhibitions 
          (Name, Start_Date, End_Date, Budget, Location, Num_Tickets_Sold, Themes, Num_Of_Artworks, description, exhibition_image, require_ticket) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          exhibition.Name,
          exhibition.Start_Date,
          exhibition.End_Date,
          exhibition.Budget,
          exhibition.Location,
          exhibition.Num_Tickets_Sold || 0,
          exhibition.Themes,
          exhibition.Num_Of_Artworks,
          exhibition.description,
          exhibition.exhibition_image, // Expecting binary/blob or Base64 string as appropriate
          exhibition.require_ticket   // Boolean (or 0/1)
        ];

        db.query(query, params, (err, result) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Error adding exhibition", error: err }));
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Exhibition added successfully", Exhibition_ID: result.insertId }));
        });
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON", error: err.message }));
      }
    });
    return;
  }

  // PUT /manage-exhibition - Update an existing exhibition
  if (parsedUrl.pathname === "/manage-exhibition" && method === "PUT") {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const exhibition = JSON.parse(body);
        // Ensure Exhibition_ID is provided for updating
        if (!exhibition.Exhibition_ID) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Exhibition_ID is required for update" }));
        }
        const query = `
          UPDATE exhibitions 
          SET Name = ?, Start_Date = ?, End_Date = ?, Budget = ?, Location = ?, Num_Tickets_Sold = ?, Themes = ?, Num_Of_Artworks = ?, description = ?, exhibition_image = ?, require_ticket = ?
          WHERE Exhibition_ID = ?
        `;
        const params = [
          exhibition.Name,
          exhibition.Start_Date,
          exhibition.End_Date,
          exhibition.Budget,
          exhibition.Location,
          exhibition.Num_Tickets_Sold,
          exhibition.Themes,
          exhibition.Num_Of_Artworks,
          exhibition.description,
          exhibition.exhibition_image,
          exhibition.require_ticket,
          exhibition.Exhibition_ID
        ];
        db.query(query, params, (err, result) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Error updating exhibition", error: err }));
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Exhibition updated successfully" }));
        });
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON", error: err.message }));
      }
    });
    return;
  }

  // If no matching route is found, return a 404 response.
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Route not found" }));
};