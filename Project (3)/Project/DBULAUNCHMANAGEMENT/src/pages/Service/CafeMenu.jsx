import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaShoppingCart, FaPlus, FaMinus, FaTrash, FaStore, FaClock, FaTag, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// IMAGE IMPORTS (keep your existing imports)
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

// ===================== PRODUCT LIST (keep your existing list) =====================
const ALL_PRODUCTS = [
  { id: 1, title: "Rice", price: 100, url: riceImg, category: "Main", description: "Traditional Ethiopian rice dish" },
  { id: 2, title: "Beyaynet", price: 60, url: beyeImg, category: "Breakfast", description: "Ethiopian breakfast favorite" },
  { id: 3, title: "Pasta", price: 50, url: pastaImg, category: "Main", description: "Italian style pasta" },
  { id: 4, title: "Chechebsa", price: 50, url: chechebsaImg, category: "Breakfast", description: "Traditional Ethiopian dish" },
  { id: 5, title: "Soft Drink", price: 60, url: softDrinkImg, category: "Drink", description: "Refreshing soft drinks" },
  { id: 6, title: "Tasty", price: 70, url: tastyImg, category: "Main", description: "Chef's special dish" },
  { id: 7, title: "Shiro", price: 60, url: shiroImg, category: "Main", description: "Ethiopian chickpea stew" },
  { id: 8, title: "Enkulal Firfr", price: 100, url: enkulalImg, category: "Main", description: "Grilled chicken dish" },
  { id: 9, title: "Misr Fresh", price: 70, url: misrFreshImg, category: "Main", description: "Fresh Ethiopian dish" },
  { id: 10, title: "Misr Be Key", price: 70, url: misrKeyImg, category: "Main", description: "Spicy Ethiopian dish" },
  { id: 11, title: "Dinich Be Alcha", price: 60, url: dinichAlchaImg, category: "Main", description: "Ethiopian chicken dish" },
  { id: 12, title: "Firfr Be Key", price: 60, url: firfrKeyImg, category: "Main", description: "Spicy beef dish" },
  { id: 13, title: "Dinich Be Key", price: 50, url: dinichKeyImg, category: "Main", description: "Traditional chicken" },
];

// INITIAL STOCK (keep your existing stock)
const INITIAL_STOCK = { 1: 5, 2: 2, 3: 10, 13: 0 };

// Dropdown options (keep your existing options)
const DELIVERY_LOCATIONS = [
  "Student Dorm Block 1",
  "Student Dorm Block 2",
  "Student Dorm Block 3",
  "Admin Building Main Entrance",
  "Library Reading Hall",
  "Faculty Office 1st Floor",
  "Gate 1 Security Post",
];

const CONTRACT_OPTIONS = [
  "No Contract (Pay-as-you-go)",
  "Monthly Contract (Prepaid)",
];

const PAYMENT_OPTIONS = ["Cash on Delivery", "CBE", "Telebirr", "Awash Bank", "Dashen Bank"];

// ===================== CART MODAL (Minor style improvements) =====================
const CartModal = ({ cart, totalAmount, totalCount, onClose, setCart }) => {
  const [contractType, setContractType] = useState("");
  const [deliveryPlace, setDeliveryPlace] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");
    if (!contractType || !deliveryPlace || !paymentMethod) {
      return alert("Please select contract, delivery, and payment options!");
    }

    // Save order to localStorage (logic is fine)
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const newOrder = {
      id: Date.now(),
      items: cart,
      subtotal: totalAmount,
      deliveryFee: 0,
      total: totalAmount,
      deliveryPlace,
      paymentMethod,
      contractType,
      note,
      status: "Pending",
      date: new Date().toLocaleString()
    };
    
    localStorage.setItem("orders", JSON.stringify([...orders, newOrder]));
    
    alert(`Order submitted to ${deliveryPlace}!\nTotal: ${totalAmount.toFixed(2)} ETB`);
    setCart([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 relative flex flex-col md:flex-row gap-8">
        {/* Left: Cart Summary - Bolder visual separation */}
        <div className="flex-1 bg-gray-100 p-6 rounded-xl flex flex-col gap-4 border-2 border-green-200">
          <h2 className="text-2xl font-extrabold text-center text-gray-800 border-b pb-2">🛒 Order Details</h2>
          <div className="overflow-y-auto max-h-72 pr-2">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">Your cart is empty! Add some delicious food.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md mb-2 transition hover:shadow-lg">
                  <img src={item.url} alt={item.title} className="w-12 h-12 object-cover rounded-md mr-3" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <p className="font-semibold text-green-600 mr-4">{item.quantity} x {item.price} ETB</p>
                  <div className="font-extrabold text-lg text-blue-700">{(item.quantity * item.price).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
          <div className="text-right font-extrabold text-2xl mt-4 border-t pt-4 border-green-300">Total: <span className="text-red-600">{totalAmount.toFixed(2)} ETB</span></div>
        </div>

        {/* Right: Checkout Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
          <h2 className="text-2xl font-extrabold text-center text-gray-800 border-b pb-2">Complete Checkout</h2>
          
          {/* Styling updates for select fields */}
          <select
            className="border-2 border-gray-300 p-3 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
            required
          >
            <option value="" disabled>Select Contract Type 📜</option>
            {CONTRACT_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="border-2 border-gray-300 p-3 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
            value={deliveryPlace}
            onChange={(e) => setDeliveryPlace(e.target.value)}
            required
          >
            <option value="" disabled>Select Delivery Location 📍</option>
            {DELIVERY_LOCATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            className="border-2 border-gray-300 p-3 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="" disabled>Select Payment Method 💳</option>
            {PAYMENT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          <textarea
            rows="3"
            placeholder="Special note (e.g., 'no onions', 'leave at the door')"
            className="border-2 border-gray-300 p-3 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-4 rounded-xl font-extrabold text-xl transition transform hover:scale-[1.02] shadow-lg mt-auto disabled:bg-gray-400"
            disabled={cart.length === 0}
          >
            Complete Order ({totalAmount.toFixed(2)} ETB)
          </button>
        </form>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-4xl text-gray-500 hover:text-red-500 transition transform hover:rotate-90"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

// ===================== CART COUNTER (Minor style improvements) =====================
const CartCounter = ({ count, onClick }) => {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        className="bg-blue-600 text-white p-4 rounded-full font-bold cursor-pointer hover:bg-blue-700 transition transform hover:scale-110 shadow-xl flex items-center gap-2"
        onClick={onClick}
      >
        <FaShoppingCart className="text-xl" />
        <span className="text-lg hidden sm:inline">View Cart:</span> <span className="bg-red-500 rounded-full px-3 py-1">{count}</span>
      </button>
    </div>
  );
};

// ===================== CAFE MENU =====================
const CafeMenu = () => {
  const { cafeId } = useParams();
  const localStorageKey = `cart_${cafeId}`;

  // State management (keep as is)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(localStorageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Cafeteria information (keep as is)
  const cafeteriaInfo = {
    abay: { name: "Female Launch System (Abay)", hours: "6:00 AM - 9:00 PM", status: "Open" },
    tana: { name: "Male Launch System (Tana)", hours: "6:00 AM - 9:00 PM", status: "Open" },
    guna: { name: "Megenagna (Guna)", hours: "11:00 AM - 9:00 PM", status: "Open" },
    megezez: { name: "Megezez Restaurant", hours: "7:00 AM - 7:00 PM", status: "Closing Soon" },
    marcan: { name: "Marcan Cafeteria", hours: "7:00 AM - 3:00 PM", status: "Closed" }
  };

  // Calculations and effects (keep as is)
  const { totalOrderCount, totalOrderPrice } = useMemo(() => {
    const totalCount = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    return { totalOrderCount: totalCount, totalOrderPrice: totalPrice };
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(cart));
  }, [cart, localStorageKey]);

  // Handlers (keep logic, but update quantity buttons to use icons)
  const handleAddToOrder = useCallback((product) => {
    const currentStock = stock[product.id] || 999;
    const existingItem = cart.find((i) => i.id === product.id);

    if (existingItem?.quantity >= currentStock) {
      return alert(`Only ${currentStock} pieces available for ${product.title}`);
    }

    setCart((prev) =>
      existingItem
        ? prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { ...product, quantity: 1 }]
    );
  }, [cart, stock]);

  const handleRemoveFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const handleUpdateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    
    const product = ALL_PRODUCTS.find(p => p.id === productId);
    const currentStock = stock[productId] || 999;
    if (newQuantity > currentStock) {
        return alert(`Only ${currentStock} pieces available for ${product.title}`);
    }

    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  }, [handleRemoveFromCart, stock]);

  // Categories and filtered products (keep as is)
  const categories = useMemo(() => {
    const cats = ["All", ...new Set(ALL_PRODUCTS.map(p => p.category))];
    return cats;
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return ALL_PRODUCTS;
    return ALL_PRODUCTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  // Menu Card - **Significantly enhanced appearance**
  const MenuCard = ({ product }) => {
    const item = cart.find((i) => i.id === product.id);
    const q = item?.quantity || 0;
    const st = stock[product.id] || 999;
    const isOutOfStock = st === 0;

    return (
      <div className="bg-white rounded-xl shadow-xl p-4 flex flex-col border border-gray-100 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
        <div className="relative">
          <img src={product.url} alt={product.title} className="w-full h-40 object-cover rounded-lg mb-4 opacity-90 transition-opacity duration-300 hover:opacity-100" />
          <div className="absolute top-2 right-2 flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-black bg-opacity-60 text-white">
            <FaTag className="mr-1 text-yellow-400" /> {product.category}
          </div>
        </div>

        <h3 className="text-2xl font-extrabold mb-1 text-center text-gray-800">{product.title}</h3>
        <p className="text-sm text-gray-500 mb-3 text-center min-h-[40px]">{product.description}</p>
        
        <div className="flex justify-between items-center mb-4 border-t pt-3">
          <p className="text-xl font-bold text-red-600">{product.price} ETB</p>
          <p className={`text-sm font-semibold flex items-center ${isOutOfStock ? "text-red-500" : "text-green-500"}`}>
            {isOutOfStock ? <FaTimesCircle className="mr-1" /> : <FaCheckCircle className="mr-1" />}
            {isOutOfStock ? "SOLD OUT" : `Stock: ${st}`}
          </p>
        </div>
        
        {q > 0 ? (
          <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t">
            <button
              onClick={() => handleUpdateQuantity(product.id, q - 1)}
              className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-bold"
            >
              <FaMinus className="inline mr-1" />
            </button>
            <span className="font-extrabold text-xl w-10 text-center text-blue-600">{q}</span>
            <button
              onClick={() => handleUpdateQuantity(product.id, q + 1)}
              className={`flex-1 py-2 text-white rounded-lg transition font-bold ${q >= st ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
              disabled={q >= st}
            >
              <FaPlus className="inline mr-1" />
            </button>
          </div>
        ) : (
          <button
            className={`w-full py-3 rounded-lg font-extrabold text-white transition transform hover:scale-[1.01] mt-auto ${
              isOutOfStock ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md"
            }`}
            disabled={isOutOfStock}
            onClick={() => handleAddToOrder(product)}
          >
            {isOutOfStock ? "SOLD OUT" : "ADD TO CART"}
          </button>
        )}
      </div>
    );
  };

  const currentCafe = cafeteriaInfo[cafeId] || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 relative">
      {/* Header - Bolder look */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl shadow-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold">🍽 {currentCafe.name || "Cafeteria"} Menu</h1>
            <div className="flex items-center gap-4 text-sm mt-3">
              <div className="flex items-center gap-1 font-semibold">
                <FaClock className="text-yellow-300" />
                <span>{currentCafe.hours || "N/A"}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentCafe.status === "Open" ? "bg-green-100 text-green-800" :
                currentCafe.status === "Closing Soon" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {currentCafe.status || "N/A"}
              </div>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md"
          >
            ← Back to Cafeterias
          </button>
        </div>
      </div>

      {/* Category Filter - Improved visual feedback */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Categories</h2>
        <div className="flex gap-3 flex-wrap p-3 bg-white rounded-xl shadow-inner">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition transform hover:scale-105 duration-200 shadow-md ${
                selectedCategory === category
                  ? "bg-red-500 text-white ring-4 ring-red-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <CartCounter count={totalOrderCount} onClick={() => setShowCartModal(true)} />

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((p) => <MenuCard key={p.id} product={p} />)}
      </div>

      {showCartModal && (
        <CartModal
          cart={cart}
          totalAmount={totalOrderPrice}
          totalCount={totalOrderCount}
          onClose={() => setShowCartModal(false)}
          setCart={setCart}
        />
      )}
    </div>
  );
};

export default CafeMenu;