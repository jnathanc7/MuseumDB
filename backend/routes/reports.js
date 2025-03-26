const url = require("url");
const db = require("../db"); // Import Database Connection

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // Handle CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    // GET /total-report
    if (parsedUrl.pathname === "/total-report" && method === "GET") {
        const saleType = parsedUrl.query.type || "all";
        const dateRange = parsedUrl.query.dateRange || "all-dates";

        // Base queries
        const ticketQuery = `
            SELECT 
                pt.Purchase_Ticket_ID AS Sale_ID,
                p.Customer_ID,
                'Ticket' AS Sale_Type,
                pt.Quantity * pt.Price AS Amount,
                p.Date_Purchased AS Sale_Date,
                p.Payment_Method
            FROM purchase_tickets pt
            JOIN purchases p ON pt.Purchase_ID = p.Purchase_ID
        `;

        const giftShopQuery = `
            SELECT 
                Transaction_ID AS Sale_ID,
                Customer_ID,
                'Gift Shop' AS Sale_Type,
                Total_Amount AS Amount,
                Date AS Sale_Date,
                Payment_Method
            FROM gift_shop_transactions
        `;

        const donationQuery = `
            SELECT 
                Donation_ID AS Sale_ID,
                user_ID AS Customer_ID,
                'Donation' AS Sale_Type,
                Amount,
                Date AS Sale_Date,
                Payment_Method
            FROM donations
        `;

        // Date filtering logic
        let dateFilter = "";
        if (dateRange === "last-week") {
            dateFilter = "WHERE p.Date_Purchased >= CURDATE() - INTERVAL 7 DAY";
        } else if (dateRange === "last-month") {
            dateFilter = "WHERE p.Date_Purchased >= CURDATE() - INTERVAL 1 MONTH";
        } else if (dateRange === "last-year") {
            dateFilter = "WHERE p.Date_Purchased >= CURDATE() - INTERVAL 1 YEAR";
        }

        let query = "";

        if (saleType === "tickets") {
            query = `${ticketQuery} ${dateFilter} ORDER BY Sale_Date DESC`;
        } else if (saleType === "giftshop") {
            const filter = dateFilter.replace(/p\.Date_Purchased/g, "Date");
            query = `${giftShopQuery} ${filter} ORDER BY Sale_Date DESC`;
        } else if (saleType === "donations") {
            const filter = dateFilter.replace(/p\.Date_Purchased/g, "Date");
            query = `${donationQuery} ${filter} ORDER BY Sale_Date DESC`;
        } else {
            // Combine all three for full report
            const ticket = `${ticketQuery} ${dateFilter}`;
            const giftshop = `${giftShopQuery} ${
                dateFilter ? "WHERE Date >= CURDATE() - INTERVAL " + dateRange.split("-")[1].toUpperCase() : ""
            }`;
            const donations = `${donationQuery} ${
                dateFilter ? "WHERE Date >= CURDATE() - INTERVAL " + dateRange.split("-")[1].toUpperCase() : ""
            }`;

            query = `
                ${ticket}
                UNION ALL
                ${giftshop}
                UNION ALL
                ${donations}
                ORDER BY Sale_Date DESC;
            `;
        }

        // Execute query
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

    // Unknown route
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
};

