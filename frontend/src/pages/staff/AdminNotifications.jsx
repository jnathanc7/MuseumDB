import { useEffect, useState } from "react";
import "../../styles/adminnotification.css";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("all"); // all, unread, read, archived
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [viewMode]);

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      // Modify the endpoint based on view mode
      let endpoint;
      if (viewMode === "archived") {
        // endpoint = "http://localhost:5000/notifications/archived";
        endpoint = "https://museumdb.onrender.com/notifications/archived";
      } else if (viewMode === "all") {
        // endpoint = "http://localhost:5000/notifications"; // No status param for "all"
        endpoint = "https://museumdb.onrender.com/notifications";
      } else {
        // endpoint = `http://localhost:5000/notifications?status=${viewMode}`;
        endpoint = `https://museumdb.onrender.com/notifications?status=${viewMode}`;
      }
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setStatusMessage("Failed to load notifications. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      setStatusMessage("Marking notification as read...");
      // const response = await fetch(`http://localhost:5000/notifications/${id}/read`, {
        const response = await fetch(`https://museumdb.onrender.com/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      // Update local state only after successful response
      setNotifications(prev => prev.map(note => 
        note.notification_id === id ? { ...note, status: "read" } : note
      ));

      window.dispatchEvent(new Event("refresh-notifications"));
      setStatusMessage("Notification marked as read successfully.");
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setStatusMessage("Failed to mark notification as read. Please try again.");
    }
  };

  const markAllAsRead = async () => {
    try {
      setStatusMessage("Marking all notifications as read...");
      // const response = await fetch("http://localhost:5000/notifications/read-all", {
        const response = await fetch("https://museumdb.onrender.com/notifications/read-all", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      const responseData = await response.json().catch(() => ({}));
      
      // Instead of modifying local state, refresh the data
      await fetchNotifications();
      
      window.dispatchEvent(new Event("refresh-notifications"));
      setStatusMessage("All notifications marked as read successfully.");
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setStatusMessage("Failed to mark all notifications as read. Please try again.");
    }
  };

  const archiveNotification = async (id) => {
    try {
      setStatusMessage("Archiving notification...");
      // const response = await fetch(`http://localhost:5000/notifications/${id}/archive`, {
        const response = await fetch(`https://museumdb.onrender.com/notifications/${id}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
  
      // Refresh data instead of manual state updates
      await fetchNotifications();
  
      window.dispatchEvent(new Event("refresh-notifications"));
      setStatusMessage("Notification archived successfully.");
    } catch (err) {
      console.error("Error archiving notification:", err);
      setStatusMessage("Failed to archive notification. Please try again.");
    }
  };
  
  const clearAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to archive all notifications?")) {
      return;
    }
  
    try {
      setStatusMessage("Archiving all notifications...");
      // const response = await fetch("http://localhost:5000/notifications/archive-all", {
        const response = await fetch("https://museumdb.onrender.com/notifications/archive-all", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
  
      // Refresh data instead of manual state updates
      await fetchNotifications();
  
      window.dispatchEvent(new Event("refresh-notifications"));
      setStatusMessage("All notifications archived successfully.");
    } catch (err) {
      console.error("Error archiving all notifications:", err);
      setStatusMessage("Failed to archive all notifications. Please try again.");
    }
  };
  
  const deleteNotification = async (id, event) => {
    // Stop propagation to prevent triggering the parent onClick
    event.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }
    
    try {
      setStatusMessage("Deleting notification...");
      // const response = await fetch(`http://localhost:5000/notifications/${id}`, {
        const response = await fetch(`https://museumdb.onrender.com/notifications/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      // Remove from current list
      setNotifications(prev => prev.filter(note => note.notification_id !== id));

      window.dispatchEvent(new Event("refresh-notifications"));
      setStatusMessage("Notification deleted successfully.");
    } catch (err) {
      console.error("Error deleting notification:", err);
      setStatusMessage("Failed to delete notification. Please try again.");
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Make sure we can handle different field names from the backend
  const getMessage = (note) => {
    return note.message || note.content || note.text || "";
  };

  const getTimestamp = (note) => {
    return note.timestamp || note.created_at || note.date || new Date().toISOString();
  };

  const filteredNotifications = notifications.filter(note => 
    getMessage(note).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="notifications-loading">Loading notifications...</div>;
  }

  return (
    <div className="notifications-page">
      {statusMessage && (
        <div className={`status-message ${statusMessage.includes("Failed") ? "error" : "success"}`}>
          {statusMessage}
        </div>
      )}
      
      <div className="notifications-container">
        <div className="notifications-header">
          <h2>Notifications</h2>
          {notifications.length > 0 && (
            <span className="notification-count">{notifications.length}</span>
          )}
        </div>
        
        <div className="notifications-controls">
          <div className="notifications-filter">
            <button 
              className={`filter-btn ${viewMode === "all" ? "active" : ""}`}
              onClick={() => setViewMode("all")}
            >
              All
            </button>
            <button 
              className={`filter-btn ${viewMode === "unread" ? "active" : ""}`}
              onClick={() => setViewMode("unread")}
            >
              Unread
            </button>
            <button 
              className={`filter-btn ${viewMode === "read" ? "active" : ""}`}
              onClick={() => setViewMode("read")}
            >
              Read
            </button>
            <button 
              className={`filter-btn ${viewMode === "archived" ? "active" : ""}`}
              onClick={() => setViewMode("archived")}
            >
              Archived
            </button>
          </div>
          
          <div className="notifications-actions">
            <input
              type="text"
              placeholder="Search notifications..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              className="action-btn mark-read"
              onClick={markAllAsRead}
              disabled={!notifications.some(note => note.status === "unread")}
            >
              Mark All Read
            </button>
            <button 
              className="action-btn clear-all"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              Archive All
            </button>
            <button 
              className="action-btn refresh"
              onClick={fetchNotifications}
            >
              Refresh
            </button>
          </div>
        </div>
        
        {filteredNotifications.length === 0 ? (
          <p className="no-notifications">No notifications found.</p>
        ) : (
          <ul className="notifications-list">
            {filteredNotifications.map((note) => (
              <li 
                key={note.notification_id} 
                className={`notification-item ${note.status === "read" ? 'read' : 'unread'} ${note.status === "archived" ? 'archived' : ''}`}
                onClick={() => note.status !== "read" && markAsRead(note.notification_id)}
              >
                <div className="notification-content">
                  <div className="notification-message">{getMessage(note)}</div>
                  <div className="notification-meta">
                    <span className="notification-time">{getTimeAgo(getTimestamp(note))}</span>
                    {note.status === "unread" && <span className="notification-badge">New</span>}
                    {note.status === "archived" && <span className="notification-archive-badge">Archived</span>}
                  </div>
                </div>
                {note.type && (
                  <div className={`notification-type ${note.type}`}>
                    {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                  </div>
                )}
                <div className="notification-actions">
                  {note.status !== "archived" && (
                    <button 
                      className="notification-action archive"
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveNotification(note.notification_id);
                      }}
                    >
                      Archive
                    </button>
                  )}
                  <button 
                    className="notification-action delete"
                    onClick={(e) => deleteNotification(note.notification_id, e)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>  
  );
};

export default AdminNotifications;