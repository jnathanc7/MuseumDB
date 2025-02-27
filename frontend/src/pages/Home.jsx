// src/pages/Home.jsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Home = () => {
  const text = "Welcome!";
  const subText = "To the Houston Museum of Fine Arts!";
  const [displayedText, setDisplayedText] = useState("");
  const [displayedSubText, setDisplayedSubText] = useState("");

  useEffect(() => {
    let i = 0;
    const fullText = text + " " + subText; // Combine both for seamless typing
    let tempText = "";

    const interval = setInterval(() => {
      if (i < fullText.length) {
        tempText += fullText[i];

        // Split the text dynamically between title and subtitle
        if (i < text.length) {
          setDisplayedText(tempText);
        } else {
          setDisplayedSubText(tempText.slice(text.length + 1)); // Remove space from start
        }
      } else {
        clearInterval(interval);
      }
      i++;
    }, 100); // Adjust speed of typing effect

    return () => clearInterval(interval);
  }, []);

  const images = [
    "/src/assets/image1.jpg",
    "/src/assets/image2.jpg",
    "/src/assets/image3.jpg",
    "/src/assets/image4.jpg"
  ];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="homepage">
      <div className="text-container">
        <motion.h1 
          className="home-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {displayedText}
        </motion.h1>
        <motion.p 
          className="home-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {displayedSubText}
        </motion.p>
      </div>

      {/* Animated Slideshow */}
      <motion.div
        key={currentImage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="slideshow-container"
      >
        <img
          src={images[currentImage]}
          alt={`Slideshow Image ${currentImage}`}
          className="slideshow-image"
        />
      </motion.div>
    </div>
  );
};

export default Home;
