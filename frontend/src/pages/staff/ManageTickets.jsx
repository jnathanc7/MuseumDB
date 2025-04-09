import { useState, useEffect } from "react";
import "../../styles/manage.css";

const ManageTickets = () => {
  // State for tickets and exhibitions (exhibitions are only used for displaying a title if linked)
  const [tickets, setTickets] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  // Modal state for adding a new ticket
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Ticket form state - now only requires Ticket_Type and Price
  const [newTicket, setNewTicket] = useState({
    Ticket_Type: "",
    Price: "",
  });

  // Fetch tickets and exhibitions on mount
  useEffect(() => {
    fetchTickets();
    fetchExhibitions();
  }, []);

  // Fetch tickets from the backend
  const fetchTickets = async () => {
    try {
      const response = await fetch("https://museumdb.onrender.com/tickets");
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        console.error("Tickets data is not an array:", data);
        setTickets([]);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  // Fetch exhibitions from the backend
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
        console.error("Exhibitions data is not an array:", data);
        setExhibitions([]);
      }
    } catch (error) {
      console.error("Error fetching exhibitions:", error);
    }
  };

  // Generic input change handler
  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  // Submit the add ticket form.
  // This sends a POST request to /tickets with only the Ticket_Type and Price fields.
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const ticketData = {
        Ticket_Type: newTicket.Ticket_Type,
        Price: newTicket.Price,
      };
      const response = await fetch("https://museumdb.onrender.com/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketData),
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || "Ticket added successfully!");
        fetchTickets();
        // Reset the form state
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

  // Helper function to return the exhibition title for a given ticket.
  // Since regular tickets are not linked to any exhibition, we return "Regular".
  // If a ticket has an Exhibition_ID and the corresponding exhibition is found, we return its title.
  const getExhibitionTitle = (ticket) => {
    if (!ticket.Exhibition_ID) return "Regular";
    const exhibition = exhibitions.find(
      (ex) => ex.Exhibition_ID === ticket.Exhibition_ID
    );
    return exhibition ? exhibition.Name : "Regular";
  };

  return (
    <div className="manage-wrapper">
      <div className="manage-header">
        <h1>Manage Tickets</h1>
        <button className="add-btn" onClick={() => setIsAddModalOpen(true)}>
          Add Ticket
        </button>
      </div>

      <table className="manage-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ticket Type</th>
            <th>Price ($)</th>
            <th>Exhibition</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.Ticket_ID}>
              <td>{ticket.Ticket_ID}</td>
              <td>{ticket.Ticket_Type}</td>
              <td>${parseFloat(ticket.Price).toFixed(2)}</td>
              <td>{getExhibitionTitle(ticket)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Adding a New Ticket */}
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
            onClick={(e) => e.stopPropagation()}
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

