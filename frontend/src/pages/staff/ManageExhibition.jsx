import { useState, useEffect } from "react";
import "../../styles/manage.css";

const ManageExhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      // Updated fetch URL to match your backend route for managing exhibitions.
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

  // For now, the "Add Exhibition" button simply logs an action.
  const handleAddExhibition = () => {
    console.log("Add Exhibition clicked");
    // Here you can implement a modal or redirect to an add exhibition page.
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
    </div>
  );
};

export default ManageExhibitions;
