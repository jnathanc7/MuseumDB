import { useState, useEffect } from "react";
import "../../styles/manage.css";

const ManageTickets = () => {
  // State to hold the tickets list
  const [tickets, setTickets] = useState([]);
  // State to show/hide add ticket modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // State for the new ticket form data
  const [newTicket, setNewTicket] = useState({
    Ticket_Type: "",
    Price: "",
  });

  // Fetch tickets when the component mounts
  useEffect(() => {
    fetchTickets();
  }, []);

  // Function to fetch all tickets from the server
  const fetchTickets = async () => {
    try {
      const response = await fetch("https://museumdb.onrender.com/tickets");
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data = await response.json();
      // Ensure that the response is an array before setting state
      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        console.error("Data is not an array:", data);
        setTickets([]);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  // Generic input change handler for the new ticket form
  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handles submission of the add ticket form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://museumdb.onrender.com/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTicket),
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || "Ticket added successfully!");
        fetchTickets();
        // Reset form state
        setNewTicket({
          Ticket_Type: "",
          Price: "",
        });
        setIsAddModalOpen(false);
      } else {
        alert("Error adding ticket.");
      }
    } catch (error) {
      console.error("Failed to add ticket:", error);
    }
  };

  return (
    <div className="manage-wrapper">
      {/* Header with title and Add Ticket button */}
      <div className="manage-header">
        <h1>Manage Tickets</h1>
        <button className="add-btn" onClick={() => setIsAddModalOpen(true)}>
          Add Ticket
        </button>
      </div>

      {/* Table to display the tickets */}
      <table className="manage-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ticket Type</th>
            <th>Price ($)</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.Ticket_ID}>
              <td>{ticket.Ticket_ID}</td>
              <td>{ticket.Ticket_Type}</td>
              <td>${parseFloat(ticket.Price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Adding a Ticket */}
      {isAddModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsAddModalOpen(false)}
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
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside content
            style={{
              backgroundColor: "#2c2a2a",
              padding: "20px",
              borderRadius: "5px",
              width: "90%",
              maxWidth: "400px",
            }}
          >
            <h2 style={{ color: "#ffcc00" }}>Add New Ticket</h2>
            <form onSubmit={handleAddSubmit}>
              <label>Ticket Type:</label>
              <input
                type="text"
                name="Ticket_Type"
                placeholder="Ticket Type"
                value={newTicket.Ticket_Type}
                onChange={(e) => handleInputChange(e, setNewTicket)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <label>Price ($):</label>
              <input
                type="number"
                step="0.01"
                name="Price"
                placeholder="Price"
                value={newTicket.Price}
                onChange={(e) => handleInputChange(e, setNewTicket)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "20px",
                }}
              >
                <button type="submit" className="add-btn">
                  Add Ticket
                </button>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => setIsAddModalOpen(false)}
                >
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

export default ManageTickets;
