const url = require("url");
const db = require("../db"); // Import database connection
// const authMiddleware = require("../middleware/authMiddleware"); // Uncomment if needed

module.exports = (req, res) => { 
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "https://museum-db-kappa.vercel.app");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    // GET /manage-exhibition - Retrieve all active exhibitions
if (parsedUrl.pathname === "/manage-exhibition" && method === "GET") {
    // Optionally use authMiddleware(["staff", "admin"]) here
    db.query("SELECT * FROM exhibitions WHERE is_active = TRUE", (err, results) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Error retrieving exhibitions", error: err }));
        }
        
        // Process each row to convert the exhibition_image blob (Buffer) to a Base64-encoded data URL.
        const updatedResults = results.map(row => {
            if (row.exhibition_image && Buffer.isBuffer(row.exhibition_image)) {
                try {
                    // Convert Buffer directly to Base64 and prepend the data URL scheme
                    row.exhibition_image = `data:image/jpeg;base64,${row.exhibition_image.toString('base64')}`;
                } catch (conversionErr) {
                    console.error("Error converting image data", conversionErr);
                    row.exhibition_image = null;
                }
            }
            return row;
        });
        
        // Log the updated results to help with debugging
        console.log("Exhibitions with converted image data:", updatedResults);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(updatedResults));
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
                // If image data is provided, decode it from Base64 into a Buffer
                let imageBuffer = null;
                if (exhibition.exhibition_image) {
                    imageBuffer = Buffer.from(exhibition.exhibition_image, 'base64');
                }
                const query = `
                  INSERT INTO exhibitions 
                  (Name, Start_Date, End_Date, Budget, Location, Num_Tickets_Sold, Themes, Num_Of_Artworks, description, exhibition_image, requires_ticket, is_active) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    imageBuffer,                       // Insert the binary data (Buffer) here
                    exhibition.requires_ticket,        // This field comes from the frontend as a boolean or 0/1
                    true                               // New exhibitions are active by default
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
                if (!exhibition.Exhibition_ID) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Exhibition_ID is required for update" }));
                }
                const query = `
                  UPDATE exhibitions 
                  SET Name = ?, Start_Date = ?, End_Date = ?, Budget = ?, Location = ?, Num_Tickets_Sold = ?, Themes = ?, Num_Of_Artworks = ?, description = ?, exhibition_image = ?, requires_ticket = ?, is_active = ?
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
                    exhibition.requires_ticket, // Updated field name
                    exhibition.is_active,
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
