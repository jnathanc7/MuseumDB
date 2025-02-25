import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const AnimatedLink = ({ to, children }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }} // Slight scale-up on hover
      whileTap={{ scale: 0.95 }} // Shrink effect on click
    >
      <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
        {children}
      </Link>
    </motion.div>
  );
};

// Add PropTypes for validation
AnimatedLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default AnimatedLink;
