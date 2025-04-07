const db = require("../db");

const notificationsRoutes = (req, res, parsedUrl) => {
  // GET all notifications with optional filtering
  if (req.method === "GET" && parsedUrl.pathname === "/notifications") {
    const queryParams = parsedUrl.query || {};
    let sql = "SELECT * FROM notifications";
    let params = [];
    
    // Modified filtering logic to match UI tabs
    if (queryParams.status === "unread") {
      sql += " WHERE status = 'unread'";
    } else if (queryParams.status === "read") {
      sql += " WHERE status = 'read'";
    } else if (queryParams.status === "archived") {
      sql += " WHERE status = 'archived'";
    } else {
      // "All" tab should show everything except archived
      sql += " WHERE status != 'archived'";
    }
    
    sql += " ORDER BY created_at DESC";
    
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Error fetching notifications:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Failed to fetch notifications" }));
      }
      
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(results));
    });
    
    return;
  }
  
  // GET archived notifications
  if (req.method === "GET" && parsedUrl.pathname === "/notifications/archived") {
    db.query(
      "SELECT * FROM notifications WHERE status = 'archived' ORDER BY created_at DESC",
      (err, results) => {
        if (err) {
          console.error("Error fetching archived notifications:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Failed to fetch archived notifications" }));
        }
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
      }
    );
    return;
  }
  
  // PATCH mark single notification as read
  if (req.method === "PATCH" && parsedUrl.pathname.match(/^\/notifications\/[0-9]+\/read$/)) {
    const parts = parsedUrl.pathname.split("/");
    const id = parts[2];
    
    db.query(
      "UPDATE notifications SET status = 'read' WHERE notification_id = ?",
      [id],
      (err, result) => {
        if (err) {
          console.error("Error marking notification as read:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Failed to update notification" }));
        }
        
        if (result.affectedRows === 0) {
          res.writeHead(404, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Notification not found" }));
        }
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 
          message: "Notification marked as read",
          success: true,
          notification_id: id 
        }));
      }
    );
    return;
  }
  
  // PATCH mark single notification as archived
  if (req.method === "PATCH" && parsedUrl.pathname.match(/^\/notifications\/[0-9]+\/archive$/)) {
    const parts = parsedUrl.pathname.split("/");
    const id = parts[2];
    
    db.query(
      "UPDATE notifications SET status = 'archived' WHERE notification_id = ?",
      [id],
      (err, result) => {
        if (err) {
          console.error("Error archiving notification:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Failed to archive notification" }));
        }
        
        if (result.affectedRows === 0) {
          res.writeHead(404, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Notification not found" }));
        }
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 
          message: "Notification archived",
          success: true,
          notification_id: id 
        }));
      }
    );
    return;
  }
  
  // PATCH mark all notifications as read
  if (req.method === "PATCH" && parsedUrl.pathname === "/notifications/read-all") {
    console.log("📬 /notifications/read-all triggered");
  
    db.query(
      "UPDATE notifications SET status = 'read' WHERE status = 'unread'",
      (err, result) => {
        if (err) {
          console.error(" Error marking all as read:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Failed to mark all as read" }));
        }
  
        console.log(" Updated rows:", result.affectedRows);
  
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 
          message: "All notifications marked as read",
          success: true,
          affectedRows: result.affectedRows
        }));
      }
    );
    return;
  }
  
  
  // PATCH archive all notifications
  if (req.method === "PATCH" && parsedUrl.pathname === "/notifications/archive-all") {
    db.query(
      "UPDATE notifications SET status = 'archived' WHERE status != 'archived'",
      (err, result) => {
        if (err) {
          console.error("Error archiving all notifications:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Failed to archive all notifications" }));
        }
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 
          message: "All notifications archived",
          success: true,
          affectedRows: result.affectedRows
        }));
      }
    );
    return;
  }
  
  // DELETE a notification permanently
  if (req.method === "DELETE" && parsedUrl.pathname.match(/^\/notifications\/[0-9]+$/)) {
    const parts = parsedUrl.pathname.split("/");
    const id = parts[2];
    
    db.query(
      "DELETE FROM notifications WHERE notification_id = ?",
      [id],
      (err, result) => {
        if (err) {
          console.error("Error deleting notification:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Failed to delete notification" }));
        }
        
        if (result.affectedRows === 0) {
          res.writeHead(404, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Notification not found" }));
        }
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 
          message: "Notification deleted successfully",
          success: true,
          notification_id: id
        }));
      }
    );
    return;
  }
  
  // If no routes match
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Endpoint not found" }));
};

module.exports = notificationsRoutes;