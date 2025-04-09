import { useState, useEffect } from "react";
import "../../styles/reports.css"; // Custom CSS file for report styles

const ExhibitionReport = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [exhibitionPurchases, setExhibitionPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Date filter state variables for manual input and quick filter
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  // Special exhibition filter: "" = all, "special" = requires_ticket true, "regular" = requires_ticket false.
  const [specialFilter, setSpecialFilter] = useState("");

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

  // Helper to format a Date as "YYYY-MM-DD"
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Quick filter functions for date ranges using the entire exhibition date range (Start_Date to End_Date)
  const setLastWeek = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    setFilterStartDate(formatDate(lastWeek));
    setFilterEndDate(formatDate(today));
  };

  const setLastMonth = () => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    setFilterStartDate(formatDate(lastMonth));
    setFilterEndDate(formatDate(today));
  };

  const setLastYear = () => {
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    setFilterStartDate(formatDate(lastYear));
    setFilterEndDate(formatDate(today));
  };

  const clearDateFilter = () => {
    setFilterStartDate("");
    setFilterEndDate("");
  };

  // Handler for the quick date range dropdown change
  const handleQuickFilterChange = (e) => {
    const option = e.target.value;
    if (option === "lastWeek") {
      setLastWeek();
    } else if (option === "lastMonth") {
      setLastMonth();
    } else if (option === "lastYear") {
      setLastYear();
    } else {
      clearDateFilter();
    }
  };

  // Handler for the special exhibition filter dropdown
  const handleSpecialFilterChange = (e) => {
    setSpecialFilter(e.target.value);
  };

  // Filter exhibitions using search and date range. We now check that the exhibition's
  // date range overlaps with the filter range. That is, the exhibition is included if:
  //   - Its End_Date is on/after filterStartDate (if specified) AND
  //   - Its Start_Date is on/before filterEndDate (if specified).
  const filteredExhibitions = exhibitions.filter((exhibition) => {
    const exhibitionNameMatch = exhibition.Name.toLowerCase().includes(searchQuery.toLowerCase());

    const exhibitionStart = new Date(exhibition.Start_Date);
    const exhibitionEnd = new Date(exhibition.End_Date);

    let passesDateFilter = true;
    if (filterStartDate) {
      // The exhibition should end on or after the filter start
      if (exhibitionEnd < new Date(filterStartDate)) {
        passesDateFilter = false;
      }
    }
    if (filterEndDate) {
      // The exhibition should start on or before the filter end
      if (exhibitionStart > new Date(filterEndDate)) {
        passesDateFilter = false;
      }
    }

    let specialMatch = true;
    if (specialFilter === "special") {
      specialMatch = Number(exhibition.requires_ticket) === 1;
    } else if (specialFilter === "regular") {
      specialMatch = Number(exhibition.requires_ticket) === 0;
    }

    return exhibitionNameMatch && passesDateFilter && specialMatch;
  });

  // Helper: Get aggregated purchase data for an exhibition.
  const getAggregatedDataForExhibition = (exhibition) => {
    const agg = exhibitionPurchases.find(
      (item) => Number(item.Exhibition_ID) === Number(exhibition.Exhibition_ID)
    );
    if (!agg) {
      console.log(`For exhibition ${exhibition.Exhibition_ID}, no aggregated record found—using default.`);
      return { Tickets_Bought: 0, Amount_Made: 0 };
    }
    console.log(`For exhibition ${exhibition.Exhibition_ID}, aggregated data:`, agg);
    return agg;
  };

  // For totals, group exhibitions into special and regular.
  const specialExhibitions = filteredExhibitions.filter(
    (ex) => Number(ex.requires_ticket) === 1
  );
  const specialTotalTickets = specialExhibitions.reduce((acc, ex) => {
    const agg = getAggregatedDataForExhibition(ex);
    return acc + Number(agg.Tickets_Bought || 0);
  }, 0);
  const specialTotalAmount = specialExhibitions.reduce((acc, ex) => {
    const agg = getAggregatedDataForExhibition(ex);
    return acc + Number(agg.Amount_Made || 0);
  }, 0);

  // For regular exhibitions, assume all share the same aggregated data (from Exhibition_ID = null).
  const regularExhibitions = filteredExhibitions.filter(
    (ex) => Number(ex.requires_ticket) === 0
  );
  const regularAgg = exhibitionPurchases.find((item) => item.Exhibition_ID === null) || { Tickets_Bought: 0, Amount_Made: 0 };
  // If any regular exhibitions exist, count the regular aggregated value once.
  const regularTotalTickets = regularExhibitions.length > 0 ? Number(regularAgg.Tickets_Bought) : 0;
  const regularTotalAmount = regularExhibitions.length > 0 ? Number(regularAgg.Amount_Made) : 0;

  const totalTicketsBought = specialTotalTickets + regularTotalTickets;
  const totalAmountMade = specialTotalAmount + regularTotalAmount;
  const totalComplaints = filteredExhibitions.reduce((acc, ex) => acc + Number(ex.Num_Complaints || 0), 0);

  console.log("Total tickets bought (summary):", totalTicketsBought);

  return (
    <main className="exh-report-container">
      <div className="exh-report-header">
        <h1>Exhibition Report</h1>
      </div>

      {/* Combined Controls: Quick Date Range Dropdown, Manual Date Inputs, Special Filter, and Search Bar */}
      <div className="exh-report-controls">
        <div className="exh-report-date-controls">
          <div className="exh-report-date-select">
            <label htmlFor="quickDateRange">Quick Date Range:</label>
            <select id="quickDateRange" onChange={handleQuickFilterChange}>
              <option value="">--Select Range--</option>
              <option value="lastWeek">Last Week</option>
              <option value="lastMonth">Last Month</option>
              <option value="lastYear">Last Year</option>
              <option value="clear">Clear</option>
            </select>
          </div>
          <div className="exh-report-manual-dates">
            <div>
              <label htmlFor="startDate">Start Date:</label>
              <input
                id="startDate"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="endDate">End Date:</label>
              <input
                id="endDate"
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="exh-report-special-filter">
            <label htmlFor="specialFilter">Special Exhibition:</label>
            <select id="specialFilter" onChange={handleSpecialFilterChange}>
              <option value="">All</option>
              <option value="special">Special Only</option>
              <option value="regular">Regular Only</option>
            </select>
          </div>
        </div>
        <div className="exh-report-search">
          <input
            type="text"
            placeholder="Search exhibitions..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Total Summary Section */}
      <div className="exh-report-summary">
        <div>Total Exhibits: {filteredExhibitions.length}</div>
        <div>Total Tickets Bought: {totalTicketsBought}</div>
        <div>Total Amount Made: ${parseFloat(totalAmountMade).toLocaleString()}</div>
        <div>Total Complaints: {totalComplaints}</div>
      </div>

      {/* Exhibitions Table */}
      <div className="exh-report-table-container">
        <table className="exh-report-table">
          <thead>
            <tr>
              <th>Exhibit Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Special Exhibition</th>
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
                  <td>{exhibition.Name}</td>
                  <td>{new Date(exhibition.Start_Date).toLocaleDateString()}</td>
                  <td>{new Date(exhibition.End_Date).toLocaleDateString()}</td>
                  <td>{Number(exhibition.requires_ticket) === 1 ? "Yes" : "No"}</td>
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

