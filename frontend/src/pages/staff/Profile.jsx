// Profile.jsx
import "../../styles/profile.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [newUser, setNewUser] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);


  const navigate = useNavigate();

  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => {
        setSaveStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  useEffect(() => {
    const fetchProfile = async () => {
      try { // https://museumdb.onrender.com/auth/profile
        const res = await fetch("https://museumdb.onrender.com/auth/profile", { // http://localhost:5000/auth/profile
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Profile fetch failed");

        const data = await res.json();
        console.log("Retrieved profile data:", data);

        const isCustomer = data.role === "customer";
        let birthdateFormatted = "";
        if (data.birthdate) {
          const d = new Date(data.birthdate);
          const y = d.getFullYear();
          const day = String(d.getDate()).padStart(2, "0");
          const mon = String(d.getMonth() + 1).padStart(2, "0");
          birthdateFormatted = `${y}-${day}-${mon}`;
        }

        const unifiedProfile = {
          id: data.customer_id,
          role: data.role,
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          customer_type: data.membership_level || "Regular",
          birthdate: birthdateFormatted || "N/A",
          position: data.job_title || data.role || "Staff",
          hireDate: data.hire_date || "N/A",
          salary: data.salary ? `$${data.salary}` : "N/A",
        };

        setUser(unifiedProfile);
        setNewUser(unifiedProfile);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setSaveStatus("Failed to load profile data.");
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        if (user?.role === "customer" && user?.id) {
          console.log("Fetching purchases for customer_id:", user.id);
          const res = await fetch(`https://museumdb.onrender.com/customer/purchases?id=${user.id}`, {
            credentials: "include",
          });
          const data = await res.json();
          setPurchaseHistory(data);
        }
      } catch (err) {
        console.error("Failed to load purchase history:", err);
      }
    };
  
    fetchPurchases();
  }, [user]);
  

  // Redirect to /auth if profile failed to load (likely logged out)
  useEffect(() => {
    if (user === null && saveStatus === "Failed to load profile data.") {
      console.warn("Redirecting to /auth because profile could not load (likely logged out)");
      navigate("/auth");
    }
  }, [user, saveStatus]); 

  const handleEdit = () => {
    setIsEditing(true);
    setIsChangingPassword(false);
    setSaveStatus(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveStatus(null);
  };

  const handleChangePasswordClick = () => {
    setIsChangingPassword(true);
    setIsEditing(false);
    setSaveStatus(null);
  };

  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSaveStatus(null);
  };

  const handleSave = async () => {
    try { // https://museumdb.onrender.com/auth/update-profile"
      const response = await fetch("https://museumdb.onrender.com/auth/update-profile", { // http://localhost:5000/auth/update-profile
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          phone: newUser.phone,
          address: newUser.address,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setUser(newUser);
      setIsEditing(false);
      setSaveStatus("Profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      setSaveStatus("Failed to update profile.");
    }
  };

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setSaveStatus("New password and confirmation do not match.");
      return;
    }

    try { // https://museumdb.onrender.com/auth/change-password
      const response = await fetch("https://museumdb.onrender.com/auth/change-password", { // http://localhost:5000/auth/change-password
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaveStatus("Password changed successfully!");
    } catch (err) {
      console.error("Error changing password:", err);
      setSaveStatus("Failed to change password.");
    }
  };

  const handleLogout = async () => {
    try {
      console.log("[Profile] Attempting logout request..."); // https://museumdb.onrender.com/auth/logout
      const res = await fetch("https://museumdb.onrender.com/auth/logout", { // http://localhost:5000/auth/logout
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      console.log("[Profile] Logout response:", res.status, data);

      if (!res.ok) throw new Error("Logout failed");
      navigate("/auth");
    } catch (err) {
      console.error("Logout failed:", err);
      setSaveStatus("Logout failed.");
    }
  };

  if (!user) {
    return (
      <main className="profile-container">
        <div className="profile-card">
          <h1 className="profile-title">Loading Profile...</h1>
        </div>
      </main>
    );
  }

  const isCustomer = user.role === "customer";

  const editFormClass = isEditing ? "profile-edit fade-in-strong" : "profile-edit";
  const passwordFormClass = isChangingPassword ? "profile-edit fade-in-strong" : "profile-edit";

  return (
    <main className="profile-container">
       {/* Floating button outside the card */}
       
       {purchaseHistory.length > 0 && (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
      <button
        className="edit-button"
        style={{ backgroundColor: "#2980b9" }}
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? "Hide Purchase History" : "Purchase History"}
      </button>
    </div>
        )}

      
      <div className="profile-card">
        <h1 className="profile-title">Profile</h1>
        {saveStatus && <p className="save-status">{saveStatus}</p>}

        {isChangingPassword ? (
          <div className={passwordFormClass}>
            <label>Current Password:</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <label>Confirm New Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div style={{ marginTop: "1rem" }}>
              <button className="save-button" onClick={handlePasswordSubmit}>
                Confirm
              </button>
              <button className="cancel-button" onClick={handleCancelPassword}>
                Cancel
              </button>
            </div>
          </div>
        ) : isEditing ? (
          <div className={editFormClass}>
            <label>First Name:</label>
            <input
              name="first_name"
              value={newUser.first_name}
              onChange={handleChange}
            />

            <label>Last Name:</label>
            <input
              name="last_name"
              value={newUser.last_name}
              onChange={handleChange}
            />

            <label>Phone:</label>
            <input
              name="phone"
              value={newUser.phone}
              onChange={handleChange}
            />

            {isCustomer ? (
              <>
                <label>Email:</label>
                <input
                  name="email"
                  value={newUser.email}
                  onChange={handleChange}
                />
              </>
            ) : (
              <>
                <label>Address:</label>
                <input
                  name="address"
                  value={newUser.address}
                  onChange={handleChange}
                />
                <label>Email:</label>
                <input
                  name="email"
                  value={newUser.email}
                  onChange={handleChange}
                />
              </>
            )}

            <div style={{ marginTop: "1rem" }}>
              <button className="save-button" onClick={handleSave}>
                Confirm
              </button>
              <button className="cancel-button" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-info fade-in-strong">
            {isCustomer ? (
              <>
                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Birthdate:</strong> {user.birthdate}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Customer Type:</strong> {user.customer_type}</p>
               
              </>
            ) 
            : (
              <>
                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Address:</strong> {user.address}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Position:</strong> {user.position}</p>
                <p><strong>Hire Date:</strong> {user.hireDate}</p>
                <p><strong>Salary:</strong> {user.salary}</p>
              </>
            )}

            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button className="edit-button" onClick={handleEdit}>
                Edit Profile
              </button>
              <button className="edit-button" onClick={handleChangePasswordClick}>
                Change Password
              </button>
              <button
                className="edit-button"
                style={{ backgroundColor: "#c0392b" }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
          

        )}
      </div>

      {showHistory && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h2>Purchase History</h2>
      <ul className="history-list">
        {purchaseHistory.map((p, i) => (
          <li key={i} className="history-row">
            <strong>{new Date(p.Date).toLocaleDateString()}</strong> |{" "}
            <strong>Type:</strong> {p.Type} |{" "}
            {p.Type === "ticket" ? (
              <>
                <strong>Ticket:</strong> {p.Ticket_Type} |{" "}
                <strong>Qty:</strong> {p.Quantity} |{" "}
                <strong>Price:</strong> ${p.Price} |{" "}
                <strong>Total:</strong> ${p.Total}


              </>
            ) : p.Type === "giftshop" ? (
              <>
                <strong>Total:</strong> ${p.Amount} |{" "}
                <strong>Payment:</strong> {p.Payment_Method}
              </>
            ) : p.Type === "membership" ? (
              <>
                <strong>Plan:</strong> {p.membership_type} ({p.payment_type}) |{" "}
                <strong>Paid:</strong> ${p.payment_amount} |{" "}
                <strong>Status:</strong> {p.status}
              </>
            ) : null}
          </li>
        ))}
      </ul>
      <button className="close-button" onClick={() => setShowHistory(false)}>Close</button>
    </div>
  </div>
)}



    </main>
  );
};

export default Profile;
