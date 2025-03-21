// mySQL database connection
require('dotenv').config(); // Load environment variables
 
const mySQL = require('mysql2');
const fs = require("fs"); // had to add this
const path = require("path"); // Import path module

const connection = mySQL.createConnection({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { 
        rejectUnauthorized: true, // had to change this to use extension
        ca: fs.readFileSync(path.resolve(__dirname, process.env.DB_SSL_CERT)) //  Load the SSL certificate
    }
});

//connect to databases
connection.connect(err => {
    if (err) {
        console.error('Database Connection Failed:', err.stack);
        return; 
    }
    console.log("Database Connection made! Success!");
})

module.exports = connection; 