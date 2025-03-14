import { useState } from "react";
import { Calendar, Plus, Minus } from "lucide-react"; // Import Lucide icons
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import styles
import "../styles/ticket.css"; // Keep your existing styling

const Tickets = () => {
  const ticketTypes = [
    { type: "Adult Admission (18+)", price: 25 },
    { type: "Senior Admission (65+)", price: 20 },
    { type: "Youth Admission (13-17)", price: 15 },
    { type: "Child Admission (12 & Under)", price: 0 },
    { type: "Student Admission (with valid ID)", price: 10 },
    { type: "Veteran Admission (with valid ID)", price: 0 },
  ];

  const [selectedDate, setSelectedDate] = useState(null); // State for date
  const [ticketCounts, setTicketCounts] = useState(
    ticketTypes.reduce((acc, ticket) => ({ ...acc, [ticket.type]: 0 }), {})
  );

  const handleIncrement = (type) => {
    setTicketCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const handleDecrement = (type) => {
    setTicketCounts((prev) => ({
      ...prev,
      [type]: prev[type] > 0 ? prev[type] - 1 : 0,
    }));
  };

  const subtotal = ticketTypes.reduce(
    (total, { type, price }) => total + ticketCounts[type] * price,
    0
  );

  return (
    <div className="ticket-page">
      {/* Left Section: Ticket Selection */}
      <div className="ticket-left">
        <h1>Purchase</h1>
        <p>Please select an available date for your visit and the number of tickets.</p>

        {/* Date Picker Section */}
        <div className="calendar-box">
          <Calendar className="calendar-icon" />
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="MMMM d, yyyy"
            placeholderText="Select a date"
            className="date-picker-input"
            onKeyDown={(e) => e.preventDefault()} // Prevent manual input
          />
        </div>

        {/* Ticket Options */}
        <div className="ticket-options">
          {ticketTypes.map(({ type, price }) => (
            <div key={type} className="ticket-row">
              <span className="ticket-type">{type}</span>
              <span className="ticket-price">${price.toFixed(2)}</span>
              <div className="ticket-counter">
                <div
                  className="icon-button"
                  role="button"
                  tabIndex="0"
                  onClick={() => handleDecrement(type)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleDecrement(type); }}
                >
                  <Minus className="icon" />
                </div>
                <span>{ticketCounts[type]}</span>
                <div
                  className="icon-button"
                  role="button"
                  tabIndex="0"
                  onClick={() => handleIncrement(type)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleIncrement(type); }}
                >
                  <Plus className="icon" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <hr className="divider" />

        {/* Subtotal Section */}
        <div className="subtotal">
          <strong>Subtotal:</strong>
          <span className="subtotal-amount">${subtotal.toFixed(2)}</span>
        </div>

        {/* Next Button */}
        <div
          className="next-button"
          role="button"
          tabIndex="0"
          onClick={() => console.log("Proceeding to the next step")}
          onKeyPress={(e) => { if (e.key === 'Enter') console.log("Proceeding to the next step"); }}
        >
          Next
        </div>
      </div>

      {/* Right Section: Membership Info */}
      <div className="ticket-right">
        <h2>Become a Member</h2>
        <p>
          Members receive free admission, exclusive access to exhibitions, and more. 
          Consider joining today!
        </p>
        <Link to="/memberships" className="membership-link">Learn More</Link>
      </div>
    </div>
  );
};

export default Tickets;




  