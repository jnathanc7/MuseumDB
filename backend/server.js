const http = require("http");
const employeesRoutes = require("./routes/employees"); //  Import Employees Routes

// Start HTTP Server
const server = http.createServer((req, res) => {
    employeesRoutes(req, res); //  Delegate employee routes
});

server.listen(3000, () => {
    console.log(" Server is running on http://localhost:3000");
});
