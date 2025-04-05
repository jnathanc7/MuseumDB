import { useState, useEffect } from "react";
import "../../styles/exhibitionsreport.css"; // Reuse or extend this file for common admin styles
 
const ExhibitionReport = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [newExhibition, setNewExhibition] = useState({
    Name: "",
    Start_Date: "",
    End_Date: "",
    Budget: "",
    Location: "",
    Num_Tickets_Sold: "",
    Themes: "",
    Num_Of_Artworks: ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try { // https://museumdb.onrender.com/exhibition-report
      const response = await fetch("https://museumdb.onrender.com/exhibition-report");
        //  const response = await fetch("http://localhost:5000/exhibition-report");
      if (!response.ok) {
        throw new Error("Failed to fetch exhibitions");
      }
      const data = await response.json();
      console.log("Fetched Exhibitions Data:", data);
      if (Array.isArray(data)) {
        setExhibitions(data);
      } else {
        console.error("Data is not an array:", data);
        setExhibitions([]); // Fallback to empty array to avoid errors
      }
    } catch (error) {
      console.error("Error fetching exhibitions:", error);
    }
  };
  

  const handleInputChange = (e) => {
    setNewExhibition({ ...newExhibition, [e.target.name]: e.target.value });
  };

  const addExhibition = async () => {
    // Basic validation for required fields
    if (
      !newExhibition.Name ||
      !newExhibition.Start_Date ||
      !newExhibition.End_Date ||
      !newExhibition.Budget ||
      !newExhibition.Location
    ) {
      alert("Please fill out all required fields (Name, Start Date, End Date, Budget, Location).");
      return;
    }

    try { // https://museumdb.onrender.com/exhibition-report
      const response = await fetch("https://museumdb.onrender.com/exhibition-report", {
      //  const response = awaitfetch("http://localhost:5000/exhibition-report", {
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
        // Reset the form
        setNewExhibition({
          Name: "",
          Start_Date: "",
          End_Date: "",
          Budget: "",
          Location: "",
          Num_Tickets_Sold: "",
          Themes: "",
          Num_Of_Artworks: ""
        });
        setIsModalOpen(false);
      } else {
        alert("Error adding exhibition.");
      }
    } catch (error) {
      console.error("Failed to add exhibition:", error);
    }
  };

  return (
    <main className="manage-exhibitions-container">
      <div className="manage-header">
        <h1 className="page-title">Exhibition Report</h1>
        <button className="open-modal-button" onClick={() => setIsModalOpen(true)}>
          Add Exhibition
        </button>
      </div>

      {/* Exhibitions Table */}
      <div className="table-container">
        <table className="data-table">
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
      </div>

      {/* Modal for Adding New Exhibition */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Exhibition</h2>
            <input
              type="text"
              name="Name"
              placeholder="Exhibition Name"
              value={newExhibition.Name}
              onChange={handleInputChange}
              className="input-field"
            />
            <input
              type="date"
              name="Start_Date"
              placeholder="Start Date"
              value={newExhibition.Start_Date}
              onChange={handleInputChange}
              className="input-field"
            />
            <input
              type="date"
              name="End_Date"
              placeholder="End Date"
              value={newExhibition.End_Date}
              onChange={handleInputChange}
              className="input-field"
            />
            <input
              type="number"
              step="0.01"
              name="Budget"
              placeholder="Budget"
              value={newExhibition.Budget}
              onChange={handleInputChange}
              className="input-field"
            />
            <input
              type="text"
              name="Location"
              placeholder="Location"
              value={newExhibition.Location}
              onChange={handleInputChange}
              className="input-field"
            />
            <input
              type="number"
              name="Num_Tickets_Sold"
              placeholder="Tickets Sold"
              value={newExhibition.Num_Tickets_Sold}
              onChange={handleInputChange}
              className="input-field"
            />
            <input
              type="text"
              name="Themes"
              placeholder="Themes (comma separated)"
              value={newExhibition.Themes}
              onChange={handleInputChange}
              className="input-field"
            />
            <input
              type="number"
              name="Num_Of_Artworks"
              placeholder="Number of Artworks"
              value={newExhibition.Num_Of_Artworks}
              onChange={handleInputChange}
              className="input-field"
            />
            <div className="modal-buttons">
              <button className="add-button" onClick={addExhibition}>
                Add Exhibition
              </button>
              <button className="close-modal-button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ExhibitionReport;
