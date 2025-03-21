const url = require("url");
const db = require("../db"); // Import Database Connection
//const authMiddleware = require("../middleware/authMiddleware"); // Import Authentication Middleware

module.exports = (req, res) => { 
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // Handle CORS (Allow frontend to communicate with backend)
    res.setHeader("Access-Control-Allow-Origin", "*"); // Adjust to your frontend URL
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }
 
    // GET /employees - Retrieve all employees from the database (PROTECTED)
    if (parsedUrl.pathname === "/employees" && method === "GET") {
        //return authMiddleware(["staff", "admin"])(req, res, () => {
            db.query("SELECT * FROM staff", (err, results) => {
                if (err) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Error retrieving employees", error: err }));
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            });

        //});
    }

    // POST /employees - Add a new employee to the database (PROTECTED)
    else if (parsedUrl.pathname === "/employees" && method === "POST") {
        //return authMiddleware("staff")(req, res, () => {
            let body = "";
            req.on("data", (chunk) => { body += chunk; });
            req.on("end", () => {
                try {
                    const newEmployee = JSON.parse(body);
                    console.log("Received New Employee Data:", newEmployee); // Debugging log

                    // Validate required fields
                    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.position || !newEmployee.hireDate || !newEmployee.salary) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ message: "Missing required fields." }));
                    }

                    // Correct SQL query (Staff_ID is auto-increment)
                    const query = `INSERT INTO Staff (First_Name, Last_Name, Phone_Number, Email, Department, Job_title, Hire_Date, Salary, Active_Status) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                    const values = [
                        newEmployee.firstName,
                        newEmployee.lastName,
                        newEmployee.phoneNumber,
                        newEmployee.email,
                        newEmployee.department,
                        newEmployee.position,
                        newEmployee.hireDate,
                        parseFloat(newEmployee.salary),
                        newEmployee.status !== undefined ? newEmployee.status : true // Default to active if not provided
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
        //});
    }


    // 🔹 PUT /employees/toggle - Activate/Deactivate Employee (PROTECTED)
    else if (parsedUrl.pathname.startsWith("/employees/toggle") && method === "PUT") {
        //return authMiddleware("staff")(req, res, () => {
            const employeeId = parsedUrl.query.id;

            if (!employeeId) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Missing employee ID." }));
            }

            // Check if employee exists
            db.query("SELECT Active_Status FROM staff WHERE Staff_ID = ?", [employeeId], (err, results) => {
                if (err || results.length === 0) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Error retrieving employee status.", error: err }));
                }

                const currentStatus = results[0].Active_Status;
                const newStatus = currentStatus === 1 ? 0 : 1; // Toggle (1 → 0, 0 → 1)
              
                db.query("UPDATE Staff SET Active_Status = ? WHERE Staff_ID = ?", [newStatus, employeeId], (err) => {
                    if (err) {
                        res.writeHead(500, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ message: "Error updating employee status.", error: err }));
                    }


                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: `Employee status updated to ${newStatus ? "Active" : "Inactive"}.` }));
                });
            });
        //});
    }

    // 🔹 Handle Unknown Routes
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
};
