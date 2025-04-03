import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import '../styles/exhibition.css';
import image1 from '/src/assets/image1.jpg';
import image2 from '/src/assets/image2.jpg';
import image3 from '/src/assets/image3.jpg';
import image4 from '/src/assets/image4.jpg';

const images = [image1, image2, image3, image4];

const exhibitionsData = [
  {
    id: 1,
    image: images[0],
    title: 'Exhibition Title 1',
    date: '2025-01-01',
    description: 'Brief description of exhibition 1'
  },
  {
    id: 2,
    image: images[1],
    title: 'Exhibition Title 2',
    date: '2025-02-01',
    description: 'Brief description of exhibition 2'
  },
  {
    id: 3,
    image: images[2],
    title: 'Exhibition Title 3',
    date: '2025-03-01',
    description: 'Brief description of exhibition 3'
  },
  {
    id: 4,
    image: images[3],
    title: 'Exhibition Title 4',
    date: '2025-04-01',
    description: 'Brief description of exhibition 4'
  },
];

const Exhibitions = () => {
  // Use an array to allow multiple open bars at once
  const [expandedIds, setExpandedIds] = useState([]);

  const handleToggle = (id) => {
    setExpandedIds((prev) => {
      // If id is already expanded, remove it; otherwise, add it.
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  return (
    <div className="exhibitions-page">
      <div className="exhibitions-container">
        {/* Header Section */}
        <div className="exhibitions-header">
          <h1>WELCOME TO EXHIBITIONS</h1>
          <p>Explore our special exhibitions and discover pivotal moments.</p>
        </div>

        {/* Special Exhibitions List */}
        <div className="exhibitions-list">
          {exhibitionsData.map((exhibition) => {
            const isExpanded = expandedIds.includes(exhibition.id);
            return (
              <div key={exhibition.id} className="exhibition-item">
                {/* Horizontal Bar with Icon and Conditional Text Color */}
                <motion.div
                  className={`exhibition-bar ${isExpanded ? 'active' : ''}`}
                  onClick={() => handleToggle(exhibition.id)}
                  whileHover={{ scale: 1.01 }}
                >
                  <h2 className={isExpanded ? 'active' : ''}>
                    {exhibition.title}
                  </h2>
                  <AnimatePresence mode="wait">
                    {isExpanded ? (
                      <motion.span
                        key="minus"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Minus size={20} color="#fff" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="plus"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Plus size={20} color="#fff" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Expanded Content Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      layout
                      className="exhibition-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="content-inner">
                        <p>{exhibition.description}</p>
                        {/* Improved image rendering attributes */}
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Exhibitions;
