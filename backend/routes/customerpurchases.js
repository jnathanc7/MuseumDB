const url = require("url");
const db = require("../db");

module.exports = (req, res) => {

    const parsedUrl = url.parse(req.url, true);
    const customerId = parsedUrl.query.id;

    if (!customerId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Missing customer ID" }));
        
    }
  
    const purchaseQuery = `
        SELECT 
        pt.Purchase_ID, 
        pt.Quantity, 
        pt.Ticket_Type, 
        pt.Price, 
        (pt.Quantity * pt.Price) AS Total,
        p.Date_Purchased AS Date, 
        'ticket' AS Type
        FROM purchase_tickets pt
        JOIN purchases p ON pt.Purchase_ID = p.Purchase_ID
        WHERE p.Customer_ID = ?

  `;
  
  
    const giftshopQuery = `
      SELECT Transaction_ID AS ID, Date, Total_Amount AS Amount, Payment_Method, 'giftshop' AS Type
      FROM gift_shop_transactions
      WHERE customer_ID = ?
    `;
  
    const membershipQuery = `
      SELECT membership_id AS ID, membership_type, payment_type, payment_amount, start_date AS Date, status, 'membership' AS Type
      FROM memberships
      WHERE customer_id = ?
    `;
  
    const db = require("../db");
    Promise.all([
      new Promise((resolve, reject) => db.query(purchaseQuery, [customerId], (err, res) => err ? reject(err) : resolve(res))),
      new Promise((resolve, reject) => db.query(giftshopQuery, [customerId], (err, res) => err ? reject(err) : resolve(res))),
      new Promise((resolve, reject) => db.query(membershipQuery, [customerId], (err, res) => err ? reject(err) : resolve(res))),
    ])
      .then(([tickets, giftshop, memberships]) => {
        const history = [...tickets, ...giftshop, ...memberships];
        history.sort((a, b) => new Date(b.Date) - new Date(a.Date)); // sort by latest first
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(history));

      })
      .catch((error) => {
        console.error("Error getting customer history:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Server error", error }));

      });
  };
  