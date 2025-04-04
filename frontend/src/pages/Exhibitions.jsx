import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import '../styles/exhibition.css';
import image1 from '/src/assets/image1.jpg';
import image2 from '/src/assets/image2.jpg';
import image3 from '/src/assets/image3.jpg';
import image4 from '/src/assets/image4.jpg';

const exhibitionsData = [
  {
    id: 1,
    image: image1,
    title: 'Exhibition Title 1',
    date: '2025-01-01',
    description: 'Brief description of exhibition 1',
    themeColor: "#b3000c" // Red
  },
  {
    id: 2,
    image: image2,
    title: 'Exhibition Title 2',
    date: '2025-02-01',
    description: 'Brief description of exhibition 2',
    themeColor: "#007bff" // Blue
  },
  {
    id: 3,
    image: image3,
    title: 'Exhibition Title 3',
    date: '2025-03-01',
    description: 'Brief description of exhibition 3',
    themeColor: "#28a745" // Green
  },
  {
    id: 4,
    image: image4,
    title: 'Exhibition Title 4',
    date: '2025-04-01',
    description: 'Brief description of exhibition 4',
    themeColor: "#ffc107" // Yellow
  },
];

// Container variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

// Card variants for entrance (fade in + slide upward with spring)
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

const Exhibitions = () => {
  // This state holds the theme color of the card currently hovered.
  const [hoveredColor, setHoveredColor] = useState(null);

  return (
    <div className="exhibitions-page">
      {/* Background overlay with gradient dots whose dot color is animated */}
      <motion.div 
        className="background-overlay"
        animate={{
          backgroundColor: "rgba(0,0,0,0)", // remains transparent
          "--dot-color": hoveredColor || "rgba(255,255,255,0.1)"
        }}
        transition={{ duration: 0.5 }}
      />
      <div className="exhibitions-container">
        {/* Header Section */}
        <div className="exhibitions-header">
          <h1>WELCOME TO EXHIBITIONS</h1>
          <p>Explore our special exhibitions and discover pivotal moments.</p>
        </div>

        {/* Exhibitions Grid with staggered entrance */}
        <motion.div 
          className="exhibitions-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {exhibitionsData.map((exhibition) => (
            <motion.div
              key={exhibition.id}
              className="exhibition-card"
              variants={cardVariants}
              whileHover={{ 
                scale: 1.03,
                backgroundColor: exhibition.themeColor 
              }}
              onHoverStart={() => setHoveredColor(exhibition.themeColor)}
              onHoverEnd={() => setHoveredColor(null)}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
            >
              <Link to={`/artworks`} className="card-link">
                <img
                  src={exhibition.image}
                  alt={exhibition.title}
                  loading="lazy"
                  width="600"
                  height="400"
                  srcSet={`
                    ${exhibition.image} 600w,
                    ${exhibition.image} 300w
                  `}
                  sizes="(max-width: 600px) 300px, 600px"
                />
                <div className="card-content">
                  <h2>{exhibition.title}</h2>
                  <p>{exhibition.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Exhibitions;
