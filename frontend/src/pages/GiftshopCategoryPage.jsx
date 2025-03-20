import Footer from "../components/Footer";
import { useParams } from 'react-router-dom';
import { useState, memo, useEffect } from "react";
import '../styles/giftShop.css';
import { Link } from "react-router-dom";

const ProductItem = memo(({product, categoryName}) =>(
    <Link className = "product-link" to ={ `/Giftshop/${categoryName}/${encodeURIComponent(product.Product_ID)}`}>
    <div className = "product">
        <img src={product.Image_URL} alt={product.Name} />
        <p>{product.Name} <br /> ${product.Price}</p>
     </div>
    </Link>
));

//displaying products based on the category
const GiftshopCategoryPage = () =>{
    const [products, setProducts] = useState([]);
    /*extract category name from url, once i get that i can use the categoryname to fetch from api.
    lowkey should prob use id cause of uniqueness idkkk */
    const{categoryName} = useParams();
    const fetchProducts = async () =>{
        try{
            const response = await fetch(`http://localhost:5000/giftshop/${encodeURIComponent(categoryName)}`)
            const data = await response.json();
            console.log("Fetched Product Data", data);
            setProducts(data);
        }
        catch(error){
            console.error("Error fetching products:", error);
        }
    }

    useEffect(() => {
        console.log("Fetching products for category:", categoryName);
        fetchProducts();
    }, [categoryName])

    return(
    <div className = "CategoryPage-wrapper">
        <h1 className = "product-header">{categoryName}</h1>
        <div className = "product-container"> 
            {products.length > 0 ? (products.map((product) => (
            <ProductItem key={product.Product_ID} product={product} categoryName={categoryName} />
            ))
        ) : (
            <p>No products available.</p> //implemented a conditional statement to check whether or not there are products or not
        )}
        </div>
        <Footer />
    </div>
    )
}
export default GiftshopCategoryPage;