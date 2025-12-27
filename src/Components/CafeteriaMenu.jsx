import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "./Service.css";

export default function CafeteriaMenu({ title, menu }) {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="menu-container">
      <h2>{title} Menu</h2>
      <div className="menu-grid">
        {menu.map((item, index) => (
          <div className="menu-card" key={index}>
            <img src={item.img} alt={item.name} />
            <h4>{item.name}</h4>
            <p>{item.price} Birr</p>
            <button onClick={() => addToCart(item)}>Add To Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
