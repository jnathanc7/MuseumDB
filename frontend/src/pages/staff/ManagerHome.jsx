import "../../styles/admin.css";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

const ManagerHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[DEBUG - ManagerHome] Fetching profile to verify Manager access...");
    fetch("https://museumdb.onrender.com/auth/profile", { // https://museumdb.onrender.com/auth/profile
      method: "GET", // http://localhost:5000/auth/profile
      credentials: "include",
    })
      .then((res) => {
        console.log("[DEBUG - ManagerHome] Response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("[DEBUG - ManagerHome] User data received:", data);
        // If user is not staff or job_title is not "Manager", deny or redirect
        if (!((data.role === "staff" || data.role === "admin") && data.job_title === "Manager")) {
          console.warn("[DEBUG - ManagerHome] Access denied for this user. Redirecting...");
          alert("Access denied. Only Managers can access this page.");
          navigate("/");
        } else {
          console.log("[DEBUG - ManagerHome] Access granted for Manager.");
        }
      })
      .catch((err) => {
        console.error("[DEBUG - ManagerHome] Error verifying role:", err);
        navigate("/");
      });
  }, [navigate]);

  const handleNavigation = (event) => {
    const selectedValue = event.target.value;
    console.log("[DEBUG - ManagerHome] Dropdown Selected:", selectedValue);

    if (!selectedValue) {
      console.log("[DEBUG - ManagerHome] No option selected!");
      return;
    }

    navigate(selectedValue);
    event.target.value = ""; // resets dropdown
  };

  return (
    <main className="admin-container">
      <div className="admin-dashboard">
        <div className="manager-title-container">
          <h3>Manager Dashboard</h3>
        </div>

        {/* Profile Button */}
        <button onClick={() => navigate("/profile")} className="admin-button">
          Profile
        </button>

        {/* Management Options */}
        <select
          name="management"
          className="admin-button admin-dropdown"
          onChange={handleNavigation}
        >
          <option value="">Management Options</option>
          <option value="/admin/manage-employees">Manage Employees</option>
          <option value="/admin/manage-giftshop">Manage Gift Shop</option>
        </select>

        {/* Reports Options */}
        <select
          name="reports"
          className="admin-button admin-dropdown"
          onChange={handleNavigation}
        >
          <option value="">View Reports...</option>
          <option value="/admin/view-complaints">View Complaints</option>
        </select>
      </div>
    </main>
  );
};

export default ManagerHome;
