import {BrowserRouter as Router, Routes, Route, useLocation,} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Ticket from "./pages/Ticket";
import Home from "./pages/Home";
import Exhibitions from "./pages/Exhibitions";
import Giftshop from "./pages/Giftshop";
import PropTypes from "prop-types";
import Auth from './pages/Auth';
import AdminHome from "./pages/staff/AdminHome";
import ManaageEmployees from "./pages/staff/ManaageEmployees";
import Profile from "./pages/staff/Profile";
import TotalReport from "./pages/staff/TotalReport";




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
  const location = useLocation(); // Now inside Router, so it's valid

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
        <Route path="/profile" element={<Profile />} /> {/* Add Profile Route */}
        <Route path="/admin/total-report" element={<TotalReport/>} /> 
        {/* Add other routes here */}

        </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <Header />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
