const connection = require('./connect.js');

connection.query('SELECT 1', (err, results) => {
    if (err) {
        console.error('Query Failed:', err);
        return; 
    }
    else{
        console.log("Database Connection made:", results);
    }
    connection.end();
})