import AnimatedLink from "./AnimatedLink";

const Header = () => {
  return (
    <header className="header">
      <h1 className="logo">
        <AnimatedLink to="/">Museum</AnimatedLink>
      </h1>
      <nav className="nav-links">
        <AnimatedLink to="/giftshop">Gift Shop</AnimatedLink>
        <AnimatedLink to="/tickets">Tickets</AnimatedLink>
        <AnimatedLink to="/exhibitions">Exhibitions</AnimatedLink>
        <AnimatedLink to="/donations">Donations</AnimatedLink>
        <AnimatedLink to="/Auth" className="login">Login</AnimatedLink>
        {/* this  is just so we can see what we have for the admin page, will have to be removed eventually */}
        <AnimatedLink to="/adminhome">Admin</AnimatedLink>

      </nav>
    </header>
  );
};

export default Header;







