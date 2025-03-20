import { useState, memo, useEffect } from "react";
import { Calendar, Plus, Minus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import '../styles/giftShop.css';
import Footer from "../components/Footer";

const GiftshopProduct = () =>{
    const{categoryName, productID} = useParams();
    const [totalProduct, setTotalProduct] = useState(0); 
    const [product, setProduct] = useState(null)

    const increment = () =>{
        setTotalProduct(totalProduct + 1);
    };
    const decrement = () =>{
        setTotalProduct(totalProduct > 0 ? totalProduct - 1 : 0)
    }

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

        const addToCart = () =>{
        const data = {id: product.Product_ID, name: product.Name, img: product.Image_URL, amount: totalProduct}
        localStorage.setItem("data", JSON.stringify(data));
        window.location.href = "/cart";
        }

        return(
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
                    <button className = "cart-button">Add To Cart</button>
                </div>
            </div>            
        )
}

export default GiftshopProduct;