import React, { useEffect, useState } from "react";
import "../../styles/adminnotification.css";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("all"); // all, unread, read, archived
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, [viewMode]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      // Modify the endpoint based on view mode
      const endpoint = viewMode === "archived" 
        ? "http://localhost:5000/notifications/archived"
        : `http://localhost:5000/notifications?status=${viewMode}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/notifications/${id}/read`, {
        method: "PATCH",
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Update local state
      setNotifications(notifications.map(note => 
        note.id === id ? { ...note, read: true } : note
      ));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("http://localhost:5000/notifications/read-all", {
        method: "PATCH",
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Update local state
      setNotifications(notifications.map(note => ({ ...note, read: true })));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const archiveNotification = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/notifications/${id}/archive`, {
        method: "PATCH",
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Remove from current list if not in archived view
      if (viewMode !== "archived") {
        setNotifications(notifications.filter(note => note.id !== id));
      } else {
        // Mark as archived in current list
        setNotifications(notifications.map(note => 
          note.id === id ? { ...note, archived: true } : note
        ));
      }
    } catch (err) {
      console.error("Error archiving notification:", err);
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to archive all notifications?")) {
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/notifications/archive-all", {
        method: "PATCH",
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Clear the current list if not in archived view
      if (viewMode !== "archived") {
        setNotifications([]);
      } else {
        // Mark all as archived
        setNotifications(notifications.map(note => ({ ...note, archived: true })));
      }
    } catch (err) {
      console.error("Error archiving all notifications:", err);
    }
  };

  const deleteNotification = async (id, event) => {
    // Stop propagation to prevent triggering the parent onClick
    event.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/notifications/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Remove from current list
      setNotifications(notifications.filter(note => note.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
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

  const filteredNotifications = notifications.filter(note => 
    note.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="notifications-loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notifications-error">{error}</div>;
  }

  return (
    <div className="notifications-page">
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
              disabled={!notifications.some(note => !note.read)}
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
                key={note.id} 
                className={`notification-item ${note.read ? 'read' : 'unread'} ${note.archived ? 'archived' : ''}`}
                onClick={() => !note.read && markAsRead(note.id)}
              >
                <div className="notification-content">
                  <div className="notification-message">{note.message}</div>
                  <div className="notification-meta">
                    {note.timestamp && (
                      <span className="notification-time">{getTimeAgo(note.timestamp)}</span>
                    )}
                    {!note.read && <span className="notification-badge">New</span>}
                    {note.archived && <span className="notification-archive-badge">Archived</span>}
                  </div>
                </div>
                {note.type && (
                  <div className={`notification-type ${note.type}`}>
                    {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                  </div>
                )}
                <div className="notification-actions">
                  {!note.archived && (
                    <button 
                      className="notification-action archive"
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveNotification(note.id);
                      }}
                    >
                      Archive
                    </button>
                  )}
                  <button 
                    className="notification-action delete"
                    onClick={(e) => deleteNotification(note.id, e)}
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