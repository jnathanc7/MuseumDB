import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";  // Import useLocation hook
import AnimatedLink from "./AnimatedLink";
import { FaShoppingCart } from "react-icons/fa";
import "../styles/header.css";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation(); // Get the current location (path)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if the current page is "Tickets"
  const isTicketsPage = location.pathname === "/tickets";
  const isMembershipPage = location.pathname === "/memberships";
  // checks if the current page is a subpage of giftshop
  const isGiftshopPage = location.pathname.startsWith("/Giftshop") && location.pathname != "/Giftshop";
  const isShoppingCart = location.pathname === "/cart";
  return (
    <header className={`header ${scrolled ? "scrolled" : ""} ${isTicketsPage || isMembershipPage || isGiftshopPage || isShoppingCart ? "tickets-page" : ""}`}>
      <h1 className="logo">
        <AnimatedLink to="/">Museum</AnimatedLink>
      </h1>
      <nav className="nav-links">
        <AnimatedLink to="/giftshop">Gift Shop</AnimatedLink>
        <AnimatedLink to="/tickets">Tickets</AnimatedLink>
        <AnimatedLink to="/exhibitions">Exhibitions</AnimatedLink>
        <AnimatedLink to="/memberships">Memberships</AnimatedLink>
        <AnimatedLink to="/Auth" className="login">Login</AnimatedLink>
        {/* Temporary Admin Link */}
        <AnimatedLink to="/adminhome">Admin</AnimatedLink>
        <AnimatedLink to ="/cart"><FaShoppingCart/></AnimatedLink>
      </nav>
    </header>
  );
};

export default Header;








