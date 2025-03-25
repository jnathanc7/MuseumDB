const http = require("http"); // Import Node.js HTTP module to create a server
const url = require("url"); // Import URL module for parsing request URLs
const employeesRoutes = require("./routes/employees"); // Import employees routes
const reportsRoutes = require("./routes/reports"); // Import reports routes
const authRoutes = require("./routes/auth"); // Import authentication routes
const authMiddleware = require("./middleware/authMiddleware"); // Import authentication middleware
const giftshopRoutes = require("./routes/giftshop") //import giftshop routes

const shopCartRoutes = require("./routes/shopcart") //import giftshop routes
const complaintsRoutes = require("./routes/complaints");
const exhibitionReportRoutes = require("./routes/exhibitionReport"); 


const ticketsRoutes = require("./routes/tickets"); // Import tickets routes

const allowedOrigins = [
    "https://museum-db-kappa.vercel.app", // Vercel frontend (adjust if different)
    "http://localhost:5180", // Local frontend
];
 
// Start HTTP Server
const server = http.createServer((req, res) => { 
    
    // CORS Headers below
    // res.setHeader("Access-Control-Allow-Origin", "https://museum-db-kappa.vercel.app/");
    // if testing locally, change port accordingly
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    // allows the methods you expect from the frontend access
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    // lists which headers the frontend can send (content-type: JSON requests) and (authorization: allows sending JWT tokens in request headers)
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    // necessary for cross-origin requests involving cookies:
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // for preflight requests (OPTIONS - HTTP method that asks server what it allows before sending an actual request):
    if (req.method === "OPTIONS") {
        // eror 204 = No Content (frontend request is good to go)
        res.writeHead(204);
        return res.end();
    }

    // Parse the incoming request URL into a structured object, allows us to separate url into chunks
    const parsedUrl = url.parse(req.url, true);      
    // public route (home page)
    if (parsedUrl.pathname === "/") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Welcome to the Museum Database API" }));
        return; // Stop further execution
    }
    // public route authentication by signing in 
    else if (parsedUrl.pathname.startsWith("/auth")) {
        authRoutes(req, res);
        return;
    }
    // check if employeesRoutes should handle the request
    else if (parsedUrl.pathname.startsWith("/employees")) {
        authMiddleware(["staff", "admin"])(req, res, () => {
            employeesRoutes(req, res, parsedUrl); // Pass parsed URL to employee routes
        });
        return;
    }
    // or reportsRoutes should handle it (will implement auth-access)
    else if (parsedUrl.pathname.startsWith("/total-report")) { // Ensure it calls reportsRoutes correctly
        // authMiddleware("admin")(req, res, () => {
            reportsRoutes(req, res);
        // });
        return;
    }
    else if (parsedUrl.pathname.startsWith("/exhibition-report")) {  // New exhibition report route
        exhibitionReportRoutes(req, res);
        return;
    }

        // Complaints route
    else if (req.url.startsWith("/complaints")) {
        complaintsRoutes(req, res);
        return;

    }
    else if (parsedUrl.pathname.startsWith("/cart")) {
        shopCartRoutes(req, res);
        return;
    }
    else if (parsedUrl.pathname.startsWith("/giftshop")) {
            giftshopRoutes(req, res);
            return;
    }
    else if (parsedUrl.pathname.startsWith("/tickets")) {
        ticketsRoutes(req, res);
        return;
    }
    else if (parsedUrl.pathname.startsWith("/purchase")) {
        ticketsRoutes(req, res); // Direct purchase requests to tickets.js
        return;
    }
    



    // REFERENCE EMPLOYEE ROUTE TO SEE HOW TO RESTICT USER ACCESS while wrapping with authMiddleware

    // can add more protected routes like for (e.g., tickets, gift shop, admin dashboard):
    // else if (parsedUrl.pathname.startsWith("/tickets")) {  **ONLY CUSTOMER CAN ACCESS /tickets and goes through log in process
    //     authMiddleware("customer")(req, res, () => {
    //         ticketsRoutes(req, res);
    //     });
    // } 

    // else if (parsedUrl.pathname.startsWith("/admin")) { **ONLY ADMIN CAN ACCESS /ADMIN and goes through log in process
    //     authMiddleware("admin")(req, res, () => {
    //         adminRoutes(req, res);
    //     });
    // }

    // else if (parsedUrl.pathname.startsWith("/tickets")) {  **ANYONE CAN ACCESS /tickets but goes through log in process
    //     authMiddleware(req, res, () => {
    //         ticketsRoutes(req, res);
    //     });
    // } 

    // } else if (parsedUrl.pathname.startsWith("/tickets")) { **ANYONE CAN ACCESS /tickts
    //    ticketsRoutes(req, res);
    // }
    // for unknown routes
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
});

const PORT = process.env.PORT || 3000; // Use Render's assigned port or default to 3000 locally

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
});

