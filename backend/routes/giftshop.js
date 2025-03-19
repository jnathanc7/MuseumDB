const url = require("url");
const db = require("../db"); // Import Database Connection

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
    const method = req.method;
    console.log(`Incoming request: ${method} ${parsedUrl.pathname}`);
    console.log("Path segments:", pathSegments);
    
    // Handle CORS (Allow frontend to communicate with backend)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      // Handle CORS preflight request
      if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    //  GET /giftshop/(categoryname)/(productid) - Retrieve the specific product 
    if (pathSegments[0] === 'giftshop' && pathSegments.length === 3 && method === "GET") {
        const productid = decodeURIComponent(pathSegments[2]);
        console.log(`i am category: ${productid}`)
        db.query("SELECT P.* FROM products AS P WHERE P.Product_ID = ?", [productid], (err, results) => {
            if (err) {
                console.log("Database Query failed", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Error retrieving categories", error: err }));                
            }
            console.log("Query results",results);
            res.writeHead(200, { "Content-Type": "application/json" });//we arent able to send it to the frontend
            res.end(JSON.stringify(results));
            console.log("I am here for the product type shi");
            return; 
        });
    }

    //  GET /giftshop/(categoryname) - Retrieve all products of given category from database
    else if (pathSegments[0] === 'giftshop' && pathSegments.length === 2 && method === "GET") {
        const category = decodeURIComponent(pathSegments[1]);
        console.log(`i am category: ${category}`)
        db.query("SELECT P.* FROM products AS P, product_categories AS PC WHERE P.Category_ID = PC.Category_ID AND PC.Name = ?", [category], (err, results) => {
            if (err) {
                console.log("Database Query failed", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Error retrieving categories", error: err }));                
            }
            console.log("Query results",results);
            res.writeHead(200, { "Content-Type": "application/json" });//we arent able to send it to the frontend
            res.end(JSON.stringify(results));
            console.log("I am here");
            return; 
        });
    }
    //  GET /giftshop - Retrieve all categories from the database
   else if (parsedUrl.pathname === "/giftshop" && method === "GET") {
        

        db.query("SELECT * FROM product_categories", (err, results) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Error retrieving categories", error: err }));
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
            return; 
        });
    }
    else {
        // 404 - Route Not Found
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Route not found" }));
    }

    

}