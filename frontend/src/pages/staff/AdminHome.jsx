import "../../styles/admin.css";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react"; 


const AdminHome = () => {
    const navigate = useNavigate(); 

    // Function to handle dropdown selection
    const handleNavigation = (event) => {
        const selectedValue = event.target.value;
        console.log("Dropdown Selected:", selectedValue); // Debugging output

        if (!selectedValue) {
            console.warn("No option selected!");
            return;  // Stop execution if no value is selected
        }

        navigate(selectedValue);
        event.target.value = "";  // Reset dropdown to allow reselection
    };

    // Verify the user's role before loading the page
    useEffect(() => { 
        console.log("[AdminHome] Verifying role via /auth/profile");
        fetch("https://museumdb.onrender.com/auth/profile", { // https://museumdb.onrender.com/auth/profile
          method: "GET", // http://localhost:5000/auth/profile
          credentials: "include"
        })
          .then((res) => {
            console.log("[AdminHome] Response status:", res.status);
            if (!res.ok) {
              throw new Error(`HTTP error ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            console.log("[AdminHome] User data received:", data);

            // Manager Redirection Functionality
            if ((data.role === "staff" || data.role === "admin") && data.job_title === "Manager") {
              console.log("[AdminHome] Detected Manager — Redirecting to /managerhome");
              navigate("/managerhome");
              return;
            }

            // Curator Redirection Functionality
            if ((data.role === "staff" || data.role === "admin") && data.job_title === "Curator") {
              console.log("[AdminHome] Detected Curator — Redirecting to /curatorhome");
              navigate("/curatorhome");
              return;
            }

            if (data.role === "customer") {
              navigate("/profile");
            } else if (data.role !== "staff" && data.role !== "admin") {
              alert("Access denied. Only staff and admins can access this page.");
              navigate("/");
            }
          })
          .catch((err) => {
            console.log("Error verifying role:", err);
            navigate("/");
          });
      }, []);

    return (
        <main className="admin-container">
          <div className="admin-title-container"></div>
        <div className="admin-dashboard">
            
        <div className="admin-title-container">
            <h3 className="text-[#313639] text-4xl mb-2 tracking-wide">
                Admin Dashboard
            </h3>
        </div>
        
    
            {/* Profile Button */}
            <button onClick={() => navigate('/profile')} className="admin-button">
                Profile
            </button>
    
            {/* View Reports Dropdown */}
            <select name="reports" className="admin-button admin-dropdown" onChange={handleNavigation}>
                <option value="">View Reports...</option>
                <option value="/admin/total-report">View Total Sale Reports</option>
                <option value="/admin/exhibition-report">View Exhibit Reports</option>
                <option value="/admin/view-complaints">View Complaints</option>
            </select>
    
            {/* Management Options Dropdown */}
            <select name="management" className="admin-button admin-dropdown" onChange={handleNavigation}>
                <option value="">Management Options</option>
                <option value="/admin/manage-employees">Manage Employees</option>
                <option value="/admin/manage-artworks">Manage Artworks</option>
                <option value="/admin/manage-exhibits">Manage Exhibits</option>
                <option value="/admin/manage-giftshop">Manage Gift Shop</option>
            </select>
        </div>

    </main>
    
    
    );
};

export default AdminHome;
