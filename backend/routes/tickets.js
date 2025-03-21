const url = require("url");
const db = require("../db"); // Import Database Connection

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // Handle CORS (Allow frontend to communicate with backend)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle GET /tickets - Fetch available tickets
    if (method === 'GET' && parsedUrl.pathname === '/tickets') {
        const query = 'SELECT * FROM tickets'; // Fetch available tickets
        db.query(query, (err, results) => {
            if (err) {
                res.statusCode = 500;
                res.end('Error fetching tickets');
                return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(results)); // Return available tickets as JSON
        });
    }

    // Handle POST /purchase - Purchase a ticket
    if (method === 'POST' && parsedUrl.pathname === '/purchase') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            const { ticket_id, customer_name, customer_email, quantity } = JSON.parse(body);

            const checkQuery = 'SELECT available, price FROM tickets WHERE id = ?';
            db.query(checkQuery, [ticket_id], (err, result) => {
                if (err || result.length === 0) {
                    res.statusCode = 400;
                    res.end('Ticket not found');
                    return;
                }

                const available = result[0].available;
                const price = result[0].price;

                if (available < quantity) {
                    res.statusCode = 400;
                    res.end('Not enough tickets available');
                    return;
                }

                const totalPrice = price * quantity;
                const updateQuery = 'UPDATE tickets SET available = available - ? WHERE id = ?';
                db.query(updateQuery, [quantity, ticket_id], (err) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end('Error updating ticket availability');
                        return;
                    }

                    const insertPurchaseQuery = 'INSERT INTO purchases (ticket_id, customer_name, customer_email, quantity, total_price) VALUES (?, ?, ?, ?, ?)';
                    db.query(insertPurchaseQuery, [ticket_id, customer_name, customer_email, quantity, totalPrice], (err) => {
                        if (err) {
                            res.statusCode = 500;
                            res.end('Error recording purchase');
                            return;
                        }

                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ message: 'Purchase successful', totalPrice }));
                    });
                });
            });
        });
    }

    // Handle PUT /tickets/{id} - Update ticket availability
    if (method === 'PUT' && parsedUrl.pathname.startsWith('/tickets/')) {
        const ticket_id = parsedUrl.pathname.split('/')[2];
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            const { quantity } = JSON.parse(body);

            if (isNaN(quantity) || quantity < 0) {
                res.statusCode = 400;
                res.end('Invalid quantity');
                return;
            }

            const query = 'UPDATE tickets SET available = available + ? WHERE id = ?';
            db.query(query, [quantity, ticket_id], (err) => {
                if (err) {
                    res.statusCode = 500;
                    res.end('Error updating ticket availability');
                    return;
                }

                res.statusCode = 200;
                res.end('Ticket availability updated');
            });
        });
    }

    // Handle OPTIONS /tickets - CORS Preflight
    if (method === 'OPTIONS' && parsedUrl.pathname === '/tickets') {
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.end();
    }
};
