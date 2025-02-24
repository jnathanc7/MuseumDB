import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <h1 className="logo">
        <Link to="/">Museum</Link>
      </h1>
      <nav className="nav-links">
        <Link to="/giftshop">Gift Shop</Link>
        <Link to="/tickets">Tickets</Link>
        <Link to="/exhibitions">Exhibitions</Link>
        <Link to="/donations">Donations</Link>
        <Link to="/Auth">Login</Link>
      </nav>
    </header>
  );
};

export default Header;




