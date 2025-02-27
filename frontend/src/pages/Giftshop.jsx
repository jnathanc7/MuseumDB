//setting up giftshop
import { useState } from "react";


const Giftshop = () =>{
    /*if i want to make it dynamic then i would have to add a case to check if the user 
    has authorization to update the store if access is approved then show button that 
    updates array if not dont show and present the current state of the array */
    /*categories is the current state, setCategories will update the state of the array */
    const [categories, setCategories] = useState([{id:1, name: "Paintings"},
                                                   {id:2, name: "Jewlery"}, 
                                                   {id:3, name:"Books"},
                                                   {id:4, name:"Toys"},
                                                   {id:5, name:""},
                                                   {id:6, name:""}]);
    return(
    <div className = "homepage">
        {/* <h1>this is the giftshop!</h1> */}
        <div className = "giftshop-container"> 
            {categories.map((category) => (/*maps through the array map calls the function on every element in the array */
                /*creates a new category for each index */
                <div key = {category.id} className = "category">
                    <p className = "category-text">{category.name}</p>
                </div>
            ))}
        </div>
    </div>
    )
}

export default Giftshop