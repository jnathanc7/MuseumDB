const url = require("url");
const db = require("../db");


function sendSummary(query, results, res, errorMessage) {
    db.query(query, (summaryErr, summaryResult) => {
        if (summaryErr) {
            console.error(errorMessage, summaryErr);
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: errorMessage, error: summaryErr }));
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            sales: results,
            summary: summaryResult[0] || {}
        }));
    });
}

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    

    // GET /total-report
    if (parsedUrl.pathname === "/total-report" && method === "GET") {
        const saleType = parsedUrl.query.type || "all";
        const dateRange = parsedUrl.query.dateRange || "all-dates";

        // Prepare date filters
        let ticketDateFilter = "";
        let giftshopDateFilter = "";
        let donationDateFilter = "";

        if (dateRange === "last-week") {
            ticketDateFilter = "WHERE p.Date_Purchased >= CURDATE() - INTERVAL 7 DAY";
            giftshopDateFilter = "WHERE Date >= CURDATE() - INTERVAL 7 DAY";
            donationDateFilter = "WHERE Date >= CURDATE() - INTERVAL 7 DAY";
        } else if (dateRange === "last-month") {
            ticketDateFilter = "WHERE p.Date_Purchased >= CURDATE() - INTERVAL 1 MONTH";
            giftshopDateFilter = "WHERE Date >= CURDATE() - INTERVAL 1 MONTH";
            donationDateFilter = "WHERE Date >= CURDATE() - INTERVAL 1 MONTH";
        } else if (dateRange === "last-year") {
            ticketDateFilter = "WHERE p.Date_Purchased >= CURDATE() - INTERVAL 1 YEAR";
            giftshopDateFilter = "WHERE Date >= CURDATE() - INTERVAL 1 YEAR";
            donationDateFilter = "WHERE Date >= CURDATE() - INTERVAL 1 YEAR";
        }

        // Queries
        const ticketQuery = `
        SELECT 
            CONCAT(pt.Purchase_ID, '-', pt.Ticket_ID) AS Sale_ID,
            CONCAT(c.First_Name, ' ', c.Last_Name) AS Customer_Name,
            'Ticket' AS Sale_Type,
            pt.Quantity * pt.Price AS Amount,
            p.Date_Purchased AS Sale_Date,
            p.Payment_Method
        FROM purchase_tickets pt
        JOIN purchases p ON pt.Purchase_ID = p.Purchase_ID
        JOIN customers c ON p.Customer_ID = c.Customer_ID
        ${ticketDateFilter}
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
            ${giftshopDateFilter}
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
            ${donationDateFilter}
        `;

        let query = "";

        if (saleType === "tickets") {
            query = `${ticketQuery} ORDER BY Sale_Date DESC`;
        } else if (saleType === "giftshop") {
            query = `${giftShopQuery} ORDER BY Sale_Date DESC`;
        } else if (saleType === "donations") {
            query = `${donationQuery} ORDER BY Sale_Date DESC`;
        } else {
            query = `
                ${ticketQuery}
                UNION ALL
                ${giftShopQuery}
                UNION ALL
                ${donationQuery}
                ORDER BY Sale_Date DESC
            `;
        }

        // Main query
        db.query(query, (err, results) => {
            if (err) {
                console.error("Error retrieving total report:", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Error retrieving total report", error: err }));
            }

            if (saleType === "tickets") {
                // Add summary query for tickets
                const summaryQuery = `
                SELECT
                    COUNT(*) AS total_transactions,
                    SUM(pt.Quantity) AS total_tickets_sold,
                    SUM(pt.Quantity * pt.Price) AS total_revenue,
                    (
                        SELECT CONCAT(c.First_Name, ' ', c.Last_Name)
                        FROM purchase_tickets pt2
                        JOIN purchases p ON pt2.Purchase_ID = p.Purchase_ID
                        JOIN customers c ON p.Customer_ID = c.Customer_ID
                        GROUP BY p.Customer_ID
                        ORDER BY SUM(pt2.Quantity) DESC
                        LIMIT 1
                    ) AS most_active_customer
                FROM purchase_tickets pt
                JOIN purchases p ON pt.Purchase_ID = p.Purchase_ID
                ${ticketDateFilter}
            `;
            sendSummary(summaryQuery, results, res, "Error retrieving ticket summary");

            



            }  else if (saleType === "all") {
                const fullSummaryQuery = `
                    SELECT
                        (
                            (SELECT COUNT(*) FROM purchase_tickets pt JOIN purchases p ON pt.Purchase_ID = p.Purchase_ID ${ticketDateFilter}) +
                            (SELECT COUNT(*) FROM gift_shop_transactions ${giftshopDateFilter}) +
                            (SELECT COUNT(*) FROM donations ${donationDateFilter})
                        ) AS total_transactions,

                        (
                            (SELECT IFNULL(SUM(pt.Quantity * pt.Price), 0) FROM purchase_tickets pt JOIN purchases p ON pt.Purchase_ID = p.Purchase_ID ${ticketDateFilter}) +
                            (SELECT IFNULL(SUM(Total_Amount), 0) FROM gift_shop_transactions ${giftshopDateFilter}) +
                            (SELECT IFNULL(SUM(Amount), 0) FROM donations ${donationDateFilter})
                        ) AS total_revenue,

                        (
                            SELECT Customer_Name FROM (
                                SELECT CONCAT(c.First_Name, ' ', c.Last_Name) AS Customer_Name, COUNT(*) AS activity
                                FROM purchases p
                                JOIN customers c ON p.Customer_ID = c.Customer_ID
                                ${ticketDateFilter}
                                GROUP BY c.Customer_ID

                                UNION ALL

                                SELECT Customer_ID AS Customer_Name, COUNT(*) AS activity
                                FROM gift_shop_transactions
                                ${giftshopDateFilter}
                                GROUP BY Customer_ID

                                UNION ALL

                                SELECT user_ID AS Customer_Name, COUNT(*) AS activity
                                FROM donations
                                ${donationDateFilter}
                                GROUP BY user_ID
                            ) AS combined
                            GROUP BY Customer_Name
                            ORDER BY SUM(activity) DESC
                            LIMIT 1
                        ) AS most_active_customer
                `;

                sendSummary(fullSummaryQuery, results, res, "Error retrieving full summary");

            }
            else if (saleType === "giftshop") {
                const summaryQuery = `
                    SELECT
                        COUNT(*) AS total_transactions,
                        SUM(gsi.Quantity * gsi.Price_Per_Unit) AS total_revenue,
                        SUM(gsi.Quantity) AS total_items_sold,
                        (
                            SELECT p.Name
                            FROM gift_shop_items gsi2
                            JOIN products p ON gsi2.Product_ID = p.Product_ID
                            GROUP BY gsi2.Product_ID
                            ORDER BY SUM(gsi2.Quantity) DESC
                            LIMIT 1
                        ) AS most_sold_product,
                        (
                            SELECT p.Name
                            FROM gift_shop_items gsi3
                            JOIN products p ON gsi3.Product_ID = p.Product_ID
                            GROUP BY gsi3.Product_ID
                            ORDER BY SUM(gsi3.Quantity * gsi3.Price_Per_Unit) DESC
                            LIMIT 1
                        ) AS top_revenue_product
                    FROM gift_shop_items gsi
                    JOIN gift_shop_transactions gst ON gsi.Transaction_ID = gst.Transaction_ID
                    ${giftshopDateFilter}
                `;

                sendSummary(summaryQuery, results, res, "Error retrieving gift shop summary");
            

            }
            
            
            
            
            else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ sales: results }));
            }

        });

        return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
};
