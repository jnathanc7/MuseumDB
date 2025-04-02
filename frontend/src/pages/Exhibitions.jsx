import { motion } from 'framer-motion';
import '../styles/exhibition.css';

const exhibitionsData = [
  {
    image: 'path/to/image1.jpg',
    title: 'Exhibition Title 1',
    date: '2025-01-01',
    description: 'Brief description of exhibition 1'
  },
  {
    image: 'path/to/image2.jpg',
    title: 'Exhibition Title 2',
    date: '2025-02-01',
    description: 'Brief description of exhibition 2'
  },
  // Add more exhibitions as needed...
];

const Exhibitions = () => {
  return (
    <div className="exhibitions-container">
      {/* Introductory Outlook Section */}
      <section className="intro-section">
        <motion.div
          className="intro-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1>Welcome to Our Exhibitions</h1>
          <p>Discover the transformative moments captured in our special exhibitions.</p>
        </motion.div>
      </section>

      {/* Pivotal Moments Section */}
      <section className="pivotal-moments">
        <h2>Special Exhibitions</h2>
        <div className="exhibition-cards">
          {exhibitionsData.map((exhibition, index) => (
            <motion.div
              key={index}
              className="exhibition-card"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img src={exhibition.image} alt={exhibition.title} loading="lazy" />
              <div className="card-content">
                <h3>{exhibition.title}</h3>
                <p className="date">{exhibition.date}</p>
                <p className="description">{exhibition.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Exhibitions;
