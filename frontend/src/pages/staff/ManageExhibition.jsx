import { useState, useEffect } from "react";
import "../../styles/manage.css";

const ManageExhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewExhibition((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
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
        setIsModalOpen(false);
      } else {
        alert("Error adding exhibition.");
      }
    } catch (error) {
      console.error("Failed to add exhibition:", error);
    }
  };

  const handleAddExhibition = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="manage-wrapper">
      <div className="manage-header">
        <h1>Manage Exhibitions</h1>
        <button className="add-btn" onClick={handleAddExhibition}>
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
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Adding Exhibition */}
      {isModalOpen && (
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
              maxHeight: "80vh", // Limit height to 80% of the viewport
              overflowY: "auto"  // Enable vertical scrolling if needed
            }}
          >
            <h2 style={{ color: "#ffcc00" }}>Add New Exhibition</h2>
            <form onSubmit={handleSubmit}>
              <label>Exhibition Name:</label>
              <input
                type="text"
                name="Name"
                placeholder="Exhibition Name"
                value={newExhibition.Name}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Start Date:</label>
              <input
                type="date"
                name="Start_Date"
                value={newExhibition.Start_Date}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>End Date:</label>
              <input
                type="date"
                name="End_Date"
                value={newExhibition.End_Date}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Budget ($):</label>
              <input
                type="number"
                step="0.01"
                name="Budget"
                placeholder="Budget"
                value={newExhibition.Budget}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Location:</label>
              <input
                type="text"
                name="Location"
                placeholder="Location"
                value={newExhibition.Location}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Theme:</label>
              <input
                type="text"
                name="Themes"
                placeholder="Theme"
                value={newExhibition.Themes}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Number of Artworks:</label>
              <input
                type="number"
                name="Num_Of_Artworks"
                placeholder="Number of Artworks"
                value={newExhibition.Num_Of_Artworks}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Description:</label>
              <textarea
                name="description"
                placeholder="Description"
                value={newExhibition.description}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              ></textarea>

              <label>Exhibition Image:</label>
              <input
                type="text"
                name="exhibition_image"
                placeholder="https://example.com/image.jpg"
                value={newExhibition.exhibition_image}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />
              
              <label style={{ display: "block", marginBottom: "10px" }}>
                <span>Ticket Required?</span>
                <input
                  type="checkbox"
                  name="requires_ticket"
                  checked={newExhibition.requires_ticket}
                  onChange={handleInputChange}
                  style={{ marginLeft: "10px" }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <button type="submit" className="add-btn">
                  Add Exhibition
                </button>
                <button type="button" className="add-btn" onClick={() => setIsModalOpen(false)}>
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

