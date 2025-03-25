// Profile.jsx

import "../../styles/profile.css";
import { useState, useEffect } from "react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null); // Initially null until fetched
  const [newUser, setNewUser] = useState(null);

  // On mount, fetch the user's profile from /auth/profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/profile", {
          method: "GET",
          credentials: "include", // include cookies (JWT stored)
        });

        if (!res.ok) {
          throw new Error("Not logged in or profile route missing");
        }

        const data = await res.json();

        // Example expected structure:
        // {
        //   first_name, last_name, phone, address, email, job_title,
        //   hire_date, salary, role, membership_level (if customer)
        // }

        const fullProfile = {
          name: data.first_name + " " + data.last_name,
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          position: data.job_title || data.membership_level || data.role || "User",
          hireDate: data.hire_date || "N/A",
          salary: data.salary ? `$${data.salary}` : "N/A",
        };

        setUser(fullProfile);
        setNewUser(fullProfile);
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // In a real app you'd PUT/PATCH to /auth/update-profile
    setUser(newUser);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // Show loading while profile is being fetched
  if (!user) {
    return (
      <main className="profile-container">
        <div className="profile-card">
          <h1 className="profile-title">Loading Profile...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">Profile</h1>

        {!isEditing ? (
          <div className="profile-info">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Address:</strong> {user.address}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Position:</strong> {user.position}</p>
            <p><strong>Hire Date:</strong> {user.hireDate}</p>
            <p><strong>Salary:</strong> {user.salary}</p>
            <button className="edit-button" onClick={handleEdit}>Edit Profile</button>
          </div>
        ) : (
          <div className="profile-edit">
            <label htmlFor="name"><strong>Name:</strong></label>
            <input
              type="text"
              name="name"
              value={newUser.name}
              onChange={handleChange}
              placeholder="Name"
            />

            <label htmlFor="phone"><strong>Phone:</strong></label>
            <input
              type="phone"
              name="phone"
              value={newUser.phone}
              onChange={handleChange}
              placeholder="Phone"
            />

            <label htmlFor="email"><strong>Email:</strong></label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleChange}
              placeholder="Email"
            />

            <label htmlFor="address"><strong>Address:</strong></label>
            <input
              type="text"
              name="address"
              value={newUser.address}
              onChange={handleChange}
              placeholder="Address"
            />

            <button className="save-button" onClick={handleSave}>Save</button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Profile;
