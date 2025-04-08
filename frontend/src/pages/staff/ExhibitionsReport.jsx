import { useState, useEffect } from "react";
import "../../styles/reports.css"; // New custom CSS file for report styles

const ExhibitionReport = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [exhibitionPurchases, setExhibitionPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newExhibition, setNewExhibition] = useState({
    Name: "",
    Tickets_Bought: "",
    Amount_Made: "",
    Num_Complaints: "",
    IsActive: true
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchExhibitions();
    fetchExhibitionPurchases();
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
        console.error("Exhibitions data is not an array:", data);
        setExhibitions([]);
      }
    } catch (error) {
      console.error("Error fetching exhibitions:", error);
    }
  };

  const fetchExhibitionPurchases = async () => {
    try {
      const response = await fetch("https://museumdb.onrender.com/exhibition-purchases");
      if (!response.ok) {
        throw new Error("Failed to fetch exhibition purchase data");
      }
      const data = await response.json();
      console.log("Fetched Aggregated Exhibition Purchases Data:", data);
      setExhibitionPurchases(data);
    } catch (error) {
      console.error("Error fetching exhibition purchases:", error);
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
        // After adding, refetch exhibitions and aggregated purchase data
        fetchExhibitions();
        fetchExhibitionPurchases();
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

  // Helper: Get aggregated purchase data for an exhibition.
  // For exhibitions that require a ticket, look for matching Exhibition_ID.
  // For regular (non-ticket-required) exhibitions, use the aggregation where Exhibition_ID is null.
  const getAggregatedDataForExhibition = (exhibition) => {
    if (exhibition.requires_ticket) {
      const agg = exhibitionPurchases.find(
        (item) => Number(item.Exhibition_ID) === Number(exhibition.Exhibition_ID)
      );
      if (!agg) {
        console.log(
          `For exhibition ${exhibition.Exhibition_ID} (requires ticket), no aggregated record found—using default.`
        );
        return { Tickets_Bought: 0, Amount_Made: 0 };
      }
      console.log(
        `For exhibition ${exhibition.Exhibition_ID} (requires ticket), aggregated data:`,
        agg
      );
      return agg;
    } else {
      // For regular exhibitions, we expect a single row where Exhibition_ID is null.
      const agg = exhibitionPurchases.find((item) => item.Exhibition_ID === null);
      if (!agg) {
        console.log(
          `For exhibition ${exhibition.Exhibition_ID} (regular), no aggregated record found—using default.`
        );
        return { Tickets_Bought: 0, Amount_Made: 0 };
      }
      console.log(
        `For exhibition ${exhibition.Exhibition_ID} (regular), aggregated data:`,
        agg
      );
      return agg;
    }
  };
  

  // Total summary is computed by summing aggregated data for each exhibition in the filtered list.
  const totalTicketsBought = filteredExhibitions.reduce((acc, exhibition) => {
    const agg = getAggregatedDataForExhibition(exhibition);
    return acc + Number(agg.Tickets_Bought || 0);
  }, 0);

  const totalAmountMade = filteredExhibitions.reduce((acc, exhibition) => {
    const agg = getAggregatedDataForExhibition(exhibition);
    return acc + Number(agg.Amount_Made || exhibition.Amount_Made || 0);
  }, 0);

  const totalComplaints = filteredExhibitions.reduce(
    (acc, exhibition) => acc + Number(exhibition.Num_Complaints || 0),
    0
  );

  console.log("Total tickets bought (summary):", totalTicketsBought);

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

      {/* Total Summary Section */}
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
            {filteredExhibitions.map((exhibition) => {
              const agg = getAggregatedDataForExhibition(exhibition);
              return (
                <tr key={exhibition.Exhibition_ID}>
                  <td>{exhibition.Exhibition_ID}</td>
                  <td>{exhibition.Name}</td>
                  <td>{agg.Tickets_Bought}</td>
                  <td>${parseFloat(agg.Amount_Made || exhibition.Amount_Made).toLocaleString()}</td>
                  <td>{exhibition.Num_Complaints || 0}</td>
                  <td>
                    {exhibition.IsActive ? (
                      <span className="badge-active">Active</span>
                    ) : (
                      <span className="badge-inactive">Inactive</span>
                    )}
                  </td>
                </tr>
              );
            })}
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


