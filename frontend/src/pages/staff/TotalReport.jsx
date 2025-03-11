import Footer from "../../components/Footer";
import "../../styles/totalreport.css";
import { useState, useEffect } from "react";

const TotalReport = () => {
    // Dummy Sales Data 
    const [salesData, setSalesData] = useState({
        customer: "N/A",
        purchasedItem: "N/A",
        totalEarned: 0,
        totalQuantity: 0,
        totalTransactions: 0,
        date: "mmmm-dd-yyyy",
    });


    return (
        <main className="total-report-container">
            <h1 className="report-title">Sales Report</h1>

            {/* Filters (Dropdowns & Search Bars) */}
            <div className="filters">
                <select className="report-dropdown">
                    <option value="total-sales">Total Sales Report</option>
                    <option value="total-ticket-sales">Total Tickets Sales </option>
                </select>

                <input type="text" className="report-search" placeholder="Search by Customer Name" />
                <select className="report-dropdown">
                    <option value="all-dates">All Dates</option>
                    <option value="last-month">Last Month</option>
                    <option value="last-year">Last Year</option>
                </select>
            </div>

            {/* Report Table */}
            <table className="report-table">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Item Bought</th>
                        <th>Cost</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Customer: {salesData.customer}</td>
                        <td>Item: {salesData.purchasedItem}</td>
                        <td>Cost : ${salesData.totalEarned.toFixed(2)}</td>
                        <td>Total Quantity: {salesData.totalQuantity}</td>
                        <td>Total Count: {salesData.totalTransactions}</td>
                        <td>Date: {salesData.date}</td>
                    </tr>
                </tbody>
            </table>
        </main>
    );
};

export default TotalReport;
