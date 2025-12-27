import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./OrderPage.css";

// IMAGE IMPORTS
import riceImg from "../../assets/images/rice.jpg";
import beyeImg from "../../assets/images/aynet-food.webp";
import pastaImg from "../../assets/images/pasta-copy.jpg";
import chechebsaImg from "../../assets/images/chechebsa.jpg";
import softDrinkImg from "../../assets/images/leslase-be-hayland.webp";
import tastyImg from "../../assets/images/tasty-with-yellow.jpg";
import shiroImg from "../../assets/images/shrowet-copy.jpg";
import enkulalImg from "../../assets/images/enkulal-firfr.jpg";
import misrFreshImg from "../../assets/images/misr-be-alcha.webp";
import misrKeyImg from "../../assets/images/misr-red.jpg";
import dinichAlchaImg from "../../assets/images/dinch-be-alcha.jpg";
import firfrKeyImg from "../../assets/images/firfr-be-key.webp";
import dinichKeyImg from "../../assets/images/dinch-be-key.jpg";

// ===================== PRODUCT LIST =====================
const ALL_PRODUCTS = [
  { id: 1, title: "Rice", price: 100, url: riceImg },
  { id: 2, title: "Beyaynet", price: 60, url: beyeImg },
  { id: 3, title: "Pasta", price: 50, url: pastaImg },
  { id: 4, title: "Chechebsa", price: 50, url: chechebsaImg },
  { id: 5, title: "Soft Drink", price: 60, url: softDrinkImg },
  { id: 6, title: "Tasty", price: 70, url: tastyImg },
  { id: 7, title: "Shiro", price: 60, url: shiroImg },
  { id: 8, title: "Enkulal Firfr", price: 100, url: enkulalImg },
  { id: 9, title: "Misr Fresh", price: 70, url: misrFreshImg },
  { id: 10, title: "Misr Be Key", price: 70, url: misrKeyImg },
  { id: 11, title: "Dinich Be Alcha", price: 60, url: dinichAlchaImg },
  { id: 12, title: "Firfr Be Key", price: 60, url: firfrKeyImg },
  { id: 13, title: "Dinich Be Key", price: 50, url: dinichKeyImg },
];

// INITIAL STOCK
const INITIAL_STOCK = { 1: 5, 2: 2, 3: 10, 13: 0 };
const INITIAL_PRODUCT_COUNT = 3;

// ===================== MAIN COMPONENT =====================
const OrderPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [productsToShow, setProductsToShow] = useState(ALL_PRODUCTS.slice(0, INITIAL_PRODUCT_COUNT));
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || []);
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [feedback, setFeedback] = useState("");
  const [contractType, setContractType] = useState("none");
  const [deliveryPlace, setDeliveryPlace] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);

  // ===================== ADD TO ORDER =====================
  const handleAddToOrder = useCallback((product) => {
    const currentStock = stock[product.id] || 999;
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem?.quantity >= currentStock)
      return alert(`Only ${currentStock} pieces available for ${product.title}`);

    setCart((prev) =>
      existingItem
        ? prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { ...product, quantity: 1 }]
    );
  }, [cart, stock]);

  // ===================== CHANGE QTY =====================
  const updateQuantity = (id, q) => {
    if (q < 1) return setCart(cart.filter((p) => p.id !== id));
    if (q > (stock[id] || 999)) return alert("Stock limit reached!");

    setCart(cart.map((i) => (i.id === id ? { ...i, quantity: q } : i)));
  };

  // ===================== CONFIRM ORDER =====================
  const handleOrderConfirmation = (e) => {
    e.preventDefault();
    if (!deliveryPlace) return alert("Choose delivery place!");
    if (!cart.length) return alert("Cart empty!");

    alert(`Order Confirmed for ${deliveryPlace} — Total ${totalAmount} ETB`);
    setCart([]);
    setIsCheckoutOpen(false);
  };

  // ===================== CARD UI =====================
  const MenuCard = ({ product }) => {
    const item = cart.find((i) => i.id === product.id);
    const q = item?.quantity || 0;
    const st = stock[product.id] || 999;

    return (
      <div className="card">
        <img src={product.url} alt={product.title} />
        <h4>{product.title}</h4>
        <p className="price">{product.price} ETB</p>
        <p className="stock">Stock: {st === 0 ? "❌ Out" : st}</p>

        <button
          disabled={q >= st}
          onClick={() => handleAddToOrder(product)}
          className={q >= st ? "disabled" : ""}
        >
          {st === 0 ? "SOLD OUT" : "ADD ORDER"}
        </button>
      </div>
    );
  };

  // ===================== CART SIDEBAR =====================
  const CartSidebar = () => (
    <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
      <h2>🛒 Orders ({totalItems})</h2>
      <span className="close" onClick={() => setIsSidebarOpen(false)}>X</span>

      <div className="cart-list">
        {cart.length ? cart.map((item) => (
          <div key={item.id} className="cart-item">
            {item.title}
            <div className="qty">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>
            <strong>{item.price * item.quantity} ETB</strong>
          </div>
        )) : <p>No items added.</p>}
      </div>

      <h3>Total: {totalAmount} ETB</h3>
      <button onClick={() => { setIsSidebarOpen(false); setIsCheckoutOpen(true); }} className="checkoutBtn">
        Checkout
      </button>
    </div>
  );

  // ===================== FEEDBACK =====================
  const FeedbackSection = () => (
    <div className="feedback">
      <h2>📝 Write Feedback</h2>
      <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Your feedback…" />
      <button disabled={!feedback.trim()} onClick={() => {alert("Feedback received");setFeedback("");}}>
        Submit
      </button>
    </div>
  );

  // ===================== RETURN UI =====================
  return (
    <div className="order-wrapper">
      <CartSidebar />

      <div className="top-bar">
        <button onClick={() => setIsSidebarOpen(true)}>🛒 {totalItems}</button>
      </div>

      <h1 className="title">🍽 DBU Cafeteria Menu</h1>

      <div className="menu-grid">
        {productsToShow.map((p) => <MenuCard key={p.id} product={p} />)}
      </div>

      {productsToShow.length < ALL_PRODUCTS.length && (
        <button className="loadMore" onClick={() => setProductsToShow(ALL_PRODUCTS)}>Load More</button>
      )}

      <FeedbackSection />
    </div>
  );
};

export default OrderPage;
