import { useState, useEffect } from "react";
import "../../styles/complaints.css"; // Ensure the styles are in place

const ViewComplaints = () => {
    const [complaints, setComplaints] = useState([]);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await fetch("http://localhost:5000/complaints"); // Adjust endpoint
            const data = await response.json();
            console.log("Fetched Complaints:", data);
            setComplaints(data);
        } catch (error) {
            console.error("Error fetching complaints:", error);
        }
    };

    return (
        <main className="view-complaints-container">
            <div className="complaints-header">
                <h1 className="page-title">View Complaints</h1>
            </div>

            {/* Complaints Table */}
            <div className="complaints-table-container">
                <table className="complaints-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Resolution Date</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {complaints.map(complaint => (
                            <tr key={complaint.Complaint_ID}>
                                <td>{complaint.Complaint_ID}</td>
                                <td>{complaint.Customer_ID}</td>
                                <td>{new Date(complaint.Complaint_Date).toLocaleDateString()}</td>
                                <td>{complaint.Complaint_Type}</td>
                                <td>{complaint.Description}</td>
                                <td>{complaint.Status}</td>
                                <td>{complaint.Resolution_Date ? new Date(complaint.Resolution_Date).toLocaleDateString() : "N/A"}</td>
                                <td>{complaint.Resolution_Notes || "N/A"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
};

export default ViewComplaints;
