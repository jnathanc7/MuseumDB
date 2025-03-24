import { useState, memo, useEffect } from "react";
import { Calendar, Plus, Minus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import '../styles/giftShop.css';
import Footer from "../components/Footer";

const GiftshopProduct = () =>{
    const{categoryName, productID} = useParams();
    const [totalProduct, setTotalProduct] = useState(0); 
    const [product, setProduct] = useState({})
    const [addedToCart, setAddedToCart] = useState(false);

    const increment = () =>{
        setTotalProduct(totalProduct + 1);
    };
    const decrement = () =>{
        setTotalProduct(totalProduct > 0 ? totalProduct - 1 : 0)
    };

    const fetchProduct = async () =>{
            try{
                const response = await fetch(`http://localhost:5000/giftshop/${encodeURIComponent(categoryName)}/${encodeURIComponent(productID)}`)
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }        
                console.log("Fetched Product Data", data);
                setProduct(data[0]);
            }
            catch(error){
                console.error("Error fetching products:", error);
            }
        }
    
        useEffect(() => {
            console.log("Fetching product:", productID);
            fetchProduct();
        }, [categoryName,productID])

        const productInfo = {
            Product_ID: product?.Product_ID,
            Quantity: totalProduct,
        };

        const AddToCart = async () =>{
            try{
                const response = await fetch(`http://localhost:5000/giftshop/${encodeURIComponent(categoryName)}/${encodeURIComponent(productID)}`,  {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(productInfo),
                });
                 
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const result = await response.json();
                setAddedToCart(true);
                setTimeout(() => setAddedToCart(false), 1500);
                console.log("Server Response: ", result);        
            }
            catch(error){
                console.error("Error adding to cart:", error);
            }
            // setShowPopup(true);
        }

        return(  
            <>
            {/* {showPopup && (
                <div className="popup-overlay">
                  <div className="popup-message">
                  <button onClick={() => setShowPopup(false)}>x</button>
                    Added to cart!
                  </div>
                </div>
              )}       */}
            <div className = "product-wrapper">
                <div className = "product-left" style = 
                {{backgroundImage: `url(${product?.Image_URL})`,//need to change to BLOB right now its just statically retreiving the url and matching with our files
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '400px', 
                  height: '300px',
                }}>
                </div>
                <div className = "product-right">
                    {/*pull description and name from backend */}
                    <h1>{product?.Name || "loading..."}</h1>
                    <p>${product?.Price || "loading..."}</p>
                    <p>{product?.Description || "loading..."}</p>
                    {/*borrowing arsals buttons */}
                <div className = "product-counter">
                    
                    <div
                        className="icon-button"
                        role="button"
                        tabIndex="0"
                        onClick={() => decrement(totalProduct)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleDecrement(totalProduct); }}
                        >
                        <Minus className="icon" />
                        {/* need to post when a purchase is made */}
                        </div><span>{totalProduct}</span><div
                        className="icon-button"
                        role="button"
                        tabIndex="0"
                        onClick={() => increment(totalProduct)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleDecrement(totalProduct); }}
                        >
                        <Plus className="icon" />
                    </div>
                </div>
                    {product ? (
                    <button className = {`cart-button ${addedToCart ? "added" : ""}`} onClick = {AddToCart}>
                        <span className={`button-text ${addedToCart ? "fade-in" : "fade-out"}`}>
                        {addedToCart ? "✓ Added" : "Add To Cart"}
                        </span>
                    </button>
                    ):(
                        <p>Loading product...</p>
                    )}
                </div>
            </div>   
            </>         
        )
}

export default GiftshopProduct;