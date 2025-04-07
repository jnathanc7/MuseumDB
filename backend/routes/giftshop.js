const url = require("url");
const db = require("../db"); // Import Database Connection
const authMiddleware = require("../middleware/authMiddleware");

//need to add authmiddleware to allow us to know what user is adding to the cart from there we extract from the shopcart based on the customer id
//right now shopcart is universal so every user has access to everyones shopcart
//need to alter shopcart table to include customer_id

module.exports = async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
    const method = req.method;
    console.log(`Incoming request: ${method} ${parsedUrl.pathname}`);
    console.log("Path segments:", pathSegments);
    
    // Handle CORS (Allow frontend to communicate with backend)
    res.setHeader("Access-Control-Allow-Origin","https://museum-db-kappa.vercel.app");
    res.setHeader("Access-Control-Allow-Credentials", "true");
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
        const { default: imageType } = await import('image-type');
      
        try {
          const results = await new Promise((resolve, reject) => {
            db.query(
              "SELECT P.* FROM products AS P WHERE P.Product_ID = ?",
              [productid],
              (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
              }
            );
          });
      
          if (!results || results.length === 0) {
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Product not found" }));
          }
      
          const product = results[0];
      
          let viewing_image = null;
          let mimeType = null;
      
          if (product.product_image) {
            const buffer = product.product_image;
            const detected = await imageType(buffer);
            mimeType = detected ? detected.mime : "application/octet-stream";
            viewing_image = buffer.toString("base64");
          }
      
          const processedProduct = {
            ...product,
            viewing_image,
            mimeType,
          };
      
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(processedProduct));
          console.log("Sent processed single product with image");
        } catch (err) {
          console.error("Error retrieving product:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Error retrieving product", error: err }));
        }
      }
      
    
    //  POST /giftshop/(categoryname)/(productid) - Send product to shop cart 
    //only need to add authmiddleware to this request to add a customerid to shopcart table from there fetch and delete make the query based on the customerid
    else if (pathSegments[0] === 'giftshop' && pathSegments.length === 3 && method === "POST") {
        authMiddleware([])(req, res, () => {
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", () =>{
            const product = JSON.parse(body);
            console.log("Received product in POSTsss:", product);
            const customer_ID = req.user.id;
            const checkQuery = "SELECT Cart_Item_ID, Quantity FROM shopping_cart WHERE Product_ID = ? AND customer_ID = ?";
            
            db.query(checkQuery, [product.Product_ID, customer_ID], (err, rows) => {
                if (err) {
                    console.log("Database Query failed", err);
                    res.writeHead(500, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Error checking cart", error: err }));                
                }
                if (product.Quantity === 0) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Quantity cannot be zero." }));
                }
                else if(rows.length > 0){
                    // we first select all the rows where product_id = ? if we get more than 0 then the cart already contains that product hence we update rather than insert
                    const updateQuery = "UPDATE shopping_cart SET Quantity = Quantity + ? WHERE Product_ID = ? AND customer_ID = ?";
                    db.query(updateQuery, [product.Quantity, product.Product_ID, customer_ID], (updateErr, updateResults) => {
                        if (updateErr) {
                            console.log("Error updating cart:", updateErr);
                            res.writeHead(500, { "Content-Type": "application/json" });
                            return res.end(JSON.stringify({ message: "Error updating cart", error: updateErr }));
                        }
                        console.log("Cart updated successfully!", updateResults);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ message: "Quantity updated successfully!" }));
                    });
                }
                //maintain autoincrement consistency; increment only when a new product is added rather than a dupe
                else {
                    // Step 3: If product does NOT exist, insert it (Cart_Item_ID will auto-increment)
                    const insertQuery = "INSERT INTO shopping_cart (Product_ID, Quantity, customer_ID) VALUES (?, ?, ?)";
                    db.query(insertQuery, [product.Product_ID, product.Quantity, customer_ID], (insertErr, insertResults) => {
                        if (insertErr) {
                            console.log("Error inserting into cart:", insertErr);
                            res.writeHead(500, { "Content-Type": "application/json" });
                            return res.end(JSON.stringify({ message: "Error adding to cart", error: insertErr }));
                        }
                        console.log("Product added to cart with ID:", insertResults.insertId);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ message: "Product added to cart successfully!" }));
                    }); 
                }
        });
    });
  });
 }

    //  GET /giftshop/(categoryname) - Retrieve all products of given category from database
    else if (pathSegments[0] === 'giftshop' && pathSegments.length === 2 && method === "GET") {
        const category = decodeURIComponent(pathSegments[1]);
        const { default: imageType } = await import('image-type');
        console.log(`i am category: ${category}`);
      
        try {
          // Wrap db.query in a Promise so you can await it
          const results = await new Promise((resolve, reject) => {
            db.query(
              "SELECT P.* FROM products AS P, product_categories AS PC WHERE P.Category_ID = PC.Category_ID AND PC.Name = ?",
              [category],
              (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
              }
            );
          });
      
          // Now safely use await inside your async context
          const processedResults = await Promise.all(results.map(async (item) => {
            if (item.product_image) {
              const buffer = item.product_image;
              const detected = await imageType(buffer);
              const mimeType = detected ? detected.mime : "application/octet-stream";
      
              return {
                ...item,
                viewing_image: buffer.toString("base64"),
                mimeType
              };
            }
      
            return {
              ...item,
              viewing_image: null,
              mimeType: null
            };
          }));
      
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(processedResults));
          console.log("Sent processed results to frontend");
      
        } catch (err) {
          console.error("Database Query failed", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Error retrieving products", error: err }));
        }
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