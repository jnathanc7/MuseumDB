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
    "http://localhost:5173", // gabe local frontend
];
 
// Start HTTP Server
const server = http.createServer((req, res) => { 
    
    // CORS Headers below
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    const parsedUrl = url.parse(req.url, true);      

    if (parsedUrl.pathname === "/") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Welcome to the Museum Database API" }));
        return;
    }
    else if (parsedUrl.pathname.startsWith("/auth")) {
        authRoutes(req, res);
        return;
    }
    else if (parsedUrl.pathname.startsWith("/employees")) {
        // authMiddleware(["staff", "admin"])(req, res, () => {
            employeesRoutes(req, res, parsedUrl);
        // });
        return;
    }
    else if (parsedUrl.pathname.startsWith("/total-report")) {
        // authMiddleware("admin")(req, res, () => {
            reportsRoutes(req, res);
        // });
        return;
    }
    else if (parsedUrl.pathname.startsWith("/exhibition-report")) {
        // authMiddleware(["staff", "admin"])(req, res, () => {
            exhibitionReportRoutes(req, res);
        // });
        return;
    }
    else if (req.url.startsWith("/complaints")) {
        // authMiddleware(["staff", "admin"])(req, res, () => {
            complaintsRoutes(req, res);
        // });
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
        ticketsRoutes(req, res);
        return;
    }
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
