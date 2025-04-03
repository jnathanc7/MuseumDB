import "../styles/memberships.css";
import { useState } from "react";
import { Calendar, Repeat } from "lucide-react";
import CustomSelect from "../components/CustomSelect";

const Memberships = () => {
  // Default payment type is monthly since one-time is removed
  const [paymentType, setPaymentType] = useState("monthly");
  const [selectedTier, setSelectedTier] = useState("");
  const [reason, setReason] = useState("");

  // Membership tiers with different pricing options
  const membershipTiers = [
    {
      monthly: 9,
      annual: 100,
      name: "Supporter",
      perks: [
        "Monthly Museum Newsletter",
        "Recognition on Museum Website",
      ],
      description:
        "A great way to show your love for the museum and stay informed about upcoming events and exhibitions.",
    },
    {
      monthly: 41,
      annual: 400,
      name: "Contributor",
      perks: [
        "10% Discount at the Gift Shop",
        "Exclusive Behind-the-Scenes Content",
      ],
      description:
        "Perfect for those who want to engage more deeply with our exhibits and get a first look at what's new.",
    },
    {
      monthly: 83,
      annual: 900,
      name: "Patron",
      perks: [
        "VIP Invitations to Special Events",
        "20% Discount at the Gift Shop",
      ],
      description:
        "Join an exclusive circle of supporters who enjoy special privileges and deeper connections with the museum.",
    },
    {
      monthly: 250,
      annual: 2900,
      name: "Benefactor",
      perks: [
        "Private Guided Tour for You and a Guest",
        "25% Discount at the Gift Shop",
        "Name Listed on the Donor Wall",
      ],
      description:
        "An incredible opportunity for art and history enthusiasts to receive VIP treatment and exclusive benefits.",
    },
    {
      monthly: 400,
      annual: 4700,
      name: "Founder’s Circle",
      perks: [
        "Exclusive Access to New Acquisitions",
        "35% Discount at the Gift Shop",
      ],
      description:
        "Our most prestigious membership level, offering unparalleled access and lifelong benefits to our most dedicated supporters.",
    },
  ];

  const donationReasons = [
    "Preserving Art & History",
    "Supporting Museum Events",
    "Funding Educational Programs",
    "Honoring a Loved One",
    "General Support",
  ];

  const handleDonate = async (e) => {
    e.preventDefault();

    if (!selectedTier || !reason) {
      alert("Please select a membership tier and a reason for joining.");
      return;
    }

    // Find the selected membership details and determine the payment amount
    const membership = membershipTiers.find((tier) => tier.name === selectedTier);
    if (!membership) {
      alert("Invalid membership tier selected.");
      return;
    }
    const membershipAmount = paymentType === "monthly" ? membership.monthly : membership.annual;

    // Build payload to send to the backend (customer_id is taken from JWT on the server)
    const membershipData = {
      membership_type: selectedTier,
      payment_type: paymentType,
      payment_amount: membershipAmount,
      reason,
    };

    try {
      const response = await fetch("https://museumdb.onrender.com/membership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensures cookies (JWT) are sent
        body: JSON.stringify(membershipData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Please log in to join a membership.");
        } else {
          const errorData = await response.json();
          alert("Error creating membership: " + (errorData.error || errorData.message));
        }
      } else {
        const data = await response.json();
        alert("Membership successfully created! Membership ID: " + data.membership_id);
        // Clear form fields upon success
        setSelectedTier("");
        setReason("");
      }
    } catch (error) {
      alert("Network error: " + error.message);
    }
  };

  const selectedMembership =
    membershipTiers.find((tier) => tier.name === selectedTier);

  const paymentOptions = [
    {
      value: "monthly",
      label: "Monthly Subscription",
      icon: <Repeat size={20} />,
    },
    {
      value: "annual",
      label: "Annual Subscription",
      icon: <Calendar size={20} />,
    },
  ];

  return (
    <div className="donations-container">
      {/* LEFT SIDE: Membership Information */}
      <div className="membership-info">
        <h2>Membership Tiers</h2>
        <p>Join to receive exclusive perks:</p>
        <ul>
          {membershipTiers.map((tier, index) => (
            <li key={index} className="membership-tier">
              <strong>
                {tier.name} - ${tier.monthly}/mo / ${tier.annual}/yr
              </strong>
              <ul>
                {tier.perks.map((perk, i) => (
                  <li key={i}>{perk}</li>
                ))}
              </ul>
              <div className="tier-line"></div>
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT SIDE: Membership Form */}
      <div className="donation-form">
        <h2>Join Us</h2>
        <form onSubmit={handleDonate}>
          <label>Choose Payment Type:</label>
          <CustomSelect
            value={paymentType}
            onChange={setPaymentType}
            options={paymentOptions}
          />

          <label>Select Membership Tier:</label>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a tier
            </option>
            {membershipTiers.map((tier) => (
              <option key={tier.name} value={tier.name}>
                {tier.name} - $
                {paymentType === "monthly" ? tier.monthly : tier.annual}/{paymentType}
              </option>
            ))}
          </select>

          <label>Reason for Joining:</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a reason
            </option>
            {donationReasons.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>

          {selectedMembership && (
            <div className="membership-details">
              <h3>{selectedMembership.name} Membership</h3>
              <p>{selectedMembership.description}</p>
              <ul>
                {selectedMembership.perks.map((perk, i) => (
                  <li key={i}>{perk}</li>
                ))}
              </ul>
            </div>
          )}

          <button type="submit">Join Now</button>
        </form>
      </div>
    </div>
  );
};

export default Memberships;
