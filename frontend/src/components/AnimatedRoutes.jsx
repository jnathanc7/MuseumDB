import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Ticket from "../pages/Ticket.jsx";
import Home from "../pages/Home";
import Exhibitions from "../pages/Exhibitions";
import Giftshop from "../pages/Giftshop";
import PropTypes from "prop-types";
import Auth from '../pages/Auth';
import AdminHome from "../pages/staff/AdminHome";
import ManaageEmployees from "../pages/staff/ManaageEmployees";
import Profile from "../pages/staff/Profile";
import TotalReport from "../pages/staff/TotalReport";
import Memberships from "../pages/Memberships.jsx";
import { useEffect } from "react"; // Import useEffect
import Ceramic from "../pages/ceramic";

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
};

function AnimatedRoutes() {
  const location = useLocation(); // Get the current location

  // Scroll to the top when the location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]); // When location changes, scroll to the top

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/tickets" element={<PageTransition><Ticket /></PageTransition>} />
        <Route path="/Exhibitions" element={<PageTransition><Exhibitions /></PageTransition>} />
        <Route path="/Giftshop" element={<PageTransition><Giftshop /></PageTransition>} />
        <Route path="/Auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/adminhome" element={<PageTransition><AdminHome /></PageTransition>} />
        <Route path="/admin/manage-employees" element={<ManaageEmployees />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/total-report" element={<TotalReport />} />
        <Route path="/memberships" element={<Memberships />} />
        <Route path="/ceramic" element={<PageTransition><Ceramic/></PageTransition>}/>
        {/* Add other routes here */}
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
