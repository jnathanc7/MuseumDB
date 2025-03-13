const mySQL = require('mysql2');
const fs = require("fs"); // had to add this
const connection = mySQL.createConnection({
    host: 'museum-db.mysql.database.azure.com', 
    user: 'dbadmin',
    password: 'MuseumGroup13', 
    database: 'db',
    port: '3306',
    ssl: { 
        rejectUnauthorized: true, // had to change this to use extension
        ca: fs.readFileSync(__dirname + "/combined-ca.pem") //  Load the SSL certificate
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