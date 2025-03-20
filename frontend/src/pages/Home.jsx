// src/pages/Home.jsx
import { motion } from "framer-motion";
import AnimatedLink from "../components/AnimatedLink";
import image1 from '/src/assets/image1.jpg';
import "../styles/home.css";

const Home = () => {
  return (
    <div className="page-container">
      <div className="sidebar">
        <h1 className="museum-name">Houston Museum of Fine Arts</h1>
        <nav className="nav-links">
          <ul>
            <li><AnimatedLink to="/auth">Login</AnimatedLink></li>
            <li><AnimatedLink to="/exhibitions">Exhibitions</AnimatedLink></li>
            <li><AnimatedLink to="/tickets">Tickets</AnimatedLink></li>
            <li><AnimatedLink to="/memberships">Memberships</AnimatedLink></li>
            <li><AnimatedLink to="/giftshop">Gift Shop</AnimatedLink></li>
            <li><AnimatedLink to="/contact">Contact</AnimatedLink></li>
          </ul>
        </nav>
      </div>
      <div className="main-content">
        <motion.div
          className="text-section"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="main-title">The Art of the 21st Century</h2>
          <p className="subtitle">
            Explore the evolution of artistic expression through contemporary exhibitions and timeless masterpieces.
          </p>
          <AnimatedLink to="/exhibitions" className="cta-button">Discover More</AnimatedLink>
        </motion.div>
        <motion.div
          className="image-frame"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <img src={image1} alt="Featured Artwork" className="featured-image" />
        </motion.div>
      </div>
    </div>
  );
};

export default Home;

