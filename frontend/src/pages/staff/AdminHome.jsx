import "../../styles/admin.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; 


const AdminHome = () => {
    const navigate = useNavigate(); 


    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
      const fetchNotifications = async () => {
        try {
          const response = await fetch("https://museumdb.onrender.com/notifications");
          const data = await response.json();
          setNotifications(data);
        } catch (err) {
          console.error("Failed to fetch notifications:", err);
        }
      };
    
      fetchNotifications();
    }, []);
    

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
      <main className="admin-container px-10 py-8">
      {/* Dashboard Title */}
      <h3 className="text-[#313639] text-4xl mb-8 tracking-wide text-center">
        Admin Dashboard
      </h3>

      {/* Two Column Layout */}
      <div className="admin-dashboard flex justify-between gap-10">
        
        {/* Right Column: Reports */}
        <div className="admin-reports flex flex-col gap-4">
          <h4 className="text-2xl font-semibold text-[#1e1e1e]">Reports</h4>
          <button onClick={() => navigate('/admin/total-report')} className="admin-button">
            Total Sales Report
          </button>
          <button onClick={() => navigate('/admin/exhibition-report')} className="admin-button">
            Exhibit Report
          </button>
          <button onClick={() => navigate('/admin/view-complaints')} className="admin-button">
            Complaint Reports
          </button>
        </div>

        {/* Left Column: Manage */}
        <div className="admin-management flex flex-col gap-4">
          <h4 className="text-2xl font-semibold text-[#1e1e1e]">Manage</h4>
          <button onClick={() => navigate('/admin/manage-employees')} className="admin-button">
            Manage Employees
          </button>
          <button onClick={() => navigate('/admin/manage-artworks')} className="admin-button">
            Manage Artworks
          </button>
          <button onClick={() => navigate('/admin/manage-exhibits')} className="admin-button">
            Manage Exhibits
          </button>
          <button onClick={() => navigate('/admin/manage-giftshop')} className="admin-button">
            Manage Gift Shop
          </button>
          <button onClick={() => navigate('/admin/manage-tickets')} className="admin-button">
            Manage Tickets
          </button>
        </div>

      </div>

      {/* Profile Button Centered at Bottom */}
      <div className="mt-10 text-center">
        <button
          onClick={() => navigate('/profile')}
          className="admin-button bg-[#1e1e1e] hover:bg-black"
        >
          Go to Profile
        </button>
      </div>
    </main>
    
    
    );
};

export default AdminHome;
