//setting up giftshop
import { useState, memo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import '../styles/giftShop.css';
import Footer from "../components/Footer";


const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };
  

/*memo the individual category div to improve rendering/stop from rerendering there is no change for child */
const CategoryItemBase = ({ category }) => {
    const [loaded, setLoaded] = useState(false);
  
    return (
      <Link
        className="category-link"
        to={`/Giftshop/${encodeURIComponent(category.Name)}`}
      >
        <div
          className="category"
          // variants={cardVariants}
          // whileHover={{ scale: 1.05 }}
          // initial={{ opacity: 0, y: 20, scale: 0.95 }}
          // animate={{ opacity: 1, y: 0, scale: 1 }}
          // transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          {/* <motion.img
            src={category.Image_URL}
            alt={category.Name}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className="category-image"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={loaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          /> */}
           <div
          className="category-image-bg"
          style={{ backgroundImage: `url(${category.Image_URL})` }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <p className="category-text">{category.Name}</p>
      </div>
      </Link>
    );
  };
  
  const CategoryItem = memo(CategoryItemBase);
  
  

 
const Giftshop = () =>{

    /*if i want to make it dynamic then i would have to add a case to check if the user 
    has authorization to update the store if access is approved then show button that 
    updates array if not dont show and present the current state of the array */
    /*categories is the current state, setCategories will update the state of the array */
    /*instead of hard coding data make new entity in data base and fetch the info from the table */
    const [categories, setCategories] = useState([]);

    const fetchCategories = async () =>{
        try{
            const response = await fetch("https://museumdb.onrender.com/giftshop");
            const data = await response.json();
            console.log("Fetched Category Data", data);
            setCategories(data);
        }
        catch(error){
            console.error("Error fetching categories:", error);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, [])
    
    return(
        /*I removed the "homepage" div that wrapped everything  */
        <div className = "giftshop-wrapper">
            {/*Hero Section */}          
            <motion.div className = "giftshop-hero"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }} >
            <h1 className = "giftshophero-header">Welcome to the Museum Giftshop</h1>
            <p className = "giftshophero-text">Discover a curated selection of art prints, handcrafted jewelry, unique souvenirs, and more!</p>
            </motion.div>

            {/* Categories Section */}
            <motion.div className = "giftshop-container"
                        //  variants={containerVariants}
                         initial="hidden"
                         animate="visible"> 
                {categories.map((category) => (/*maps through the array map calls the function on every element in the array */
                    /*creates a new category for each index */
                    <CategoryItem key={category.Category_ID} category={category} />
                ))}
            </motion.div>
        </div>
    )
 
}

export default Giftshop;