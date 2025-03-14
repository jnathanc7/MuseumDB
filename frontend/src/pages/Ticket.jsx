import { useState } from "react";
import "../styles/ticket.css";

const Tickets = () => {
  const ticketTypes = [
    { type: "Adult", price: 20 },
    { type: "Youth", price: 10 },
    { type: "Child", price: 5 },
    { type: "Veteran", price: 15 },
    { type: "Disabled", price: 12 },
    { type: "Student", price: 14 },
    { type: "Senior", price: 16 },
  ];

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

  return (
    <div className="ticket-container">
      <h1 className="ticket-title">Select Your Tickets</h1>
      <div className="ticket-list">
        {ticketTypes.map(({ type, price }) => (
          <div key={type} className="ticket-item">
            <span className="ticket-type">{type}</span>
            <span className="ticket-price">${price}</span>
            <div className="ticket-counter">
              <button onClick={() => handleDecrement(type)}>-</button>
              <span>{ticketCounts[type]}</span>
              <button onClick={() => handleIncrement(type)}>+</button>
            </div>
          </div>
        ))}
      </div>
      <footer className="footer">
          <p> © 2025 Houston Museum of Fine Arts. All Rights Reserved.</p>
      </footer>
    </div>
   
  );
};

export default Tickets;

  