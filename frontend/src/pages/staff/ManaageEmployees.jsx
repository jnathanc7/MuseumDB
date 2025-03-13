import React, { useState, useEffect  } from "react";
import Footer from "../../components/Footer";
import "../../styles/admin.css"; // Make sure your CSS handles modal styles

const ManageEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({
        firstName: "", lastName: "", phoneNumber: "", email:"", department:"" , position: "", hireDate: "", salary: ""
    });
    

    const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch("http://localhost:3000/employees");
            const data = await response.json();
            setEmployees(data); // Update state with actual database employees
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };



    

    // Handle input changes
    const handleInputChange = (e) => {
        setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
    };

    // Add a new employee
    const addEmployee = async () => {
        if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.phoneNumber || !newEmployee.email|| !newEmployee.department ||!newEmployee.position || !newEmployee.hireDate || !newEmployee.salary) {
            alert("Please fill out all fields.");
            return;
        }
        
    
        try {
            const response = await fetch("http://localhost:3000/employees", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newEmployee),
            });
    
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                await fetchEmployees(); // Refresh employee list
                // Add new employee to UI

                setNewEmployee({ firstName: "", lastName:"", phoneNumber:"",  position: "", email: "", hireDate: "", salary: "" }); // Reset form
                setIsModalOpen(false); // Close modal
            } else {
                alert("Error adding employee.");
            }
        } catch (error) {
            console.error("Failed to add employee:", error);
        }
    };
    


    return (
        <main className="manage-employees-container">
        <div className="manage-header"></div>

        <div className="manage-header">
            <h1 className="page-title">Manage Employees</h1>
            <button className="open-modal-button" onClick={() => setIsModalOpen(true)}>Add Employee</button>
        </div>
            {/* Employee Table */}
            <div className="employee-table-container">
                <table className="employee-table">
                    <thead>
                        <tr>
                            <th>Staff ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Phone Number</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Job Title</th>
                            <th>Hire Date</th>
                            <th>Salary ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.Staff_ID}>
                                <td>{emp.Staff_ID}</td>
                                <td>{emp.First_Name}</td>
                                <td>{emp.Last_Name}</td>
                                <td>{emp.Phone_Number}</td>
                                <td>{emp.Email}</td>
                                <td>{emp.Department}</td>
                                <td>{emp.Job_title}</td>
                                <td>{new Date(emp.Hire_Date).toLocaleDateString()}</td>
                                <td>${emp.Salary.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal for Adding Employees */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Employee</h2>
                        <input type="text" name="firstName" placeholder="Employee Name" value={newEmployee.firstName}  onChange={handleInputChange} className="input-field" />

                        <input type="text" name="lastName" placeholder="Last Name" value={newEmployee.lastName} onChange={handleInputChange} className="input-field" />

                        <input type="text" name="phoneNumber" placeholder="Phone Number" value={newEmployee.phoneNumber} onChange={handleInputChange} className="input-field" />

                        <input type="email" name="email" placeholder="Email" value={newEmployee.email} onChange={handleInputChange} className="input-field" />

                        <select name="department" value={newEmployee.department} onChange={handleInputChange} className="input-field">
                            <option value="">Select Department</option>  
                            <option value="Exhibitions">Exhibitions</option>
                            <option value="Events">Events</option>
                            <option value="Security">Security</option>
                            <option value="Administration">Administration</option>
                            <option value="Special Exhibitions">Special Exhibitions</option>
                        </select>


                        <input type="text" name="position" placeholder="Position" value={newEmployee.position} onChange={handleInputChange} className="input-field"  />

                        <input type="date" name="hireDate" value={newEmployee.hireDate} onChange={handleInputChange} className="input-field"  />

                        <input type="number" name="salary" placeholder="Salary" value={newEmployee.salary} onChange={handleInputChange}  className="input-field" />
                        <div className="modal-buttons">
                            <button className="add-employee-button" onClick={addEmployee}>Add Employee</button>
                            <button className="close-modal-button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        
        
            <Footer />
        
        </main>
    

    );
};

export default ManageEmployees;

