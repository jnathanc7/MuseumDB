import "../../styles/totalreport.css";
import { useState, useEffect } from "react";

const TotalReport = () => {
    // Dummy Sales Data 
    const [reportType, setReportType] = useState("total-tickets-sales");
    const [ticketSales, setTicketSales] = useState([]);

    const [dateRange, setDateRange] = useState("all-dates"); // Default: Show all dates

    const fetchReportData = async () => {
        try {
            let url = `https://museumdb.onrender.com/total-report?dateRange=${dateRange}`;
            if (reportType === "total-ticket-sales") {
                url = `https://museumdb.onrender.com/total-report?type=tickets&dateRange=${dateRange}`;
            } else if (reportType === "total-giftshop-sales") {
                url = `https://museumdb.onrender.com/total-report?type=giftshop&dateRange=${dateRange}`;
            } else if (reportType === "total-donations") {
                url = `https://museumdb.onrender.com/total-report?type=donations&dateRange=${dateRange}`;
            }
    
            console.log("Fetching from:", url);
    
            const response = await fetch(url);
            const data = await response.json();
    
            console.log("Received Data:", data);
    
            setTicketSales(data);
        } catch (error) {
            console.error("Error fetching sales report:", error);
        }
    };
    
    
    

    useEffect(() => {
        fetchReportData();
    }, [reportType, dateRange]);
    
        


    return (
        <main className="total-report-container">
            <h1 className="report-title">Sales Report</h1>

            {/* Filters (Dropdowns & Search Bars) */}
            <div className="filters">
            <select className="report-dropdown" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="total-sales">All Sales</option>
                <option value="total-ticket-sales">Ticket Sales Only</option>
                <option value="total-giftshop-sales">Gift Shop Sales Only</option>
                <option value="total-donations">Donations Only</option>
            </select>


                <input type="text" className="report-search" placeholder="Search by Customer Name" />
                <select className="report-dropdown" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
    <option value="all-dates">All Dates</option>
    <option value="last-week">Last Week</option>
    <option value="last-month">Last Month</option>
    <option value="last-year">Last Year</option>
</select>

            </div>

            {/* Report Table */}
            <table className="report-table">
    <thead>
        <tr>
            <th>Sale ID</th>
            <th>Customer ID</th>
            {reportType === "total-sales" && <th>Type</th>} {/* Only show Sale Type for Total Sales Report */}
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Date</th>
        </tr>
    </thead>
    <tbody>
    {ticketSales.map((sale) => (
        <tr key={sale.Sale_ID || sale.Ticket_ID}>
            <td>{sale.Sale_ID || sale.Ticket_ID}</td>
            <td>{sale.Customer_ID || "N/A"}</td>
            {reportType === "total-sales" && <td>{sale.Sale_Type}</td>}
            <td>${Number(sale.Amount || sale.Price).toFixed(2)}</td>
            <td>{sale.Payment_Method || "N/A"}</td>
            <td>{new Date(sale.Sale_Date || sale.Date_Purchased).toLocaleDateString()}</td>
        </tr>
    ))}
</tbody>

</table>

        </main>
    );
};

export default TotalReport;
