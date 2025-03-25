import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";  // Import useLocation hook
import AnimatedLink from "./AnimatedLink";
import { FaShoppingCart } from "react-icons/fa";
import "../styles/header.css";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation(); // Get the current location (path)

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔁 Check login on every route change
  useEffect(() => {
    const checkLogin = async () => {
      console.log("🔍 Header checking login...");
      try {
        const res = await fetch("http://localhost:5000/auth/profile", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        console.log("📡 /auth/profile response:", res.status, data);

        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("❌ Error checking login status:", error);
        setIsLoggedIn(false);
      }
    };

    checkLogin();
  }, [location.pathname]);

  // 🔍 Log on every render
  console.log("🧠 Header render: isLoggedIn =", isLoggedIn);

  const isTicketsPage = location.pathname === "/tickets";
  const isMembershipPage = location.pathname === "/memberships";
  const isGiftshopPage = location.pathname.startsWith("/Giftshop") && location.pathname !== "/Giftshop";
  const isShoppingCart = location.pathname === "/cart";

  const loginLinkStyle = isLoggedIn ? { display: "none" } : {};
  const profileLinkStyle = isLoggedIn ? {} : { display: "none" };

  return (
    <header
      className={`header ${scrolled ? "scrolled" : ""} ${
        isTicketsPage || isMembershipPage || isGiftshopPage || isShoppingCart ? "tickets-page" : ""
      }`}
    >
      <h1 className="logo">
        <AnimatedLink to="/">Museum</AnimatedLink>
      </h1>
      <nav className="nav-links">
        <AnimatedLink to="/giftshop">Gift Shop</AnimatedLink>
        <AnimatedLink to="/tickets">Tickets</AnimatedLink>
        <AnimatedLink to="/exhibitions">Exhibitions</AnimatedLink>
        <AnimatedLink to="/memberships">Memberships</AnimatedLink>

        {/* Login tab - visible only if not logged in */}
        {!isLoggedIn && (
          <AnimatedLink to="/Auth" className="login">
            Login
          </AnimatedLink>
        )}

        {/* Profile tab - visible only if logged in */}
        {isLoggedIn && (
          <AnimatedLink to="/profile" className="login">
            Profile
          </AnimatedLink>
        )}

        {/* Temporary Admin Link */}
        <AnimatedLink to="/adminhome">Admin</AnimatedLink>
        <AnimatedLink to="/cart">
          <FaShoppingCart />
        </AnimatedLink>
      </nav>
    </header>
  );
};

export default Header;
