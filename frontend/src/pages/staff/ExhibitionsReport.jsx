import { useState, useEffect } from "react";
import "../../styles/reports.css"; // Custom CSS file for report styles

const ExhibitionReport = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [exhibitionPurchases, setExhibitionPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter exhibitions based on search query
  const filteredExhibitions = exhibitions.filter((exhibition) =>
    exhibition.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper: Get aggregated purchase data for an exhibition.
  // Look for the row with matching Exhibition_ID. If none exists, default to 0.
  const getAggregatedDataForExhibition = (exhibition) => {
    const agg = exhibitionPurchases.find(
      (item) => Number(item.Exhibition_ID) === Number(exhibition.Exhibition_ID)
    );
    if (!agg) {
      console.log(
        `For exhibition ${exhibition.Exhibition_ID}, no aggregated record found—using default.`
      );
      return { Tickets_Bought: 0, Amount_Made: 0 };
    }
    console.log(
      `For exhibition ${exhibition.Exhibition_ID}, aggregated data:`,
      agg
    );
    return agg;
  };

  const totalTicketsBought = filteredExhibitions.reduce((acc, exhibition) => {
    const agg = getAggregatedDataForExhibition(exhibition);
    return acc + Number(agg.Tickets_Bought || 0);
  }, 0);

  const totalAmountMade = filteredExhibitions.reduce((acc, exhibition) => {
    const agg = getAggregatedDataForExhibition(exhibition);
    return acc + Number(agg.Amount_Made || 0);
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
                  <td>${parseFloat(agg.Amount_Made).toLocaleString()}</td>
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
    </main>
  );
};

export default ExhibitionReport;



