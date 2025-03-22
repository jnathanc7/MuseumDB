import { useState, memo, useEffect } from "react";
import { Calendar, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/shopcart.css";

const CartItem = memo(({ cartItem }) => (
  <div className="cart-product">
        <img src= {cartItem.Image_URL} alt={cartItem.Name} />
        <div className="product-info">
          <h2 className="cart-product-info">{cartItem.Name}</h2>
          <p className="cart-product-info">${cartItem.Price}</p>
          <p className="cart-product-info">
            {cartItem.Description}
          </p>
          <div className="product-counter">
            <button className="remove">Remove</button>
            <div
              className="icon-button"
              role="button"
              tabIndex="0"
              onClick={() => decrement(totalProduct)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleDecrement(cartItem.Quantity);
              }}
            >
              <Minus className="icon" />
              {/* need to post when a purchase is made */}
            </div>
            <span>{cartItem.Quantity}</span>
            <div
              className="icon-button"
              role="button"
              tabIndex="0"
              onClick={() => increment(totalProduct)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleDecrement(totalProduct);
              }}
            >
              <Plus className="icon" />
            </div>
          </div>
        </div>
      </div>
      
));


const ShopCart = () => {
  const [cartProducts, setCartProducts] = useState([]);

  const fetchShopCart = async () =>{
    try{
      const response = await fetch("http://localhost:5000/cart");
      const data = await response.json();
      console.log("Fetched Cart Data", data);
      setCartProducts(data);
  }
  catch(error){
      console.error("Error fetching from cart:", error);
  }
}

useEffect(() => {
  fetchShopCart();
}, [])
    

  return (
    <div className="cart-wrapper">
      <h1>Shopping Cart</h1>
      {cartProducts.length === 0 ? (
      <div>   
      <Link className = "giftshop-link" to ="/giftshop" ><p>Your cart is empty...</p></Link>
      </div>
    ) : (
      cartProducts.map((cartItem) => (
        <CartItem key = {cartItem.Cart_Item_ID} cartItem = {cartItem}/>
      ))
    )}
    </div>
  );
};

export default ShopCart;
