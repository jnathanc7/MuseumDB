import "../../styles/admin.css";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

const CuratorHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[DEBUG - CuratorHome] Fetching profile to verify Curator access...");
    fetch("https://museumdb.onrender.com/auth/profile", { // https://museumdb.onrender.com/auth/profile
      method: "GET", // http://localhost:5000/auth/profile
      credentials: "include",
    })
      .then((res) => {
        console.log("[DEBUG - CuratorHome] Response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("[DEBUG - CuratorHome] User data received:", data);
        if (!((data.role === "staff" || data.role === "admin") && data.job_title === "Curator")) {
          console.warn("[DEBUG - CuratorHome] Access denied for this user. Redirecting...");
          alert("Access denied. Only Curators can access this page.");
          navigate("/");
        } else {
          console.log("[DEBUG - CuratorHome] Access granted for Curator.");
        }
      })
      .catch((err) => {
        console.error("[DEBUG - CuratorHome] Error verifying role:", err);
        navigate("/");
      });
  }, [navigate]);

  const handleNavigation = (event) => {
    const selectedValue = event.target.value;
    console.log("[DEBUG - CuratorHome] Dropdown Selected:", selectedValue);

    if (!selectedValue) {
      console.warn("[DEBUG - CuratorHome] No option selected!");
      return;
    }

    navigate(selectedValue);
    event.target.value = ""; // Reset dropdown
  };

  return (
    <main className="admin-container">
      <div className="admin-dashboard">
        <div className="curator-title-container">
          <h3>Curator Dashboard</h3>
        </div>

        {/* Profile Button */}
        <button onClick={() => navigate("/profile")} className="admin-button">
          Profile
        </button>

        {/* View Reports Dropdown (Only Exhibit Report) */}
        <select
          name="reports"
          className="admin-button admin-dropdown"
          onChange={handleNavigation}
        >
          <option value="">View Reports...</option>
          <option value="/admin/exhibition-report">View Exhibit Reports</option>
        </select>

        {/* Management Options (Manage Exhibits and Artworks) */}
        <select
          name="management"
          className="admin-button admin-dropdown"
          onChange={handleNavigation}
        >
          <option value="">Management Options</option>
          <option value="/admin/manage-exhibits">Manage Exhibits</option>
          <option value="/admin/manage-artworks">Manage Artworks</option>
        </select>
      </div>
    </main>
  );
};

export default CuratorHome;
