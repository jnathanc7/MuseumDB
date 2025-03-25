// Profile.jsx
import "../../styles/profile.css";
import { useState, useEffect } from "react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [newUser, setNewUser] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  // For password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Auto-hide any success/error message after 5s
  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => {
        setSaveStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Profile fetch failed");

        const data = await res.json();
        console.log("📦 Retrieved profile data:", data);

        const isCustomer = data.role === "customer";
        let birthdateFormatted = "";
        if (data.birthdate) {
          const d = new Date(data.birthdate);
          const y = d.getFullYear();
          const day = String(d.getDate()).padStart(2, "0");
          const mon = String(d.getMonth() + 1).padStart(2, "0");
          birthdateFormatted = `${y}-${day}-${mon}`;
        }

        // Combine fields
        const unifiedProfile = {
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
        console.error("❌ Error fetching profile:", error);
        setSaveStatus("Failed to load profile data.");
      }
    };

    fetchProfile();
  }, []);

  // Toggle edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setIsChangingPassword(false);
    setSaveStatus(null);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveStatus(null);
  };

  // Toggle change password mode
  const handleChangePasswordClick = () => {
    setIsChangingPassword(true);
    setIsEditing(false);
    setSaveStatus(null);
  };

  // Cancel password change
  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSaveStatus(null);
  };

  // Save changes to user profile
  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/update-profile", {
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
      console.error("❌ Error saving profile:", err);
      setSaveStatus("Failed to update profile.");
    }
  };

  // Track input changes for editing
  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // Submit password change
  const handlePasswordSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setSaveStatus("❌ New password and confirmation do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/change-password", {
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

      // Clear fields, exit password mode
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaveStatus("✅ Password changed successfully!");
    } catch (err) {
      console.error("❌ Error changing password:", err);
      setSaveStatus("Failed to change password.");
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

  // Classes for fade-in animation
  const editFormClass = isEditing ? "profile-edit fade-in-strong" : "profile-edit";
  const passwordFormClass = isChangingPassword ? "profile-edit fade-in-strong" : "profile-edit";

  return (
    <main className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">Profile</h1>
        {saveStatus && <p className="save-status">{saveStatus}</p>}

        {/* Change Password View */}
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
          // Edit Profile View
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
          // Default Profile View
          <div className="profile-info fade-in-strong">
            {isCustomer ? (
              <>
                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Birthdate:</strong> {user.birthdate}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Customer Type:</strong> {user.customer_type}</p>
              </>
            ) : (
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

            <div style={{ marginTop: "1rem" }}>
              <button className="edit-button" onClick={handleEdit}>
                Edit Profile
              </button>
              <button
                className="edit-button"
                style={{ marginLeft: "1rem" }}
                onClick={handleChangePasswordClick}
              >
                Change Password
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Profile;
