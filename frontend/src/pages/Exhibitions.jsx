import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/exhibition.css';
import image1 from '/src/assets/image1.jpg';
import image2 from '/src/assets/image2.jpg';
import image3 from '/src/assets/image3.jpg';
import image4 from '/src/assets/image4.jpg';
import { Plus, Minus } from 'lucide-react';

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
  const [expandedId, setExpandedId] = useState(null);

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
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
          {exhibitionsData.map((exhibition) => (
            <div key={exhibition.id} className="exhibition-item">
              {/* Horizontal Red Bar with Icon */}
              <motion.div
                className="exhibition-bar"
                onClick={() => handleToggle(exhibition.id)}
                whileHover={{ scale: 1.01 }}
              >
                <h2>{exhibition.title}</h2>
                {expandedId === exhibition.id ? (
                  <Minus size={20} color="#fff" />
                ) : (
                  <Plus size={20} color="#fff" />
                )}
              </motion.div>

              {/* Expanded Content Section */}
              <AnimatePresence>
                {expandedId === exhibition.id && (
                  <motion.div
                    className="exhibition-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="content-inner">
                      <p>{exhibition.description}</p>
                      <img src={exhibition.image} alt={exhibition.title} loading="lazy" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Exhibitions;