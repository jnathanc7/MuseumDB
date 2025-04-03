const url = require("url");
const db = require("../db"); // Import database connection
// const authMiddleware = require("../middleware/authMiddleware"); // Import Authentication Middleware

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    // Retreive all artwork records from the database
    if (parsedUrl.pathname === "/exhibitions" && method === "GET") {
        // return authMiddleware(["staff", "admin"])(req, res, () => {
            db.query("SELECT * FROM artworks", (err, results) => {
                if (err) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Error retrieving artworks", error: err }));
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            });

        // });
    }

    // Retrieve all Exhibition artworks records from the database
    if(parsedUrl.pathname === "/exhibitions" && method === "GET"){
        // return authMiddleware(["staff", "admin"])(req, res, () =>{
            db.query("SELECT * FROM exhibitions_artworks", (err, results) => {
                if(err){
                    res.writeHead(500, {"Content-Type": "application/json"});
                    return res.end(JSON.stringify({ message: "Error retrieving exhibition artworks", error: err }));
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            });
        // });
    }


    // Retrieve all Exhibition records from the database
    if(parsedUrl.pathname === "/exhibitions" && method === "GET"){
        // return authMiddleware(["staff", "admin"])(req, res, () =>{
            db.query("SELECT * FROM exhibitions", (err, results) => {
                if(err){
                    res.writeHead(500, {"Content-Type": "application/json"});
                    return res.end(JSON.stringify({ message: "Error retrieving exhibitions", error: err }));
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            });
        // });
    }

    // Retrieve all Special Exhibtion records from the data
    if(parsedUrl.pathname === "/exhibitions" && method === "GET"){
        // return authMiddleware(["staff", "admin"])(req, res, () =>{
            db.query("SELECT * FROM special_exhibitions", (err, results) => {
                if(err){
                    res.writeHead(500, {"Content-Type": "application/json"});
                    return res.end(JSON.stringify({ message: "Error retrieving  special exhibitions", error: err }));
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            });
        // });
    }

    // Retrieve all records from exhibition staff
    if(parsedUrl.pathname === "/exhibitions" && method === "GET"){
        // return authMiddleware(["staff", "admin"])(req, res, () =>{
            db.query("SELECT * FROM exhibition_staff", (err, results) => {
                if(err){
                    res.writeHead(500, {"Content-Type": "application/json"});
                    return res.end(JSON.stringify({ message: "Error retrieving  special exhibitions", error: err }));
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            });
        // });
    }

    // Retrieve all records from special exhibitions staff
    if(parsedUrl.pathname === "/exhibitions" && method === "GET"){
        // return authMiddleware(["staff", "admin"])(req, res, () =>{
            db.query("SELECT * FROM special_exhibition_staff", (err, results) => {
                if(err){
                    res.writeHead(500, {"Content-Type": "application/json"});
                    return res.end(JSON.stringify({ message: "Error retrieving  special exhibitions staff", error: err }));
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            });
        // });
    }

    // Handle Unknown Routes
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));

};
