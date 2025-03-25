const url = require("url");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const nodemailer = require("nodemailer"); // send emails from Node.js
const crypto = require("crypto"); // generates reset token (random strings)
const authMiddleware = require("../middleware/authMiddleware");
require("dotenv").config(); // load environment variables

/**
 * handles incoming auth-related requests (register & login)
 */
module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;
    const { method } = req;

    if (pathname === "/auth/register" && method === "POST") {
        handleRegister(req, res);
    } 
    else if (pathname === "/auth/login" && method === "POST") {
        handleLogin(req, res);
    }
    else if (pathname === "/auth/logout" && method === "POST") {
        handleLogout(req, res);
    }
    else if (pathname === "/auth/change-password" && method === "POST") {
        authMiddleware([])(req, res, () => { // need to be protected because user needs to be logged in to change password
            handleChangePassword(req,res); 
        });
    }
    else if (pathname === "/auth/forgot-password" && method === "POST"){
        handleForgotPassword(req,res);
    }
    else if (pathname === "/auth/reset-password" && method === "POST"){
        handleResetPassword(req,res);
    }
    else if (pathname === "/auth/profile" && method === "GET") {
        // Apply authentication middleware — this ensures req.user is populated
        authMiddleware([])(req, res, () => {
        console.log("✅ /auth/profile hit");
        console.log("🧠 req.user =", req.user); // Add this
        
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: true, user: req.user }));
        
        // const userId = req.user.id;
        // const role = req.user.role;
      
        //   // If user is a customer, fetch customer profile data
        // if (role === "customer") {
        //     db.query(
        //       `SELECT 
        //           u.email, 
        //           u.role, 
        //           c.first_name, 
        //           c.last_name, 
        //           c.phone_number AS phone, 
        //           c.membership_level, 
        //           c.address
        //        FROM users u
        //        JOIN customers c ON u.user_ID = c.user_id
        //        WHERE u.user_ID = ?`,
        //       [userId],
        //       (err, results) => {
        //         if (err) {
        //           // Internal server error
        //           console.error("❌ MySQL Error in /auth/profile:", err); // Add this!
        //           res.writeHead(500, { "Content-Type": "application/json" });
        //           return res.end(JSON.stringify({ message: "Database error", error: err }));
        //         }
        //         if (results.length === 0) {
        //           // No customer found for the user
        //           res.writeHead(404, { "Content-Type": "application/json" });
        //           return res.end(JSON.stringify({ message: "Customer not found" }));
        //         }
      
        //         // Return customer profile data
        //         res.writeHead(200, { "Content-Type": "application/json" });
        //         res.end(JSON.stringify(results[0]));
        //       }
        //     );
        // }
        // else {
        //     // User is not a customer — treat as staff
        //     db.query(
        //       `SELECT 
        //           u.email, 
        //           u.role, 
        //           s.first_name, 
        //           s.last_name, 
        //           s.phone_number AS phone, 
        //           s.job_title, 
        //           s.hire_date, 
        //           s.salary, 
        //           s.address
        //        FROM users u
        //        JOIN staff s ON u.user_ID = s.user_id
        //        WHERE u.user_ID = ?`,
        //       [userId],
        //       (err, results) => {
        //         if (err) {
        //           // Internal server error
        //           res.writeHead(500, { "Content-Type": "application/json" });
        //           return res.end(JSON.stringify({ message: "Database error", error: err }));
        //         }
        //         if (results.length === 0) {
        //           // No staff profile found
        //           res.writeHead(404, { "Content-Type": "application/json" });
        //           return res.end(JSON.stringify({ message: "Staff not found" }));
        //         }
      
        //         // Return staff profile data
        //         res.writeHead(200, { "Content-Type": "application/json" });
        //         res.end(JSON.stringify(results[0]));
        //       }
        //     );
        // }
        });
      }
      
    else {
        sendResponse(res, 404, { message: "Route not found" });
    }
};

/**
 * handles user registration
 */
function handleRegister(req, res) {
    console.log("📩 Received /auth/register request");

    let body = "";

    req.on("data", (chunk) => (body += chunk));

    req.on("end", () => {
        try {
            const { email, password, role } = JSON.parse(body);
            console.log("🔍 Parsed request body:", { email, role });

            if (!email || !password || !role) {
                console.warn("⚠️ Missing required fields");
                return sendResponse(res, 400, { message: "Email, password, and role are required." });
            }

            // Step 1: Check if user already exists
            db.query("SELECT user_ID FROM users WHERE email = ?", [email], (err, results) => {
                if (err) {
                    console.error("❌ Database error while checking user:", err);
                    return sendResponse(res, 500, { message: "Database error.", error: err });
                }

                if (results.length > 0) {
                    console.warn("⚠️ Email already registered:", email);
                    return sendResponse(res, 409, { message: "Email already in use." });
                }

                // Step 2: Hash password
                bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
                    if (hashErr) {
                        console.error("❌ Password hashing error:", hashErr);
                        return sendResponse(res, 500, { message: "Error hashing password.", error: hashErr });
                    }

                    console.log("🔐 Password hashed successfully");

                    // Step 3: Insert into users table
                    const userInsertQuery = "INSERT INTO users (email, password, role, created_at) VALUES (?, ?, ?, NOW())";
                    db.query(userInsertQuery, [email, hashedPassword, role], (insertErr, result) => {
                        if (insertErr) {
                            console.error("❌ Error inserting into users table:", insertErr);
                            return sendResponse(res, 500, { message: "Error creating user.", error: insertErr });
                        }

                        const userId = result.insertId;
                        console.log("✅ User inserted into users table with ID:", userId);

                        // Step 4: Insert into domain table
                        if (role === "customer") {
                            const customerInsert = `
                                INSERT INTO customers (user_id, Customer_Type, First_Name, Last_Name, Email, Phone_Number, Birthdate)
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                            `;
                            const customerValues = [
                                userId,
                                "Regular",
                                "First",
                                "Last",
                                email,
                                "000-000-0000",
                                "2000-01-01"
                            ];

                            console.log("📤 Inserting customer record:", customerValues);

                            db.query(customerInsert, customerValues, (custErr) => {
                                if (custErr) {
                                    console.error("❌ Error inserting customer record:", custErr);
                                    return sendResponse(res, 500, { message: "Error creating customer record.", error: custErr });
                                }

                                console.log("✅ Customer inserted successfully");
                                return sendResponse(res, 201, {
                                    message: "Customer registered successfully!",
                                    user_ID: userId
                                });
                            });
                        } else {
                            const staffInsert = `
                                INSERT INTO staff (
                                    Staff_ID, First_Name, Last_Name, Job_title, Supervisor_ID,
                                    Department, Hire_Date, Email, Phone_Number,
                                    End_Date, Salary, Employee_ID, Active_Status
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `;
                            const staffValues = [
                                userId,
                                "First",
                                "Last",
                                role === "admin" ? "Administrator" : "New Hire",
                                null,
                                "Unassigned",
                                new Date(),
                                email,
                                "000-000-0000",
                                null,
                                0.00,
                                null,
                                1
                            ];

                            console.log("📤 Inserting staff record:", staffValues);

                            db.query(staffInsert, staffValues, (staffErr) => {
                                if (staffErr) {
                                    console.error("❌ Error inserting staff record:", staffErr);
                                    return sendResponse(res, 500, { message: "Error creating staff record.", error: staffErr });
                                }

                                console.log("✅ Staff inserted successfully");
                                return sendResponse(res, 201, {
                                    message: "Staff registered successfully!",
                                    user_ID: userId
                                });
                            });
                        }
                    });
                });
            });
        } catch (error) {
            console.error("❌ JSON parse error:", error);
            sendResponse(res, 400, { message: "Invalid JSON format.", error });
        }
    });
}



/**
 * handles user login
 */
function handleLogin(req, res) {
    let body = "";

    req.on("data", (chunk) => (body += chunk));

    req.on("end", () => {
        try {
            const { email, password } = JSON.parse(body);

            if (!email || !password) {
                return sendResponse(res, 400, { message: "Email and password are required." });
            }

            // check if the user exists
            db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
                if (err) return sendResponse(res, 500, { message: "Database error.", error: err });

                if (results.length === 0) {
                    return sendResponse(res, 401, { message: "Invalid email or password." });
                }

                const user = results[0];

                console.log("DEBUG: Input Password:", password);
                console.log("DEBUG: Stored Hashed Password:", user.password);

                // compare hashed password
                bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
                    if (bcryptErr || !isMatch) {
                        return sendResponse(res, 401, { message: "Invalid email or password." });
                    }
                                         
                    // generate JWT token
                    const token = jwt.sign(
                        { id: user.user_ID, role: user.role },
                        process.env.JWT_SECRET,
                        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
                    );

                    const headers = {
                        "Set-Cookie": `jwt=${token}; HttpOnly; Secure; SameSite=None; Max-Age=3600`
                    };

                    sendResponse(res, 200, { 
                        message: "Login successful", 
                        user: { id: user.user_ID, email: user.email, role: user.role } 
                    }, headers);
                });
            });
        } catch (error) {
            sendResponse(res, 400, { message: "Invalid JSON format.", error });
        }
    });
}

/**
 * logout the user by clearing the JWT cookie
 */
function handleLogout(req, res) {
    // overwrite the existing 'jwt' cookie with an empty value and an immediate expiration date
    const headers = {
        // the Expires attributes (or Max-Age) ensure the cookie is invalid immediately.
        "Set-Cookie": "jwt=; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    };

    // NOW BAM the client now has no valid JWT cookie hee hee
    sendResponse(res, 200, { message: "Logout successful" }, headers);
}

/**
 * handles password change for authenticated users
 */
function handleChangePassword(req, res) {
    let body = "";

    req.on("data", (chunk) => (body += chunk));

    req.on("end", () => {
        try {
            const { oldPassword, newPassword } = JSON.parse(body);
            const userId = req.user.id; // extract user ID from JWT

            if (!oldPassword || !newPassword) {
                return sendResponse(res, 400, { message: "Both old and new passwords are required." });
            }

            // fetch the user's stored password hash
            db.query("SELECT password FROM users WHERE user_ID = ?", [userId], (err, results) => {
                if (err) return sendResponse(res, 500, { message: "Database error.", error: err });
                if (results.length === 0) return sendResponse(res, 404, { message: "User not found." });

                const storedHash = results[0].password;

                // compare old password with the stored hash
                bcrypt.compare(oldPassword, storedHash, (bcryptErr, isMatch) => {
                    if (bcryptErr || !isMatch) {
                        return sendResponse(res, 401, { message: "Incorrect old password." });
                    }

                    // hash new password
                    bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
                        if (hashErr) return sendResponse(res, 500, { message: "Error hashing new password.", error: hashErr });

                        // update the password in the database
                        db.query("UPDATE users SET password = ? WHERE user_ID = ?", [hashedPassword, userId], (updateErr) => {
                            if (updateErr) return sendResponse(res, 500, { message: "Error updating password.", error: updateErr });

                            sendResponse(res, 200, { message: "Password changed successfully!" });
                        });
                    });
                });
            });
        } catch (error) {
            sendResponse(res, 400, { message: "Invalid JSON format.", error });
        }
    });
}

/**
 * handles password reset requests
 */
function handleForgotPassword(req, res) {
    let body = "";

    req.on("data", (chunk) => (body += chunk));

    req.on("end", () => {
        try {
            const { email } = JSON.parse(body);

            if (!email) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Email is required." }));
            }

            console.log(`Password reset requested for: ${email}`); // DEBUGGING

            // check if user exists
            db.query("SELECT user_ID FROM users WHERE email = ?", [email], (err, results) => {
                if (err) {
                    console.error("Database error during user lookup:", err);
                    res.writeHead(500, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Database error." }));
                }
                if (results.length === 0) {
                    console.warn("Password reset requested for non-existent email:", email);
                    res.writeHead(404, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "User not found." }));
                }

                const userId = results[0].user_ID;

                // generate a secure reset token
                const resetToken = crypto.randomBytes(32).toString("hex");
                const hashedToken = bcrypt.hashSync(resetToken, 10); // store hashed version in DB
                const expiryTime = new Date(Date.now() + 60 * 60 * 1000); // token valid for 1 hour

                console.log(`Generated reset token for user ${userId}`); // DEBUGGING

                // remove old reset tokens before inserting a new one
                db.query("UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE user_ID = ?", [userId], (clearErr) => {
                    if (clearErr) {
                        console.error("Error clearing old reset token:", clearErr);
                        res.writeHead(500, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ message: "Error processing request." }));
                    }

                    // store the new reset token in DB
                    db.query(
                        "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE user_ID = ?",
                        [hashedToken, expiryTime, userId],
                        (updateErr) => {
                            if (updateErr) {
                                console.error("Error storing reset token:", updateErr);
                                res.writeHead(500, { "Content-Type": "application/json" });
                                return res.end(JSON.stringify({ message: "Error storing reset token." }));
                            }

                            console.log(`Reset token saved for user ${userId}, expires at ${expiryTime}`); // DEBUGGING

                            // send password reset email
                            sendPasswordResetEmail(email, resetToken);

                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ message: "A password reset link has been sent to your email!" }));
                        }
                    );
                });
            });

        } catch (error) {
            console.error("Invalid JSON format in request:", error);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid JSON format." }));
        }
    });
}

/**
 * handles password reset using a token
 */
function handleResetPassword(req, res) {
    let body = "";

    req.on("data", (chunk) => (body += chunk));

    req.on("end", () => {
        try {
            const { resetToken, newPassword } = JSON.parse(body);

            if (!resetToken || !newPassword) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Reset token and new password are required." }));
            }

            console.log(`Password reset attempt with token: ${resetToken.substring(0, 10)}...`); // DEBUGGING

            // Find the user by reset token and check expiration
            db.query("SELECT user_ID, reset_token, reset_token_expiry FROM users WHERE reset_token IS NOT NULL", [], (err, results) => {
                if (err) {
                    console.error("Database error during token lookup:", err);
                    res.writeHead(500, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Database error." }));
                }

                // Check if token matches any stored hash
                let user = null;
                for (let i = 0; i < results.length; i++) {
                    if (bcrypt.compareSync(resetToken, results[i].reset_token)) {
                        user = results[i];
                        break;
                    }
                }

                if (!user) {
                    console.warn("Invalid or expired reset token attempt.");
                    res.writeHead(401, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Invalid or expired reset token." }));
                }

                const { user_ID, reset_token_expiry } = user;

                // Check if reset token is expired
                if (new Date(reset_token_expiry) < new Date()) {
                    console.warn(`Reset token expired for user ${user_ID}`);
                    res.writeHead(401, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Reset token has expired. Request a new one." }));
                }

                console.log(`Valid reset token for user ID: ${user_ID}`);  // DEBUGGING

                // Hash the new password
                bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
                    if (hashErr) {
                        console.error("Error hashing new password:", hashErr);
                        res.writeHead(500, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ message: "Error hashing password." }));
                    }

                    // Update password and clear reset token
                    db.query("UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_ID = ?", 
                        [hashedPassword, user_ID], 
                        (updateErr) => {
                            if (updateErr) {
                                console.error("Error updating password:", updateErr);
                                res.writeHead(500, { "Content-Type": "application/json" });
                                return res.end(JSON.stringify({ message: "Error updating password." }));
                            }

                            console.log(`Password reset successfully for user ID: ${user_ID}`); // DEBUGGING
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ message: "Password reset successfully!" }));
                        }
                    );
                });
            });

        } catch (error) {
            console.error("Invalid JSON format in request:", error);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid JSON format." }));
        }
    });
}


/**
 * sends a password reset email with a reset token
 */
function sendPasswordResetEmail(userEmail, resetToken) {

    // edge cases 
    if (!userEmail || !resetToken) {
        console.error("Error: Missing email or reset token.");
        return;
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Error: Missing email credentials in environment variables.");
        return;
    }

    // creates a transporter object to send emails with `nodemailer.createTransport()` initializes an SMTP transporter
    const transporter = nodemailer.createTransport({
        service: "gmail", // gmail is service provider
        auth: {
            user: process.env.EMAIL_USER, // email address used to send the email
            pass: process.env.EMAIL_PASS, // app-specific password for authentication
        },
    });

    // generates the password reset link with the token as a parameter.
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    // const resetLink = `https://museum-db-kappa.vercel.app/reset-password?token=${resetToken}`; // Uncomment for production

    // email content
    const mailOptions = {
        from: process.env.EMAIL_USER, // The sender's email address.
        to: userEmail, // The recipient's email address.
        subject: "Museum Database Team 13 - Password Reset!", // Email subject line.
        text: `Click the link below to reset your password:\n${resetLink}`, // Plain text version of the email.
        html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`, // HTML version for better formatting.
    };

    // sends the email using the transporter object and mailOptions parameter
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Email Sending Error:", err); // Logs the error if the email fails to send.
        } else {
            console.log(`Password reset email sent to ${userEmail}:`, info.response); // Logs success message.
        }
    });

}

/**
 *  retrieves the currently logged-in user's info from the DB for display
 */
function handleProfile(req, res) {
    const userId = req.user.id; // from JWT
    // Example: just fetch the user’s row from 'users'
    db.query("SELECT user_ID, email, role FROM users WHERE user_ID = ?", [userId], (err, results) => {
        if (err) {
            return sendResponse(res, 500, { message: "Database error.", error: err });
        }
        if (results.length === 0) {
            return sendResponse(res, 404, { message: "User not found in database." });
        }

        // For more detail, you might also query staff/customers table. This is just a basic example.
        const userData = results[0];
        // Return fields we want front-end to display
        sendResponse(res, 200, { 
            user_ID: userData.user_ID, 
            email: userData.email, 
            role: userData.role 
        });
    });
}

/**
 * sends a structured JSON response.
 */
function sendResponse(res, statusCode, payload, headers = {}) {
    res.writeHead(statusCode, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
}
