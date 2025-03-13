const url = require("url");
const db = require("../connect"); // Import Database Connection

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // Handle CORS (Allow frontend to communicate with backend)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    //  GET /employees - Retrieve all employees from the database
    if (parsedUrl.pathname === "/employees" && method === "GET") {
        db.query("SELECT * FROM staff", (err, results) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Error retrieving employees", error: err }));
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        });
    }

    //  POST /employees - Add a new employee to the database
    else if (parsedUrl.pathname === "/employees" && method === "POST") {
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", () => {
            try {
                const newEmployee = JSON.parse(body);

                //  Validate required fields
                if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.position || !newEmployee.hireDate || !newEmployee.salary) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Missing required fields." }));
                }

                //  Correct SQL query (Staff_ID is auto-increment)
                const query = `INSERT INTO staff (First_Name, Last_Name, Job_title, Hire_Date, Salary) 
                               VALUES (?, ?, ?, ?, ?)`;

                const values = [
                    newEmployee.firstName, 
                    newEmployee.lastName, 
                    newEmployee.position, 
                    newEmployee.hireDate, 
                    parseFloat(newEmployee.salary)
                ];

                db.query(query, values, (err, results) => {
                    if (err) {
                        console.error("Database Insert Error:", err);
                        res.writeHead(500, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ message: "Error adding employee", error: err }));
                    }
                    
                    res.writeHead(201, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Employee added successfully!", insertedId: results.insertId }));
                });
            } catch (error) {
                console.error("Invalid JSON format:", error);
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Invalid JSON format" }));
            }
        });
    }

    // 🔹 Handle Unknown Routes
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
};
