import { useState, useEffect } from "react";
import "../../styles/reports.css"; // Custom CSS file for report styles

const ExhibitionReport = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newExhibition, setNewExhibition] = useState({
    Name: "",
    Tickets_Bought: "",
    Amount_Made: "",
    Num_Complaints: "",
    IsActive: true
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [regularTicketsSold, setRegularTicketsSold] = useState(0);

  useEffect(() => {
    fetchExhibitions();
    fetchRegularTicketsSold();
  }, []);

  const fetchExhibitions = async () => {
    try {
      const response = await fetch("https://museumdb.onrender.com/exhibition-report");
      if (!response.ok) {
        throw new Error("Failed to fetch exhibitions");
      }
      const data = await response.json();
      console.log("Fetched Exhibitions Data:", data);
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

  // For regular tickets: fetch tickets not linked to an exhibition that have been purchased.
  const fetchRegularTicketsSold = async () => {
    try {
      const response = await fetch("https://museumdb.onrender.com/tickets");
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data = await response.json();
      // Adjust the filter if needed (for example, check if Purchase_ID is set).
      const count = data.filter(ticket => ticket.Purchase_ID !== null && !ticket.Exhibition_ID).length;
      setRegularTicketsSold(count);
    } catch (error) {
      console.error("Error fetching regular tickets sold:", error);
    }
  };

  const handleInputChange = (e) => {
    setNewExhibition({ ...newExhibition, [e.target.name]: e.target.value });
  };

  const addExhibition = async () => {
    // Validate required fields
    if (
      !newExhibition.Name ||
      !newExhibition.Tickets_Bought ||
      !newExhibition.Amount_Made
    ) {
      alert("Please fill out the required fields: Name, Tickets Bought, and Amount Made.");
      return;
    }

    try {
      const response = await fetch("https://museumdb.onrender.com/exhibition-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExhibition)
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || "Exhibition added successfully!");
        fetchExhibitions();
        setNewExhibition({
          Name: "",
          Tickets_Bought: "",
          Amount_Made: "",
          Num_Complaints: "",
          IsActive: true
        });
        setIsModalOpen(false);
      } else {
        alert("Error adding exhibition.");
      }
    } catch (error) {
      console.error("Failed to add exhibition:", error);
    }
  };

  // Filter exhibitions based on search query
  const filteredExhibitions = exhibitions.filter((exhibition) =>
    exhibition.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute the tickets sold for each exhibition row:
  // - If the exhibition requires a ticket, use its own Tickets_Bought (default to 0 if missing).
  // - Otherwise, display the global regularTicketsSold value.
  const computeTicketsSold = (exhibition) => {
    return exhibition.requires_ticket ? Number(exhibition.Tickets_Bought || 0) : regularTicketsSold;
  };

  // For summary: add up all ticket-required counts plus (if any exhibition is non-ticket-required, add the global count once)
  const totalTicketsBought = filteredExhibitions.filter(ex => ex.requires_ticket)
    .reduce((acc, curr) => acc + Number(curr.Tickets_Bought || 0), 0)
    + (filteredExhibitions.some(ex => !ex.requires_ticket) ? regularTicketsSold : 0);

  const totalAmountMade = filteredExhibitions.reduce(
    (acc, curr) => acc + Number(curr.Amount_Made),
    0
  );
  const totalComplaints = filteredExhibitions.reduce(
    (acc, curr) => acc + Number(curr.Num_Complaints || 0),
    0
  );

  return (
    <main className="exh-report-container">
      <div className="exh-report-header">
        <h1>Exhibition Report</h1>
        <button
          className="exh-btn exh-btn-open"
          onClick={() => setIsModalOpen(true)}
        >
          Add Exhibition
        </button>
      </div>

      {/* Total Summary Section at the Top */}
      <div className="exh-report-summary">
        <div>Total Exhibits: {filteredExhibitions.length}</div>
        <div>Total Tickets Bought: {totalTicketsBought}</div>
        <div>Total Amount Made: ${parseFloat(totalAmountMade).toLocaleString()}</div>
        <div>Total Complaints: {totalComplaints}</div>
      </div>

      {/* Search Filter */}
      <div className="exh-report-search">
        <input
          type="text"
          placeholder="Search exhibitions..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Exhibitions Table */}
      <div className="exh-report-table-container">
        <table className="exh-report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Exhibit Name</th>
              <th>Tickets Bought</th>
              <th>Amount Made ($)</th>
              <th># Of Complaints</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredExhibitions.map((exhibition) => (
              <tr key={exhibition.Exhibition_ID}>
                <td>{exhibition.Exhibition_ID}</td>
                <td>{exhibition.Name}</td>
                <td>{computeTicketsSold(exhibition)}</td>
                <td>${parseFloat(exhibition.Amount_Made).toLocaleString()}</td>
                <td>{exhibition.Num_Complaints || 0}</td>
                <td>
                  {exhibition.IsActive ? (
                    <span className="badge-active">Active</span>
                  ) : (
                    <span className="badge-inactive">Inactive</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding New Exhibition */}
      {isModalOpen && (
        <div className="exh-modal-overlay">
          <div className="exh-modal-content">
            <h2>Add New Exhibition</h2>
            <input
              type="text"
              name="Name"
              placeholder="Exhibition Name"
              value={newExhibition.Name}
              onChange={handleInputChange}
              className="exh-input"
            />
            <input
              type="number"
              name="Tickets_Bought"
              placeholder="Tickets Bought"
              value={newExhibition.Tickets_Bought}
              onChange={handleInputChange}
              className="exh-input"
            />
            <input
              type="number"
              step="0.01"
              name="Amount_Made"
              placeholder="Amount Made"
              value={newExhibition.Amount_Made}
              onChange={handleInputChange}
              className="exh-input"
            />
            <input
              type="number"
              name="Num_Complaints"
              placeholder="# Of Complaints"
              value={newExhibition.Num_Complaints}
              onChange={handleInputChange}
              className="exh-input"
            />
            <select
              name="IsActive"
              value={newExhibition.IsActive}
              onChange={(e) =>
                setNewExhibition({
                  ...newExhibition,
                  IsActive: e.target.value === "true"
                })
              }
              className="exh-input"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <div className="exh-modal-buttons">
              <button className="exh-btn exh-btn-add" onClick={addExhibition}>
                Add Exhibition
              </button>
              <button
                className="exh-btn exh-btn-close"
                onClick={() => setIsModalOpen(false)}
              >
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


