
const mySQL = require('mysql2');

const connection = mySQL.createConnection({
    host: 'museum-db.mysql.database.azure.com', 
    user: 'dbadmin',
    password: 'MuseumGroup13', 
    database: 'db',
    port: '3306',
    ssl: { rejectUnauthorized: true }
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