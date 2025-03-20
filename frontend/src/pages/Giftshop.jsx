//setting up giftshop
import { useState, memo, useEffect } from "react";
import { Link } from "react-router-dom";
import '../styles/giftShop.css';
import Footer from "../components/Footer";

/*memo the individual category div to improve rendering/stop from rerendering there is no change for child */
const CategoryItem = memo(({ category }) => (
    <Link className = "category-link" to ={ `/Giftshop/${encodeURIComponent(category.Name)}`}>
    <div className="category" data-img={category.Image_URL} style={{ backgroundImage: `url(${category.Image_URL})` }}>
        <p className="category-text">{category.Name}</p>
    </div>
    </Link>
));

 
const Giftshop = () =>{

    /*if i want to make it dynamic then i would have to add a case to check if the user 
    has authorization to update the store if access is approved then show button that 
    updates array if not dont show and present the current state of the array */
    /*categories is the current state, setCategories will update the state of the array */
    /*instead of hard coding data make new entity in data base and fetch the info from the table */
    const [categories, setCategories] = useState([]);

    const fetchCategories = async () =>{
        try{
            const response = await fetch("http://localhost:5000/giftshop");
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
            <div className = "giftshop-hero" >
            <h1 className = "giftshophero-header">Welcome to the Museum Giftshop</h1>
            <p className = "giftshophero-text">Discover a curated selection of art prints, handcrafted jewelry, unique souvenirs, and more. Take home a piece of history today!</p>
            </div>

            {/* Categories Section */}
            <div className = "giftshop-container"> 
                {categories.map((category) => (/*maps through the array map calls the function on every element in the array */
                    /*creates a new category for each index */
                    <CategoryItem key={category.Category_ID} category={category} />
                ))}
            </div>
            <Footer />
        </div>
    )
 
}

export default Giftshop;