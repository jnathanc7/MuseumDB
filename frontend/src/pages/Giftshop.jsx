//setting up giftshop
import { useState } from "react";


const Giftshop = () =>{
    /*if i want to make it dynamic then i would have to add a case to check if the user 
    has authorization to update the store if access is approved then show button that 
    updates array if not dont show and present the current state of the array */
    /*categories is the current state, setCategories will update the state of the array */
    /*instead of hard coding data make new entity in data base and fetch the info from the table */
    const [categories, setCategories] = useState([{id:1, name: "Paintings", img: "/paintings.jpg"},
                                                   {id:2, name: "Jewlery", img: "/Jewlery.jpg"}, 
                                                   {id:3, name:"Books", img: "/books.jpg"},
                                                   {id:4, name:"Toys", img: ""},
                                                   {id:5, name:"", img: ""},
                                                   {id:6, name:"", img: ""}]);
    return(
        /*I removed the "homepage" div that wrapped everything  */
        <div className = "giftshop-wrapper">
            {/*Hero Section */}
            <div className = "giftshop-hero" style = {{backgroundImage: `url(${"/giftshophero.jpg"})`}}>
            <h1>Welcome to our Museum Giftshop</h1>
            <p>Discover a curated selection of art prints, handcrafted jewelry, unique souvenirs, and more. Take home a piece of history today!</p>
            </div>

            {/* Categories Section */}
            <div className = "giftshop-container"> 
                {categories.map((category) => (/*maps through the array map calls the function on every element in the array */
                    /*creates a new category for each index */
                    <div key = {category.id} className = "category" style = {{backgroundImage: `url(${category.img})`}}>
                        <p className = "category-text">{category.name}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Giftshop