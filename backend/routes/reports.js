const url = require("url");
const db = require("../db"); // Import Database Connection

module.exports = (req, res) => { 
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // Handle CORS (Allow frontend to communicate with backend)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    //  GET /reports/total-tickets - Retrieve all ticket sales
    if (parsedUrl.pathname === "/total-report" && method === "GET") {
        const saleType = parsedUrl.query.type || "all"; // Default to "all" if no type is provided
        const dateRange = parsedUrl.query.dateRange || "all-dates";
        let query = `
            SELECT Ticket_ID AS Sale_ID, Customer_ID, 'Ticket' AS Sale_Type, Price AS Amount, Date_Purchased AS Sale_Date, Payment_Method 
            FROM tickets
            UNION ALL
            SELECT Transaction_ID AS Sale_ID, Customer_ID, 'Gift Shop' AS Sale_Type, Total_Amount AS Amount, Date AS Sale_Date, Payment_Method 
            FROM gift_shop_transactions
            UNION ALL
            SELECT Donation_ID AS Sale_ID, user_ID AS Customer_ID, 'Donation' AS Sale_Type, Amount, Date AS Sale_Date, Payment_Method 
            FROM donations
            ORDER BY Sale_Date DESC;
        `;
       

        // Apply filtering for specific sale type

        if (saleType === "tickets") {
            query = `
                SELECT Ticket_ID AS Sale_ID, Customer_ID, 'Ticket' AS Sale_Type, Price AS Amount, Date_Purchased AS Sale_Date, Payment_Method 
                FROM tickets
                ORDER BY Sale_Date DESC;
            `;
        } else if (saleType === "giftshop") {
            query = `
                SELECT Transaction_ID AS Sale_ID, Customer_ID, 'Gift Shop' AS Sale_Type, Total_Amount AS Amount, Date AS Sale_Date, Payment_Method 
                FROM gift_shop_transactions
                ORDER BY Sale_Date DESC;
            `;
        } else if (saleType === "donations") {
            query = `
                SELECT Donation_ID AS Sale_ID, user_ID AS Customer_ID, 'Donation' AS Sale_Type, Amount, Date AS Sale_Date, Payment_Method 
                FROM donations
                ORDER BY Sale_Date DESC;
            `;
        }
        
        // Apply date filtering
// Apply date filtering using actual column names
// can be optimized later
if (dateRange === "last-week") {
    query = `
        SELECT Ticket_ID AS Sale_ID, Customer_ID, 'Ticket' AS Sale_Type, Price AS Amount, Date_Purchased AS Sale_Date, Payment_Method 
        FROM tickets 
        WHERE Date_Purchased >= CURDATE() - INTERVAL 7 DAY
        UNION ALL
        SELECT Transaction_ID AS Sale_ID, Customer_ID, 'Gift Shop' AS Sale_Type, Total_Amount AS Amount, Date AS Sale_Date, Payment_Method 
        FROM gift_shop_transactions 
        WHERE Date >= CURDATE() - INTERVAL 7 DAY
        UNION ALL
        SELECT Donation_ID AS Sale_ID, user_ID AS Customer_ID, 'Donation' AS Sale_Type, Amount, Date AS Sale_Date, Payment_Method 
        FROM donations 
        WHERE Date >= CURDATE() - INTERVAL 7 DAY
        ORDER BY Sale_Date DESC;
    `;
} else if (dateRange === "last-month") {
    query = `
        SELECT Ticket_ID AS Sale_ID, Customer_ID, 'Ticket' AS Sale_Type, Price AS Amount, Date_Purchased AS Sale_Date, Payment_Method 
        FROM tickets 
        WHERE Date_Purchased >= CURDATE() - INTERVAL 1 MONTH
        UNION ALL
        SELECT Transaction_ID AS Sale_ID, Customer_ID, 'Gift Shop' AS Sale_Type, Total_Amount AS Amount, Date AS Sale_Date, Payment_Method 
        FROM gift_shop_transactions 
        WHERE Date >= CURDATE() - INTERVAL 1 MONTH
        UNION ALL
        SELECT Donation_ID AS Sale_ID, user_ID AS Customer_ID, 'Donation' AS Sale_Type, Amount, Date AS Sale_Date, Payment_Method 
        FROM donations 
        WHERE Date >= CURDATE() - INTERVAL 1 MONTH
        ORDER BY Sale_Date DESC;
    `;
} else if (dateRange === "last-year") {
    query = `
        SELECT Ticket_ID AS Sale_ID, Customer_ID, 'Ticket' AS Sale_Type, Price AS Amount, Date_Purchased AS Sale_Date, Payment_Method 
        FROM tickets 
        WHERE Date_Purchased >= CURDATE() - INTERVAL 1 YEAR
        UNION ALL
        SELECT Transaction_ID AS Sale_ID, Customer_ID, 'Gift Shop' AS Sale_Type, Total_Amount AS Amount, Date AS Sale_Date, Payment_Method 
        FROM gift_shop_transactions 
        WHERE Date >= CURDATE() - INTERVAL 1 YEAR
        UNION ALL
        SELECT Donation_ID AS Sale_ID, user_ID AS Customer_ID, 'Donation' AS Sale_Type, Amount, Date AS Sale_Date, Payment_Method 
        FROM donations 
        WHERE Date >= CURDATE() - INTERVAL 1 YEAR
        ORDER BY Sale_Date DESC;
    `;
}


//  Execute the query
        db.query(query, (err, results) => {
            if (err) {
                console.error("Error retrieving total report:", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Error retrieving total report", error: err }));
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        });
        return;
    }

    // Handle Unknown Routes
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
};

