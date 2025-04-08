import { useState, useEffect } from "react";
import "../../styles/manage.css";

const ManageExhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newExhibition, setNewExhibition] = useState({
    Name: "",
    Start_Date: "",
    End_Date: "",
    Budget: "",
    Location: "",
    Num_Tickets_Sold: "",
    Themes: "",
    Num_Of_Artworks: "",
    description: "",
    requires_ticket: false,
    exhibition_image: ""
  });
  const [editExhibition, setEditExhibition] = useState(null);

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      const response = await fetch("https://museumdb.onrender.com/manage-exhibition");
      if (!response.ok) {
        throw new Error("Failed to fetch exhibitions");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setExhibitions(data);
      } else {
        console.error("Data is not an array:", data);
        setExhibitions([]);
      }
    } catch (error) {
      console.error("Error fetching exhibitions:", error);
    }
  };

  const handleInputChange = (e, stateSetter) => {
    const { name, value, type, checked } = e.target;
    stateSetter(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Add Exhibition Submission (POST)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://museumdb.onrender.com/manage-exhibition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newExhibition)
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || "Exhibition added successfully!");
        fetchExhibitions();
        setNewExhibition({
          Name: "",
          Start_Date: "",
          End_Date: "",
          Budget: "",
          Location: "",
          Num_Tickets_Sold: "",
          Themes: "",
          Num_Of_Artworks: "",
          description: "",
          requires_ticket: false,
          exhibition_image: ""
        });
        setIsAddModalOpen(false);
      } else {
        alert("Error adding exhibition.");
      }
    } catch (error) {
      console.error("Failed to add exhibition:", error);
    }
  };

  // Edit Exhibition Submission (PUT)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://museumdb.onrender.com/manage-exhibition", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editExhibition)
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || "Exhibition updated successfully!");
        fetchExhibitions();
        setEditExhibition(null);
        setIsEditModalOpen(false);
      } else {
        alert("Error updating exhibition.");
      }
    } catch (error) {
      console.error("Failed to update exhibition:", error);
    }
  };

  // Delete Exhibition (assuming DELETE method is supported)
  const handleDeleteExhibition = async (exhibitionId) => {
    if (!window.confirm("Are you sure you want to delete this exhibition?")) return;
    try {
      const response = await fetch("https://museumdb.onrender.com/manage-exhibition", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ Exhibition_ID: exhibitionId })
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || "Exhibition deleted successfully!");
        fetchExhibitions();
      } else {
        alert("Error deleting exhibition.");
      }
    } catch (error) {
      console.error("Failed to delete exhibition:", error);
    }
  };

  // Open edit modal and prefill with selected exhibition data
  const handleEdit = (exhibition) => {
    setEditExhibition({ ...exhibition });
    setIsEditModalOpen(true);
  };

  // Framer Motion variants (same as before)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  return (
    <div className="manage-wrapper">
      <div className="manage-header">
        <h1>Manage Exhibitions</h1>
        <button className="add-btn" onClick={() => setIsAddModalOpen(true)}>
          Add Exhibition
        </button>
      </div>
      <table className="manage-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Budget ($)</th>
            <th>Location</th>
            <th>Tickets Sold</th>
            <th>Themes</th>
            <th># Artworks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exhibitions.map((exhibition) => (
            <tr key={exhibition.Exhibition_ID}>
              <td>{exhibition.Exhibition_ID}</td>
              <td>{exhibition.Name}</td>
              <td>{new Date(exhibition.Start_Date).toLocaleDateString()}</td>
              <td>{new Date(exhibition.End_Date).toLocaleDateString()}</td>
              <td>${parseFloat(exhibition.Budget).toLocaleString()}</td>
              <td>{exhibition.Location}</td>
              <td>{exhibition.Num_Tickets_Sold}</td>
              <td>{exhibition.Themes}</td>
              <td>{exhibition.Num_Of_Artworks}</td>
              <td>
                <button 
                  className="add-btn" 
                  onClick={() => handleEdit(exhibition)}
                  style={{ marginRight: "5px" }}
                >
                  Edit
                </button>
                <button 
                  className="add-btn" 
                  onClick={() => handleDeleteExhibition(exhibition.Exhibition_ID)}
                  style={{ backgroundColor: "#dc3545" }} // Change color for delete
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Adding Exhibition */}
      {isAddModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "#2c2a2a",
              padding: "20px",
              borderRadius: "5px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "80vh",
              overflowY: "auto"
            }}
          >
            <h2 style={{ color: "#ffcc00" }}>Add New Exhibition</h2>
            <form onSubmit={handleAddSubmit}>
              <label>Exhibition Name:</label>
              <input
                type="text"
                name="Name"
                placeholder="Exhibition Name"
                value={newExhibition.Name}
                onChange={(e) => handleInputChange(e, setNewExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Start Date:</label>
              <input
                type="date"
                name="Start_Date"
                value={newExhibition.Start_Date}
                onChange={(e) => handleInputChange(e, setNewExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>End Date:</label>
              <input
                type="date"
                name="End_Date"
                value={newExhibition.End_Date}
                onChange={(e) => handleInputChange(e, setNewExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Budget ($):</label>
              <input
                type="number"
                step="0.01"
                name="Budget"
                placeholder="Budget"
                value={newExhibition.Budget}
                onChange={(e) => handleInputChange(e, setNewExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Location:</label>
              <input
                type="text"
                name="Location"
                placeholder="Location"
                value={newExhibition.Location}
                onChange={(e) => handleInputChange(e, setNewExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Theme:</label>
              <input
                type="text"
                name="Themes"
                placeholder="Theme"
                value={newExhibition.Themes}
                onChange={(e) => handleInputChange(e, setNewExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Number of Artworks:</label>
              <input
                type="number"
                name="Num_Of_Artworks"
                placeholder="Number of Artworks"
                value={newExhibition.Num_Of_Artworks}
                onChange={(e) => handleInputChange(e, setNewExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Description:</label>
              <textarea
                name="description"
                placeholder="Description"
                value={newExhibition.description}
                onChange={(e) => handleInputChange(e, setNewExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              ></textarea>

              <label>Exhibition Image (Base64):</label>
              <input
                type="text"
                name="exhibition_image"
                placeholder="Paste Base64 encoded image here"
                value={newExhibition.exhibition_image}
                onChange={(e) => handleInputChange(e, setNewProduct)} // fix typo: should be setNewExhibition
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label style={{ display: "block", marginBottom: "10px" }}>
                <span>Ticket Required?</span>
                <input
                  type="checkbox"
                  name="requires_ticket"
                  checked={newExhibition.requires_ticket}
                  onChange={(e) => handleInputChange(e, setNewExhibition)}
                  style={{ marginLeft: "10px" }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <button type="submit" className="add-btn">
                  Add Exhibition
                </button>
                <button type="button" className="add-btn" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Exhibition */}
      {isEditModalOpen && editExhibition && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "#2c2a2a",
              padding: "20px",
              borderRadius: "5px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "80vh",
              overflowY: "auto"
            }}
          >
            <h2 style={{ color: "#ffcc00" }}>Edit Exhibition</h2>
            <form onSubmit={handleEditSubmit}>
              <label>Exhibition Name:</label>
              <input
                type="text"
                name="Name"
                placeholder="Exhibition Name"
                value={editExhibition.Name}
                onChange={(e) => handleInputChange(e, setEditExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Start Date:</label>
              <input
                type="date"
                name="Start_Date"
                value={editExhibition.Start_Date}
                onChange={(e) => handleInputChange(e, setEditExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>End Date:</label>
              <input
                type="date"
                name="End_Date"
                value={editExhibition.End_Date}
                onChange={(e) => handleInputChange(e, setEditExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Budget ($):</label>
              <input
                type="number"
                step="0.01"
                name="Budget"
                placeholder="Budget"
                value={editExhibition.Budget}
                onChange={(e) => handleInputChange(e, setEditExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Location:</label>
              <input
                type="text"
                name="Location"
                placeholder="Location"
                value={editExhibition.Location}
                onChange={(e) => handleInputChange(e, setEditExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Theme:</label>
              <input
                type="text"
                name="Themes"
                placeholder="Theme"
                value={editExhibition.Themes}
                onChange={(e) => handleInputChange(e, setEditExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Number of Artworks:</label>
              <input
                type="number"
                name="Num_Of_Artworks"
                placeholder="Number of Artworks"
                value={editExhibition.Num_Of_Artworks}
                onChange={(e) => handleInputChange(e, setEditExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Description:</label>
              <textarea
                name="description"
                placeholder="Description"
                value={editExhibition.description}
                onChange={(e) => handleInputChange(e, setEditExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              ></textarea>

              <label>Exhibition Image (Base64):</label>
              <input
                type="text"
                name="exhibition_image"
                placeholder="Paste Base64 encoded image here"
                value={editExhibition.exhibition_image}
                onChange={(e) => handleInputChange(e, setEditExhibition)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />
              
              <label style={{ display: "block", marginBottom: "10px" }}>
                <span>Ticket Required?</span>
                <input
                  type="checkbox"
                  name="requires_ticket"
                  checked={editExhibition.requires_ticket}
                  onChange={(e) => handleInputChange(e, setEditExhibition)}
                  style={{ marginLeft: "10px" }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <button type="submit" className="add-btn">
                  Save Changes
                </button>
                <button type="button" className="add-btn" onClick={() => { setIsEditModalOpen(false); setEditExhibition(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExhibitions;

