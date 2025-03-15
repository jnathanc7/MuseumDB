require('dotenv').config(); // loads in .env files
const http = require("http");
const db = require('./db'); // imports database connection
const routes = require("./routes/index"); // import centralized router,
const { env } = require("process"); // extracts process.env into a shorter variable (env).

// Start HTTP Server
const server = http.createServer((req, res) => {
    routes(req, res); // 
});

server.listen(3000, () => {
    console.log(" Server is running on http://localhost:3000");
});
