import Footer from "../components/Footer";
import { useParams } from 'react-router-dom';
import { useState, memo } from "react";



//displaying products based on the category
const GiftshopCategoryPage = () =>{
    /*extract category name from url, once i get that i can use the categoryname to fetch from api.
    lowkey should prob use id cause of uniqueness idkkk */
    const{categoryName} = useParams();
    /*will need to fetch all products with same category id, for now keep empty */
    const {products, setProducts} = useState(["product1", "product2", "product3"])
    return(
    <div className = "CategoryPage-wrapper">
        <h1 className = "product-header">{categoryName}</h1>
        <div className = "product-container">
            <div className = "product">
                <img src="/painting1.jpg" alt="" />
                <p>product</p>
            </div>
            <div className = "product">
                <img src="/painting1.jpg" alt="" />
                <p>product</p>
            </div>
            <div className = "product">
                <img src="/painting1.jpg" alt="" />
                <p>product</p>
            </div>
            <div className = "product">
                <img src="/painting1.jpg" alt="" />
                <p>product</p>
            </div>
            <div className = "product">
                <img src="/painting1.jpg" alt="" />
                <p>product</p>
            </div>
        </div>
        <Footer />
    </div>
    )
}
export default GiftshopCategoryPage;