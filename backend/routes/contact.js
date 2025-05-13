const url = require("url");
const db = require("../db");

module.exports = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  res.setHeader("Access-Control-Allow-Origin", "https://museum-db-kappa.vercel.app"); // https://museum-db-kappa.vercel.app
  res.setHeader("Access-Control-Allow-Credentials", "true"); // http://localhost:5173
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // GET all complaints
  if (parsedUrl.pathname === "/contact" && method === "GET") {
    db.query("SELECT * FROM complaints", (err, results) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            message: "Error retrieving complaints",
            error: err,
          })
        );
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(results));
    });
  }

  // POST a new complaint
  else if (parsedUrl.pathname === "/contact" && method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const newComplaint = JSON.parse(body);
        console.log("Incoming complaint:", newComplaint); // LOG IT

        const {
          customer_ID,
          complaint_date,
          complaint_time,
          complaint_type,
          Complaint_Title,
          Complaint_Rating,
          description,
          status,
          Ticket_ID,
          Staff_ID,
          Events_ID,
          Special_Exhibition_ID,
        } = newComplaint;

        // validation
        if (
          !customer_ID ||
          !complaint_date ||
          !complaint_type ||
          !description ||
          !status
        ) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              message: "Missing required fields.",
              complaintReceived: newComplaint,
            })
          );
        }

        // Calculate Houston time
        const houstonTime = new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "America/Chicago",
        }).format(new Date());

        const query = `
          INSERT INTO complaints (
            customer_ID,
            Complaint_Date,
            Complaint_Time,
            Complaint_Type,
            Complaint_Title,
            Complaint_Rating,
            Description,
            Status,
            Ticket_ID,
            Staff_ID,
            Events_ID,
            Special_Exhibition_ID
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
          customer_ID,
          complaint_date,
          houstonTime,
          complaint_type,
          Complaint_Title || null,
          Complaint_Rating || null,
          description,
          status,
          Ticket_ID || null,
          Staff_ID || null,
          Events_ID || null,
          Special_Exhibition_ID || null,
        ];
        db.query(query, values, (err, results) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({ message: "Error adding complaint", error: err })
            );
          }
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Complaint added successfully!",
              insertedId: results.insertId,
            })
          );
        });
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON format" }));
      }
    });
  }

  // Fallback route
  else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
};
