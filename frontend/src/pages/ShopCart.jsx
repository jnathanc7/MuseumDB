import { useState, memo, useEffect } from "react";
import { Calendar, Plus, Minus } from "lucide-react";
import "../styles/shopcart.css";

const ShopCart = () => {
  const [cartProducts, setCartProducts] = useState([]);
  return (
    <div className="cart-wrapper">
      <h1>Shopping Cart</h1>
      <div className="cart-product">
        <img src="/painting1.jpg" alt="painting" />
        <div className="product-info">
          <h2 className="cart-product-info">product</h2>
          <p className="cart-product-info">price</p>
          <p className="cart-product-info">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae,
            vitae alias ad sint error voluptas eos iusto, beatae id deleniti
            saepe! Ratione, odit ipsa? Atque consectetur obcaecati quis soluta.
            Mollitia?
          </p>
          <div className="product-counter">
            <button className="remove">Remove</button>
            <div
              className="icon-button"
              role="button"
              tabIndex="0"
              onClick={() => decrement(totalProduct)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleDecrement(totalProduct);
              }}
            >
              <Minus className="icon" />
              {/* need to post when a purchase is made */}
            </div>
            <span>{1}</span>
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
      <div className="cart-product">
        <img src="/painting1.jpg" alt="painting" />
        <div className="product-info">
          <h2 className="cart-product-info">product</h2>
          <p className="cart-product-info">price</p>
          <p className="cart-product-info">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae,
            vitae alias ad sint error voluptas eos iusto, beatae id deleniti
            saepe! Ratione, odit ipsa? Atque consectetur obcaecati quis soluta.
            Mollitia?
          </p>
          <div className="product-counter">
            <button className="remove">Remove</button>
            <div
              className="icon-button"
              role="button"
              tabIndex="0"
              onClick={() => decrement(totalProduct)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleDecrement(totalProduct);
              }}
            >
              <Minus className="icon" />
              {/* need to post when a purchase is made */}
            </div>
            <span>{1}</span>
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
    </div>
  );
};

export default ShopCart;
