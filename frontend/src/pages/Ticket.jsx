import { useState, useEffect } from "react";
import { Calendar, Plus, Minus, CreditCard } from "lucide-react"; // Import Lucide icons
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import styles
import "../styles/ticket.css"; // Keep your existing styling

const Tickets = () => {
  const [ticketTypes, setTicketTypes] = useState([]); // Fetch ticket types from backend
  const [selectedDate, setSelectedDate] = useState(null); // State for date
  const [ticketCounts, setTicketCounts] = useState({}); // Tracks ticket selections
  const [paymentMethod, setPaymentMethod] = useState("Credit Card"); // Store payment method
  const [message, setMessage] = useState(""); // Store purchase success/failure message
  const [loading, setLoading] = useState(true); // Loading state

  // 🔹 Fetch ticket prices dynamically from backend
  useEffect(() => {
    fetch("http://localhost:5000/tickets")
      .then((response) => response.json())
      .then((data) => {
        setTicketTypes(data);
        setLoading(false);
        // Initialize ticketCounts with zero for each ticket type
        const initialCounts = data.reduce(
          (acc, ticket) => ({
            ...acc,
            [ticket.Ticket_Type]: 0,
          }),
          {}
        );
        setTicketCounts(initialCounts);
      })
      .catch((error) => {
        console.error("Error fetching tickets:", error);
        setMessage("Error loading tickets.");
        setLoading(false);
      });
  }, []);

  // 🔹 Handle ticket selection (increment)
  const handleIncrement = (type) => {
    setTicketCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  // 🔹 Handle ticket deselection (decrement)
  const handleDecrement = (type) => {
    setTicketCounts((prev) => ({
      ...prev,
      [type]: prev[type] > 0 ? prev[type] - 1 : 0,
    }));
  };

  // 🔹 Calculate subtotal
  const subtotal = ticketTypes.reduce(
    (total, { Ticket_Type, Price }) =>
      total + (ticketCounts[Ticket_Type] || 0) * Price,
    0
  );

  // 🔹 Handle ticket purchase submission
  const handlePurchase = async () => {
    if (!selectedDate) {
      setMessage("Please select a date.");
      return;
    }

    // Create purchase request
    const ticketsToBuy = ticketTypes
      .filter(({ Ticket_Type }) => ticketCounts[Ticket_Type] > 0)
      .map(({ Ticket_ID, Ticket_Type }) => ({
        ticket_ID: Ticket_ID,
        quantity: ticketCounts[Ticket_Type],
      }));

    if (ticketsToBuy.length === 0) {
      setMessage("Please select at least one ticket.");
      return;
    }

    const purchaseData = {
      payment_Method: paymentMethod,
      tickets: ticketsToBuy,
    };

    try {
      const response = await fetch("http://localhost:5000/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unknown error occurred");
      }

      setMessage(data.message || "Purchase successful!");
      setTicketCounts(
        ticketTypes.reduce(
          (acc, ticket) => ({
            ...acc,
            [ticket.Ticket_Type]: 0,
          }),
          {}
        )
      ); // Reset ticket selection
    } catch (error) {
      console.error("Error making purchase:", error);
      setMessage(error.message || "Error processing purchase.");
    }
  };

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
        {loading ? (
          <p>Loading ticket options...</p>
        ) : (
        <div className="ticket-options">
            {ticketTypes.map(({ Ticket_ID, Ticket_Type, Price }) => (
              <div key={Ticket_ID} className="ticket-row">
                <span className="ticket-type">{Ticket_Type}</span>
                <span className="ticket-price">
                  ${(Number(Price) || 0).toFixed(2)}
                </span>

              <div className="ticket-counter">
                <div
                  className="icon-button"
                  role="button"
                  tabIndex="0"
                    onClick={() => handleDecrement(Ticket_Type)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleDecrement(Ticket_Type);
                    }}
                >
                  <Minus className="icon" />
                </div>
                  <span>{ticketCounts[Ticket_Type]}</span>
                <div
                  className="icon-button"
                  role="button"
                  tabIndex="0"
                    onClick={() => handleIncrement(Ticket_Type)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleIncrement(Ticket_Type);
                    }}
                >
                  <Plus className="icon" />
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        <hr className="divider" />

        {/* Subtotal Section */}
        <div className="subtotal">
          <strong>Subtotal:</strong>
          <span className="subtotal-amount">${subtotal.toFixed(2)}</span>
        </div>

        {/* Payment Method Selection */}
        <div className="payment-box">
          <CreditCard className="payment-icon" />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="payment-select"
          >
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        {/* Purchase Button */}
        <div
          className="next-button"
          role="button"
          tabIndex="0"
          onClick={handlePurchase}
          onKeyPress={(e) => {
            if (e.key === "Enter") handlePurchase();
          }}
        >
          Purchase
        </div>

        {/* Show purchase confirmation message */}
        {message && <p className="purchase-message">{message}</p>}
      </div> 

      {/* Right Section: Membership Info */}
      <div className="ticket-right">
        <h1>Become a Member</h1>
        <p>
          Members receive free admission, exclusive access to exhibitions, and more. 
          Consider joining today!
        </p>
        <Link to="/memberships" className="membership-link">
          Learn More
        </Link>
      </div>
    </div>
  );
};

export default Tickets;




  