import { motion } from 'framer-motion';

const Separator = () => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    style={{
      display: "inline-block",
      width: "2px",  // Makes the separator line thin
      height: "20px", // Controls the length of the line
      backgroundColor: "#666", // Color of the separator
      margin: "0 10px", // Space around the separator
    }}
  />
);


export default Separator; 