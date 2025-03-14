import { useState, useEffect } from "react";
import AnimatedLink from "./AnimatedLink";
import "../styles/header.css"

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return ( 
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <h1 className="logo">
        <AnimatedLink to="/">Museum</AnimatedLink>
      </h1>
      <nav className="nav-links">
        <AnimatedLink to="/giftshop">Gift Shop</AnimatedLink>
        <AnimatedLink to="/tickets">Tickets</AnimatedLink>
        <AnimatedLink to="/exhibitions">Exhibitions</AnimatedLink>
        <AnimatedLink to="/donations">Donations</AnimatedLink>
        <AnimatedLink to="/Auth" className="login">Login</AnimatedLink>
        {/* Temporary Admin Link */}
        <AnimatedLink to="/adminhome">Admin</AnimatedLink>
      </nav>
    </header>
  );
};

export default Header;







