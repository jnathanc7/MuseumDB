import { useState, memo, useEffect } from "react";
import { Calendar, Plus, Minus, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/shopcart.css";

const CartItem = memo(({ cartItem, OnRemove, Increment, Decrement}) => (
  <div className="cart-product">
        <img src= {cartItem.Image_URL} alt={cartItem.Name} />
        <div className="product-info">
          <h2 className="cart-product-info">{cartItem.Name}</h2>
          <p className="cart-product-info">${cartItem.Price}</p>
          <p className="cart-product-info">
            {cartItem.Description}
          </p>
          <div className="product-counter">
            <button className="remove" onClick = {() => OnRemove(cartItem.Cart_Item_ID)}>Remove</button>
            <div
              className="icon-button"
              role="button"
              tabIndex="0"
              onClick={() => Decrement(cartItem.Cart_Item_ID)}
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
              onClick={() => Increment(cartItem.Cart_Item_ID)}
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
  const [subTotal, setSubTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card"); 
  const [confirmation, setConfirmation] = useState("")

  const increment = (cartItemId) =>{
    setCartProducts(prev =>
      prev.map(item =>
        item.Cart_Item_ID === cartItemId
          ? { ...item, Quantity: item.Quantity + 1 }
          : item
      )
    );
    };
  const decrement = (cartItemId) =>{
    setCartProducts(prev =>
      prev.map(item =>
        item.Cart_Item_ID === cartItemId && item.Quantity > 1 
          ? { ...item, Quantity: item.Quantity - 1 }
          : item
      )
    );
    }
    //calculates the subtotal/runs everytime a product quantity is + or - 
    useEffect(() => {
      const total = cartProducts.reduce((sum, item) => {
        return sum + item.Price * item.Quantity;
      }, 0);
      setSubTotal(total);
    }, [cartProducts]);//+ or - affects the cartProduct object so it detects it and will run the useEffect when that change is detected

  const fetchShopCart = async () =>{
    try{
      const response = await fetch("https://museumdb.onrender.com/cart");
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

const RemoveFromCart = async (cartItemID) =>{
  try{
      const response = await fetch(`https://museumdb.onrender.com/cart`,  {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({Cart_Item_ID: cartItemID}),
      });
       
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log("Server Response: ", result); 
      //remove 
      setCartProducts(prev =>
        prev.filter(item => item.Cart_Item_ID !== cartItemID)
      );
  }
  catch(error){
      console.error("Error removing from cart:", error);
  }
}

const Purchase = async () =>{
  //filter useState to only get data that is required for the query (we dont need url,description, cartid)
  const products = cartProducts.map(item => ({
    Product_ID: item.Product_ID,
    Quantity: item.Quantity,
    Price: item.Price
  }));

  //package the data into one to send to the backend
  const purchaseData = {
    payment_Method: paymentMethod,
    total_amount: subTotal,
    products: products,
  }

  try{
      const response = await fetch(`https://museumdb.onrender.com/cart`,  {//need to change to render
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(purchaseData),
      });
       
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log("Server Response: ", result); 
      setConfirmation(result.message);
  }
  catch(error){
      console.error("Error processing transaction:", error);
  }
}

  return (
    <div className="cart-wrapper">
      <h1>Shopping Cart</h1>
      {cartProducts.length === 0 ? (
      <div>   
      <Link className = "giftshop-link" to ="/giftshop" ><p>Your cart is empty...</p></Link>
      </div>
    ) : (
      <>
      {cartProducts.map((cartItem) => (
        //have to pass the RemovefromCart function to the CartItem
        <CartItem key = {cartItem.Cart_Item_ID} cartItem = {cartItem} OnRemove = {RemoveFromCart} Increment = {increment} Decrement = {decrement} />
      ))}

      <hr className = "divider" />
      {/* Subtotal Section */}
      <strong className ="summary">Order Summary</strong>
        <div className="subtotal">
          
          <strong>Subtotal:</strong>
          <span className="subtotal-amount">${subTotal.toFixed(2)}</span>
        </div>

        {/* Payment Method Selection */}
        <div className="payment-box">
          <CreditCard className="payment-icon" />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="payment-select"
          >
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
          </select>
        </div>
        
        <div
          className="purchase-button"
          role="button"
          tabIndex="0"
          onClick={Purchase}//change this later to query into the database
          onKeyPress={(e) => {
            if (e.key === "Enter") handleDecrement(totalProduct);
          }}
        >
          Purchase
        </div>
        {/* Show purchase confirmation message */}
        {confirmation && <p className="purchase-message">{confirmation}</p>}
        
      </>
    )}
    </div>
  );
};

export default ShopCart;
