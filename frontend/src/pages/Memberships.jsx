import "../styles/memberships.css";
import { useState } from "react";
import { CreditCard, Calendar, Repeat } from "lucide-react"; // Importing icons
import CustomSelect from "../components/CustomSelect";

const Memberships = () => {
  const [paymentType, setPaymentType] = useState("one-time");

  const [amount, setAmount] = useState("");

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

        "5% Discount at the Gift Shop",

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
        "Early Access to New Exhibitions",

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

        "One Free Annual Pass for Unlimited Visits",

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

        "Two Free Annual Passes",

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
        "Four Free Annual Passes",

        "Exclusive Access to New Acquisitions",

        "35% Discount at the Gift Shop",

        "Recognition in Annual Museum Report",
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

  const handleDonate = (e) => {
    e.preventDefault();

    alert(`Thank you for your donation! Payment Type: ${paymentType}.`);

    setAmount("");

    setSelectedTier("");

    setReason("");
  };

  const getMembershipTier = (amount) => {
    return (
      membershipTiers

        .slice()

        .reverse()

        .find((tier) => amount >= tier.amount) || null
    );
  };

  const selectedMembership =
    paymentType === "one-time"
      ? getMembershipTier(Number(amount))
      : membershipTiers.find((tier) => tier.name === selectedTier);

  const paymentOptions = [
    {
      value: "one-time",
      label: "One-Time Donation",
      icon: <CreditCard size={20} />,
    },

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
      {/* LEFT SIDE: MEMBERSHIP INFO */}

      <div className="membership-info">
        <h2>Membership Tiers</h2>

        <p>Donate to receive exclusive perks:</p>

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
              <div className="tier-line"></div> {/* Divider Line */}
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT SIDE: DONATION FORM */}

      <div className="donation-form">
        <h2>Join Us</h2>

        <form onSubmit={handleDonate}>
          <label>Choose Payment Type:</label>

          <CustomSelect
            value={paymentType}
            onChange={setPaymentType}
            options={paymentOptions}
          />

          {paymentType === "one-time" ? (
            <>
              <label>Enter Donation Amount ($):</label>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
              />
            </>
          ) : (
            <>
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
                    {paymentType === "monthly" ? tier.monthly : tier.annual}/
                    {paymentType}
                  </option>
                ))}
              </select>
            </>
          )}

          <label>Reason for Donating:</label>

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

          <button type="submit">Donate Now</button>
        </form>
      </div>
    </div>
  );
};

export default Memberships;
