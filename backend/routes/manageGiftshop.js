const url = require("url");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

        // Handle CORS
    res.setHeader("Access-Control-Allow-Origin", "https://museum-db-kappa.vercel.app");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }
    else if (parsedUrl.pathname === "/manageGiftshop" && method === "GET") {
        

        db.query("SELECT Product_ID, Name, Category_ID, Price, Stock_Quantity, Description FROM products", (err, results) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Error retrieving categories", error: err }));
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            console.log("Sending products:", results);
            res.end(JSON.stringify(results));
            return; 
        });
    }
    

    else if (parsedUrl.pathname === "/manageGiftshop" && method === "POST") {
        
        let body = "";

    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", () => {

        const product = JSON.parse(body);


            const imageBuffer = product.image_data//converts to binary
                ? Buffer.from(product.image_data, "base64")
                : null;

            const sql = "INSERT INTO products (Name, Category_ID, Price, Stock_Quantity, Description, product_image) VALUES (?, ?, ?, ?, ?,?);"

            const values = [
                product.Name,
                product.Category_ID,
                product.Price,
                product.Stock_Quantity,
                product.Description,
                imageBuffer
            ];
            if (values.some(v => v === undefined || v === null || v === "")) {
                console.error("Missing product field(s):", values);
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Missing required product fields", values }));
            }
        db.query(sql,values, (err, results) => {
            if (err) {
                console.error("MySQL Insert Error:", err.sqlMessage);
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Error inserting products", error: err }));
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            console.log("Sending new product:", results);
            res.end(JSON.stringify(results));
            return; 
        });
    });
    }
    else if (parsedUrl.pathname === "/manageGiftshop" && method === "PUT") {
        
        let body = ""; 

    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", () => {

        const product = JSON.parse(body);

            const sql = "UPDATE products SET Stock_Quantity = Stock_Quantity + ? WHERE Product_ID = ?;"

        db.query(sql,[product.restock_Amount, product.Product_ID], (err, results) => {
            if (err) {
                console.error("MySQL Insert Error:", err.message);
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Error inserting products", error: err }));
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            console.log("Sending new product:", results);
            res.end(JSON.stringify(results));
            return; 
        });
    });
    }
    else if (parsedUrl.pathname === "/manageGiftshop" && method === "DELETE") {
        let body = "";
    
        req.on("data", chunk => {
            body += chunk;
        });
        req.on("end", () => {
            const product = JSON.parse(body);
            const productID = product.Product_ID;
    
        const query = "DELETE from products where product_ID = ?;";
        //change this query to link the product table
        db.query(query,[productID], (err, results) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Error deleting from cart", error: err }));
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Item deleted successfully" }));
            console.log("cart product removed")
            return; 
        });
        });
    }
};