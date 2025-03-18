The following is an explanation of the file structure:

-- db.js: holds the Database configuration connecting backend to server (ensure db.js, which is the only file and the file that connects backend to database, is added to your .gitignore file)

When a user performs an action (e.g., signing up), this is what happens step by step:

1️⃣ Frontend Calls an API Endpoint (Starts the Chain)
A user signs up → The frontend sends a POST request to /api/auth/register.

---------------------------------------------------------------------------------------------------------------------------------

2️⃣ The Route Receives the Request & Calls the Controller
📌 Route file (/routes/)

💡 Dependency:
✅ Relies on: controllers/authController.js (calls the register function).
✅ Does NOT process logic—just passes the request forward.

---------------------------------------------------------------------------------------------------------------------------------

3️⃣ The Controller Handles Business Logic & Calls the Model
📌 Controller files (/controllers/)

Function: The controller processes the request, validates input, and calls the model to interact with the database.

💡 Dependency:
✅ Relies on models/User.js (because it needs to insert user data into MySQL).
✅ Receives request from routes/auth.js.
✅ Sends response back to the route.

---------------------------------------------------------------------------------------------------------------------------------

4️⃣ The Model Executes a Query to the Database
📌 Model file (/models/)

The model interacts directly with MySQL and sends data back to the controller.

💡 Dependency:
✅ Relies on db.js to connect to MySQL.
✅ Gets called by controllers/authController.js.
✅ Executes SQL queries & sends results back to the controller.

---------------------------------------------------------------------------------------------------------------------------------

5️⃣ The Middleware Adds Extra Security (for Gabe to do authentication)
📌 Middleware file (/middleware/authMiddleware.js)

Middleware runs before a request reaches a controller (e.g., to check if a user is logged in).

💡 Dependency:
✅ Used in routes (routes/tickets.js) to protect private routes.
✅ Runs before the controller to verify the user is authenticated.
✅ If valid, request continues. If not, request is blocked.

---------------------------------------------------------------------------------------------------------------------------------

📌 Visualizing the Entire Flow THROUGH AN EXAMPLE
📜 Step-by-Step Process for Any API Call 1️⃣ Frontend Sends a Request

Example: User submits login form → Sends POST /api/auth/login
2️⃣ Route Receives Request & Calls Controller

routes/auth.js forwards the request to controllers/authController.js.
3️⃣ Controller Handles Business Logic & Calls Model

authController.js checks user input → Calls models/User.js to fetch data.
4️⃣ Model Interacts with MySQL & Returns Data

User.js runs an SQL query → Returns user data to the controller.
5️⃣ Controller Sends Response Back to Route

authController.js formats the response → Sends it back to routes/auth.js.
6️⃣ Route Returns Final Response to Frontend

The route sends the final JSON response (e.g., { success: true }).
7️⃣ Frontend Receives Data & Updates UI

If login is successful, the frontend redirects to the dashboard.

📌 Summary Table
Folder	               Function	                                          Depends On

routes/	               Defines API endpoints & forwards requests	      Calls controllers/

controllers/	       Handles request logic & calls models               Calls models/

models/	               Interacts with MySQL (database queries)	          Calls config/db.js

middleware/	           Adds extra security (e.g., authentication)	      Used in routes/

config/	               Stores database connection	                      Used in models/