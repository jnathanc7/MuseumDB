import "../../styles/profile.css";
import Footer from "../../components/Footer";
import { useState } from "react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  // will be replaced with actual user data
  const [user, setUser] = useState({
    name: "John Doe",
    adress: "------- ------- -----",
    phone: "000-000-0000",
    email: "john.doe@example.com",
    position: "Manager",
    hireDate: "0009009 0099 00",
    salary: "$50,000",
  });

  const [newUser, setNewUser] = useState({ ...user });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setUser(newUser);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  return (
    <main className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">Profile</h1>

        {!isEditing ? (
          <div className="profile-info">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
                        
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
            <p>
              <strong>Adress:</strong> {user.adress}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Position:</strong> {user.position}
            </p>
            <p>
              <strong>Hire Date:</strong> {user.hireDate}
            </p>
            <p>
              <strong>Salary:</strong> {user.salary}
            </p>
            <button className="edit-button" onClick={handleEdit}>
              Edit Profile
            </button>
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
             <label htmlFor="Phone"><strong>Name:</strong></label>
            <input
              type="phone"
              name="phone"
              value={newUser.phone}
              onChange={handleChange}
              placeholder="Phone"
            />
             <label htmlFor="name"><strong>Email:</strong></label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleChange}
              placeholder="Email"
            />
             <label htmlFor="name"><strong>Adress:</strong></label>
            <input
              type="text"
              name="adress"
              value={newUser.adress}
              onChange={handleChange}
              placeholder="Adress"
            />
            <button className="save-button" onClick={handleSave}>
              Save
            </button>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default Profile;
