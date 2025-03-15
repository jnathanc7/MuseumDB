const employeesRoutes = require("./employees"); 
const url = require("url");

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === "/") { 
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Welcome to the Museum Database API" }));
    } 
    else if (parsedUrl.pathname.startsWith("/employees")) {
        employeesRoutes(req, res);
    } 
        // can add more routes like:
    // else if (parsedUrl.pathname.startsWith("/auth")) {
    //    authRoutes(req, res);
    // } else if (parsedUrl.pathname.startsWith("/tickets")) {
    //    ticketsRoutes(req, res);
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
};
