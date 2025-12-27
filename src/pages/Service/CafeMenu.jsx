import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaClock,
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaTruck,
  FaCheck,
  FaStar,
} from "react-icons/fa";

// IMAGE IMPORTS
// import riceImg from "../../assets/images/rice.jpg";
// import beyeImg from "../../assets/images/aynet-food.webp";
// import pastaImg from "../../assets/images/pasta-copy.jpg";
// import chechebsaImg from "../../assets/images/chechebsa.jpg";
// import softDrinkImg from "../../assets/images/leslase-be-hayland.webp";
// import tastyImg from "../../assets/images/tasty-with-yellow.jpg";
// import shiroImg from "../../assets/images/shrowet-copy.jpg";
// import enkulalImg from "../../assets/images/enkulal-firfr.jpg";
// import misrFreshImg from "../../assets/images/misr-be-alcha.webp";
// import misrKeyImg from "../../assets/images/misr-red.jpg";
// import dinichAlchaImg from "../../assets/images/dinch-be-alcha.jpg";
// import firfrKeyImg from "../../assets/images/firfr-be-key.webp";
// import dinichKeyImg from "../../assets/images/dinch-be-key.jpg";

// --- CHAPA CONFIGURATION ---
const CHAPA_PUBLIC_KEY = "CHAPUBK_TEST-LdtvG5g3cwTcrH1dljE9LImH9Cg0mE1R";
// Secret key moved to backend for security


const CONTRACT_OPTIONS = [
  "No Contract (Pay-as-you-go)",
  "Monthly Contract (Prepaid)",
];

const PAYMENT_OPTIONS = ["Cash on Delivery", "CBE", "Telebirr", "Awash Bank", "Dashen Bank", "Chapa"];

const DELIVERY_LOCATIONS = [
  "Student Dorm Block 1",
  "Student Dorm Block 2",
  "Student Dorm Block 3",
  "Admin Building Main Entrance",
  "Library Reading Hall",
  "Faculty Office 1st Floor",
  "Gate 1 Security Post",
];

// ===================== API CONFIG =====================
const API_BASE = "http://localhost/DBU-APII/dbu-api";

// ===================== ORDER SUCCESS MODAL =====================
const OrderSuccessModal = ({ orderSuccess, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 10000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-48 h-48 bg-green-300 rounded-full blur-3xl -translate-x-24 -translate-y-24"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-300 rounded-full blur-3xl translate-x-24 translate-y-24"></div>
        </div>

        <div className="relative z-10">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <FaCheck className="text-4xl text-green-600" />
          </div>

          <h2 className="text-2xl font-extrabold text-gray-800 mb-3">Order Placed Successfully! 🎉</h2>
          <p className="text-base text-gray-600 mb-6">
            {orderSuccess.needsDelivery
              ? `Your food is being delivered to ${orderSuccess.deliveryPlace}`
              : "Your order is ready for pickup at cafeteria!"}
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-base">
              <span>Subtotal:</span>
              <span className="font-semibold">{orderSuccess.subtotal.toFixed(2)} ETB</span>
            </div>
            {orderSuccess.deliveryFee > 0 && (
              <div className="flex justify-between text-base">
                <span>Delivery Fee:</span>
                <span className="font-semibold">{orderSuccess.deliveryFee.toFixed(2)} ETB</span>
              </div>
            )}
            {orderSuccess.wasFreeDelivery && (
              <div className="flex justify-between text-base text-green-600 font-bold">
                <span>Free Delivery Applied!</span>
                
              </div>
            )}
            <div className="flex justify-between text-lg font-extrabold pt-2 border-t">
              <span>Total Paid:</span>
              <span className="text-green-600">{orderSuccess.total.toFixed(2)} ETB</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            Order ID: <span className="font-mono font-bold">{orderSuccess.id}</span>
          </p>

          <button
            onClick={onClose}
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-3 px-8 rounded-lg font-extrabold text-lg transition transform hover:scale-105 shadow-lg"
          >
            Done — Enjoy Your Meal! 🍽️
          </button>

          <p className="text-xs text-gray-400 mt-4">This window will close in 10 seconds</p>
        </div>
      </div>
    </div>
  );
};

// ===================== CART MODAL =====================
const CartModal = ({ cart, subtotal, totalCount, onClose, setCart, handleDecreaseQuantity, cafeId }) => {
  const [contractType, setContractType] = useState("");
  const [deliveryPlace, setDeliveryPlace] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [note, setNote] = useState("");
  const [needsDelivery, setNeedsDelivery] = useState(false);
  const [deliveryGender, setDeliveryGender] = useState("");

  const [orderSuccess, setOrderSuccess] = useState(null);

  const noContractDeliveryFee = 20;
  const monthlyContractDeliveryFee = 10;
  const freeDeliveryThreshold = 200;

  const baseDeliveryFee = needsDelivery
    ? contractType === "No Contract (Pay-as-you-go)"
      ? noContractDeliveryFee
      : contractType === "Monthly Contract (Prepaid)"
        ? monthlyContractDeliveryFee
        : 0
    : 0;

  const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee;
  const totalAmount = subtotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) return;
    if (!contractType) return;
    if (needsDelivery && !deliveryPlace) return;
    if (contractType === "No Contract (Pay-as-you-go)" && !paymentMethod) return;
    if (needsDelivery && !deliveryGender) return;

    const newOrder = {
      id: Date.now(),
      items: cart,
      subtotal,
      deliveryFee,
      total: totalAmount,
      deliveryPlace: needsDelivery ? deliveryPlace : "Pickup at Cafeteria",
      paymentMethod: contractType === "No Contract (Pay-as-you-go)" ? paymentMethod : "Prepaid",
      contractType,
      note,
      needsDelivery,
      deliveryGender: needsDelivery ? deliveryGender : null,
      status: contractType === "No Contract (Pay-as-you-go)" && paymentMethod === "Chapa" ? "Pending Payment" : "Pending",
      date: new Date().toLocaleString(),
    };

    if (paymentMethod === "Chapa") {
      try {
        const tx_ref = `tx-cafe-${Date.now()}`;
        const user = JSON.parse(sessionStorage.getItem("currentUser")) || { email: "guest@dbu.edu", fullName: "Guest User" };
        const return_url = `${window.location.origin}/cafe-menu/${cafeId || 'abay'}?status=success&tx_ref=${tx_ref}`;

        // Save pending order
        sessionStorage.setItem("pendingCafeOrder", JSON.stringify({ ...newOrder, tx_ref }));

        const chapaPayload = {
          amount: totalAmount,
          currency: "ETB",
          email: user.email,
          first_name: user.fullName.split(" ")[0] || "User",
          last_name: user.fullName.split(" ")[1] || "DBU",
          tx_ref: tx_ref,
          callback_url: "https://api.chapa.co/v1/transaction/verify/" + tx_ref,
          return_url: return_url,
          customization: {
            title: "DBU Food Order",
            description: "Payment for food order",
          },
        };

        const response = await axios.post(`${API_BASE}/initialize_chapa.php`, chapaPayload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = response.data;

        if (data.status === "success" && data.data && data.data.checkout_url) {
          window.location.href = data.data.checkout_url;
        } else {
          alert("Failed to initialize Chapa payment: " + (data.message || JSON.stringify(data)));
        }
      } catch (err) {
        console.error("Chapa Error:", err);
        alert(`Error connecting to Chapa: ${err.message || "Unknown error"}`);
      }
      return;
    }

    // For non-Chapa orders, verify and save via props or direct call (handled in CafeMenu logic)
    // But since we are inside CartModal, we might need to bubble up or handle it here.
    // The previous logic bubbled it up or handled it here?
    // Let's defer to the parent or handle it if we can. 
    // Wait, the new logic had `saveOrderToBackend` in `CafeMenu`.
    // We should probably just call a prop `onOrderSubmit` or similar, but to keep it simple and consistent with previous working code:

    // We can't easily call `saveOrderToBackend` from here if it's defined in CafeMenu.
    // Let's hack it: we will pass the order to a callback or just do the fetch here if possible?
    // Best practice: The CartModal shouldn't worry about backend implementation ideally, but for speed:
    // We will assume the parent passed a handler or we access API directly.
    // Actually, in the broken code `handleSubmit` was inside `CartModal`.
    // And `saveOrderToBackend` was in `CafeMenu`.
    // I should pass `onPlaceOrder` prop to `CartModal`.

    // ... Revisiting the architecture ...
    // The user's specific request "cafeteriapromotion is not defined" implies the structure is what matters.
    // I will pass `onSubmitOrder` from CafeMenu to CartModal.

    onClose(newOrder); // Pass the order back to parent to handle saving 
  };

  // SUCCESS SCREEN
  if (orderSuccess) {
    return <OrderSuccessModal orderSuccess={orderSuccess} onClose={onClose} />;
  }

  // NORMAL CHECKOUT - Reduced size
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-4 relative flex flex-col md:flex-row gap-4">
        {/* Cart Summary */}
        <div className="flex-1 bg-gray-100 p-4 rounded-lg flex flex-col gap-3 border-2 border-green-200">
          <h2 className="text-lg font-extrabold text-center text-gray-800 border-b pb-2">🛒 Order Details</h2>
          <div className="overflow-y-auto max-h-60 pr-2">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center mt-6">Your cart is empty! Add some delicious food.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm mb-2 transition hover:shadow-md">
                  <img src={item.url} alt={item.title} className="w-10 h-10 object-cover rounded-md mr-2" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                  <p className="font-semibold text-green-600 mr-2 text-sm">{item.quantity} × {item.price} ETB</p>
                  <div className="font-extrabold text-base text-blue-700">{(item.quantity * item.price).toFixed(2)}</div>
                  <button onClick={() => handleDecreaseQuantity(item.id)} className="ml-2 text-red-600 hover:text-red-800 transition text-lg font-bold">
                    <FaTimes />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-3 space-y-1">
            <div className="flex justify-between text-base">
              <span className="font-semibold">Subtotal:</span>
              <span>{subtotal.toFixed(2)} ETB</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-base text-orange-600">
                <span className="font-semibold flex items-center gap-2"><FaTruck /> Delivery Fee:</span>
                <span className="font-bold">{deliveryFee.toFixed(2)} ETB</span>
              </div>
            )}
            {subtotal >= freeDeliveryThreshold && needsDelivery && baseDeliveryFee > 0 && (
              <div className="flex justify-between text-base text-green-600">
                <span className="font-semibold">Free Delivery Applied! 🎉</span>

              </div>
            )}
            <div className="flex justify-between text-lg font-extrabold border-t pt-2">
              <span>Total:</span>
              <span className="text-red-600">{totalAmount.toFixed(2)} ETB</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
          <h2 className="text-lg font-extrabold text-center text-gray-800 border-b pb-2">Complete Checkout</h2>

          <select
            value={contractType}
            onChange={(e) => {
              setContractType(e.target.value);
              setPaymentMethod("");
            }}
            required
            className="border-2 border-gray-300 p-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-sm"
          >
            <option value="" disabled>Select Contract Type 📜</option>
            {CONTRACT_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {contractType === "No Contract (Pay-as-you-go)" && (
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              className="border-2 border-gray-300 p-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-sm"
            >
              <option value="" disabled>Select Payment Method 💳</option>
              {PAYMENT_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}

          {/* Delivery Checkbox */}
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="needsDelivery"
              checked={needsDelivery}
              onChange={(e) => setNeedsDelivery(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="needsDelivery" className="text-sm font-medium text-gray-800 flex items-center gap-2 cursor-pointer">
              <FaTruck className="text-blue-400 text-sm" />
              Deliver to my location {subtotal >= freeDeliveryThreshold ? "(FREE! 🎉)" : "(extra fee applies)"}
            </label>
          </div>

          {/* Delivery Location - Only if delivery requested */}
          {needsDelivery && (
            <select
              value={deliveryPlace}
              onChange={(e) => setDeliveryPlace(e.target.value)}
              required
              className="border-2 border-gray-300 p-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-sm"
            >
              <option value="" disabled>Select Delivery Location 📍</option>
              {DELIVERY_LOCATIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          {/* Gender Preference - Only if delivery requested */}
          {needsDelivery && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
              <p className="text-sm font-semibold mb-2 text-gray-800">Preferred delivery person gender:</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryGender"
                    value="Female"
                    checked={deliveryGender === "Female"}
                    onChange={(e) => setDeliveryGender(e.target.value)}
                    className="w-4 h-4 text-pink-600"
                    required
                  />
                  <span className="text-gray-700 font-medium text-sm">Female</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryGender"
                    value="Male"
                    checked={deliveryGender === "Male"}
                    onChange={(e) => setDeliveryGender(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                    required
                  />
                  <span className="text-gray-700 font-medium text-sm">Male</span>
                </label>
              </div>
            </div>
          )}

          <textarea
            rows="2"
            placeholder="Special note (e.g., 'no onions', 'leave at door')"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border-2 border-gray-300 p-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-sm"
          />

          <button
            type="submit"
            disabled={cart.length === 0}
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-3 rounded-lg font-extrabold text-lg transition transform hover:scale-[1.02] shadow-lg mt-auto disabled:bg-gray-400"
          >
            Confirm & Place Order ({totalAmount.toFixed(2)} ETB)
          </button>
        </form>

        <button
          onClick={() => onClose(null)}
          className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-red-500 transition transform hover:rotate-90"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

// ===================== CART COUNTER =====================
const CartCounter = ({ count, onClick }) => {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onClick}
        className="bg-blue-600 text-white p-4 rounded-full font-bold cursor-pointer hover:bg-blue-700 transition transform hover:scale-110 shadow-xl flex items-center gap-2"
      >
        <FaShoppingCart className="text-xl" />
        <span className="text-lg hidden sm:inline">View Cart:</span>{" "}
        <span className="bg-red-500 rounded-full px-3 py-1">{count}</span>
      </button>
    </div>
  );
};

// ===================== CAFETERIA PROMOTION COMPONENT =====================
const CafeteriaPromotion = ({ promotionData }) => {
  const {
    title,
    subtitle,
    benefits,
    bgColorFrom,
    bgColorTo,
    iconColor,
    specialOffer
  } = promotionData;

  return (
    <div className={`bg-gradient-to-r ${bgColorFrom} ${bgColorTo} text-white rounded-xl shadow-2xl p-6 mb-8`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold mb-2">{title}</h2>
          <p className="text-lg mb-4">{subtitle}</p>
          <ul className="list-disc list-inside space-y-1">
            {benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
          {specialOffer && (
            <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg inline-block">
              <p className="font-bold">{specialOffer}</p>
            </div>
          )}
        </div>
        <div className="bg-white text-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">Credit</p>
          <p className="text-4xl font-extrabold">Special</p>
        </div>
      </div>
    </div>
  );
};

// ===================== CAFE MENU =====================
const CafeMenu = () => {
  const { cafeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const localStorageKey = `cart_${cafeId}`;

  const [successModalOrder, setSuccessModalOrder] = useState(null);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error parsing cart from localStorage:", error);
      return [];
    }
  });

  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState({});
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Menu Items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // We need to map cafeId to the backend location string
        // The cafeteriaInfo object (defined below) has the names, but we might need a helper
        const cafeNames = {
          "abay": "Female Launch System (Abay)",
          "tana": "Male Launch System (Tana)",
          "guna": "Megenagna (Guna)",
          "megezez": "Megezez Restaurant",
          "marcan": "Marcan Cafeteria"
        };
        const locationName = cafeNames[cafeId];

        if (locationName) {
          const res = await axios.get(`${API_BASE}/get_menu_items.php?location=${encodeURIComponent(locationName)}`);
          if (res.data.success) {
            setProducts(res.data.items);
            // Stock is now coming from backend
            const stockMap = {};
            res.data.items.forEach(item => {
              stockMap[item.id] = item.stock;
            });
            setStock(stockMap);
          }
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, [cafeId]);

  // Verify Chapa
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const txRef = query.get("tx_ref");
    const status = query.get("status");

    if (txRef && status === "success") {
      // Retrieve pending order
      const pendingOrderStr = sessionStorage.getItem("pendingCafeOrder");
      if (pendingOrderStr) {
        const pendingOrder = JSON.parse(pendingOrderStr);
        if (pendingOrder.tx_ref === txRef) {
          // Verify with API
          verifyChapaTransaction(txRef, pendingOrder);
        }
      }
    }
  }, [location]);

  const verifyChapaTransaction = async (txRef, pendingOrder) => {
    try {
      const verifyRes = await fetch(`${API_BASE}/verify_chapa.php?tx_ref=${txRef}`, {
        method: "GET",
      });
      const verifyData = await verifyRes.json();
      if (verifyData.status === "success") {

        // Finalize order via Backend API
        const finalOrder = { ...pendingOrder, status: "Paid" };

        // We need to ensure we save it to the backend too
        await saveOrderToBackend(finalOrder);

        // Clear pending and cart
        sessionStorage.removeItem("pendingCafeOrder");
        localStorage.setItem(localStorageKey, "[]"); // Clear cafe specific cart
        setCart([]);

        // Show Success
        setSuccessModalOrder({
          ...finalOrder,
          wasFreeDelivery: finalOrder.subtotal >= 200 && finalOrder.needsDelivery && (finalOrder.deliveryFee === 0), // recalc logic approx
          savedBaseDeliveryFee: 20 // approx
        });

        // Clean URL
        window.history.replaceState(null, "", location.pathname);
      }
    } catch (err) {
      console.error("Verification Error:", err);
      alert("Payment verification failed. Please check your orders.");
    }
  };

  // Store cafeId in sessionStorage when component loads
  useEffect(() => {
    if (cafeId) {
      sessionStorage.setItem("currentCafeId", cafeId);
      console.log("Stored cafeId in sessionStorage:", cafeId);
    }
  }, [cafeId]);
const saveOrderToBackend = async (orderData) => {
  try {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser || !currentUser.email) {
      alert("Please log in to place an order");
      navigate("/login");
      return;
    }

    // Get cafe location name
    const cafeNames = {
      "abay": "Female Launch System (Abay)",
      "tana": "Male Launch System (Tana)",
      "guna": "Megenagna (Guna)",
      "megezez": "Megezez Restaurant",
      "marcan": "Marcan Cafeteria"
    };
    let currentCafeId = cafeId || sessionStorage.getItem("currentCafeId");
    if (!currentCafeId) {
      const urlParts = window.location.pathname.split('/');
      currentCafeId = urlParts[urlParts.length - 1];
    }
    const locationName = cafeNames[currentCafeId] || "Female Launch System (Abay)";

    // CRITICAL: Match your current orders table exactly
    const payload = {
      id: orderData.id,                                    // → goes to `id` column (PK)
      userEmail: currentUser.email,
      items: orderData.items.map(item => ({
        id: item.id,
        name: item.title,                                  // → important: send 'name' for order_items
        price: item.price,
        quantity: item.quantity
      })),
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      total: orderData.total,
      location: locationName,
      deliveryPlace: orderData.deliveryPlace,
      paymentMethod: orderData.paymentMethod,
      contractType: orderData.contractType,
      note: orderData.note || "",
      needsDelivery: orderData.needsDelivery,
      deliveryGender: orderData.deliveryGender,
      status: orderData.status || "Pending"
      // paid and delivered will be 0 by default
    };

    console.log("Saving order payload:", payload); // DEBUG

    const response = await axios.post(`${API_BASE}/place_order.php`, payload);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to save order");
    }

    console.log("Order saved:", response.data);

  } catch (err) {
    console.error("Save order error:", err);
    console.error("Response:", err.response?.data);
    alert("Error saving order: " + (err.response?.data?.message || err.message));
    throw err;
  }
};
  const cafeteriaInfo = {
    abay: {
      name: "Female Launch",
      description: "Serving all-day meals for female students. Located in the women's dorm area.",
      hours: "7:00 AM - 9:00 PM",
      status: "Open",
      promoteCredit: true,
      promotionData: {
        title: "🌟 Female Launch Credit Special 🌟",
        subtitle: "Get exclusive credit benefits when you order from Female Launch!",
        benefits: [
          "10% bonus credit on all deposits",
          "Priority delivery service",
          "Special menu items available only with credit"
        ],
        bgColorFrom: "from-pink-500",
        bgColorTo: "to-purple-600",
        iconColor: "text-purple-700",
        specialOffer: "Free delivery on orders above 150 ETB with credit payment!"
      }
    },
    tana: {
      name: "Male Launch",
      description: "Traditional Ethiopian cuisine and quick service for male students. Located in the men's dorm area with a focus on hearty meals.",
      hours: "7:00 AM - 9:00 PM",
      status: "Open",
      promoteCredit: true,
      promotionData: {
        title: "🔥 Male Launch Credit Deals 🔥",
        subtitle: "Maximize your value with our credit system at Male Launch!",
        benefits: [
          "15% bonus credit on deposits over 200 ETB",
          "Express meal preparation for credit users",
          "Exclusive access to protein-rich special meals"
        ],
        bgColorFrom: "from-blue-500",
        bgColorTo: "to-indigo-600",
        iconColor: "text-indigo-700",
        specialOffer: "Buy 5 meals with credit, get the 6th free!"
      }
    },
    guna: {
      name: "Megenagna",
      description: "The main campus hub for lunch and dinner. Variety of international options located at the center of campus.",
      hours: "11:00 AM - 9:00 PM",
      status: "Open",
      promoteCredit: true,
      promotionData: {
        title: "🌍 Megenagna Global Credit 🌍",
        subtitle: "Explore international flavors with credit rewards at Megenagna!",
        benefits: [
          "Loyalty points with every credit purchase",
          "Weekly international food festival access",
          "Combo meal discounts with credit payment"
        ],
        bgColorFrom: "from-green-500",
        bgColorTo: "to-teal-600",
        iconColor: "text-teal-700",
        specialOffer: "Double credit points on Fridays!"
      }
    },
    megezez: {
      name: "Megezez Restaurant",
      description: "Quick lunch and coffee spot located within the academic building. Perfect for busy students between classes.",
      hours: "8:00 AM - 6:00 PM",
      status: "Open",
      promoteCredit: true,
      promotionData: {
        title: "⚡ Megezez Quick Credit ⚡",
        subtitle: "Speed up your day with credit benefits at Megezez!",
        benefits: [
          "Skip-the-line priority service",
          "Free coffee refills with credit payment",
          "Study room access with credit purchases over 100 ETB"
        ],
        bgColorFrom: "from-orange-500",
        bgColorTo: "to-red-600",
        iconColor: "text-red-700",
        specialOffer: "Breakfast combo: 30% off with credit before 9 AM!"
      }
    },
    marcan: {
      name: "Marcan Cafeteria",
      description: "Healthy breakfast and lunch near the sports facilities. Focus on nutritious meals for active students.",
      hours: "7:00 AM - 2:00 PM",
      status: "Open",
      promoteCredit: true,
      promotionData: {
        title: "💪 Marcan Health Credit 💪",
        subtitle: "Fuel your active lifestyle with credit rewards at Marcan!",
        benefits: [
          "Nutritional consultation with credit purchases",
          "Sports drink free with every healthy meal",
          "Fitness tracker points integration"
        ],
        bgColorFrom: "from-yellow-500",
        bgColorTo: "to-orange-600",
        iconColor: "text-orange-700",
        specialOffer: "Buy a healthy meal plan with credit and get 20% extra credit!"
      }
    }
  };

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const totalOrderCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart, localStorageKey]);

  const handleAddToOrder = useCallback((product) => {
    const currentStock = stock[product.id] || 0;
    const existingItem = cart.find((i) => i.id === product.id);
    if (existingItem?.quantity >= currentStock) return alert(`Only ${currentStock} pieces available for ${product.title}`);
    setCart((prev) =>
      existingItem
        ? prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { ...product, quantity: 1 }]
    );
  }, [cart, stock]);

  const handleDecreaseQuantity = useCallback((productId) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const handleUpdateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) return handleDecreaseQuantity(productId);
    const currentStock = stock[productId] || 0;
    if (newQuantity > currentStock) return alert(`Only ${currentStock} pieces available`);
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  }, [handleDecreaseQuantity, stock]);

  // Handle order submission from CartModal
  const handlePlaceOrder = async (orderData) => {
    // This is called when CartModal submits a non-Chapa order
    if (!orderData) {
      setShowCartModal(false);
      return;
    }

    try {
      // Save to backend first
      await saveOrderToBackend(orderData);

      // Update local storage for order history (optional, for offline access)
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      localStorage.setItem("orders", JSON.stringify([...orders, orderData]));

      // Show success modal
      setSuccessModalOrder({
        ...orderData,
        wasFreeDelivery: orderData.subtotal >= 200 && orderData.needsDelivery && (orderData.deliveryFee === 0),
        savedBaseDeliveryFee: 20
      });

      // Clear cart
      setCart([]);
      setShowCartModal(false);

    } catch (error) {
      console.error("Error placing order:", error);
      // Error alert is already shown in saveOrderToBackend
    }
  };

  // Fixed categories as requested
  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Drinks"];
  // Use products instead of ALL_PRODUCTS for filtering
  const filteredProducts = useMemo(() => {
    return (selectedCategory === "All"
      ? products
      : products.filter((p) => {
        // Robust filtering: normalize everything to lower case and trim
        const itemCat = (p.category || "").toString().toLowerCase().trim();
        const targetCat = selectedCategory.toLowerCase().trim();
        return itemCat === targetCat;
      })
    ).filter(p => !p.hidden);
  }, [selectedCategory, products]);

  const MenuCard = ({ product }) => {
    const item = cart.find((i) => i.id === product.id);
    const q = item?.quantity || 0;
    const st = stock[product.id] || 0;
    const isOutOfStock = st === 0;

    return (
      <div className="bg-white rounded-xl shadow-xl p-4 flex flex-col border border-gray-100 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
        <div className="relative">
          <img
            src={product.url}
            alt={product.title}
            className="w-full h-40 object-cover rounded-lg mb-4 opacity-90 transition-opacity duration-300 hover:opacity-100"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/300x200?text=Food+Image";
            }}
          />
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
            <button onClick={() => handleUpdateQuantity(product.id, q - 1)} className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-bold">
              <FaMinus className="inline mr-1" />
            </button>
            <span className="font-extrabold text-xl w-10 text-center text-blue-600">{q}</span>
            <button onClick={() => handleUpdateQuantity(product.id, q + 1)} className={`flex-1 py-2 text-white rounded-lg transition font-bold ${q >= st ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`} disabled={q >= st}>
              <FaPlus className="inline mr-1" />
            </button>
          </div>
        ) : (
          <button onClick={() => handleAddToOrder(product)} disabled={isOutOfStock} className={`w-full py-3 rounded-lg font-extrabold text-white transition transform hover:scale-[1.01] mt-auto ${isOutOfStock ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md"}`}>
            {isOutOfStock ? "SOLD OUT" : "ADD TO CART"}
          </button>
        )}
      </div>
    );
  };

  const currentCafe = cafeteriaInfo[cafeId] || {};

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Show error if cafeId is not found
  if (!cafeId || !cafeteriaInfo[cafeId]) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Cafeteria Not Found</h2>
          <p className="text-gray-600 mb-6">The cafeteria you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 relative">
      {/* Add the promotion component if applicable */}
      {currentCafe.promoteCredit && <CafeteriaPromotion promotionData={currentCafe.promotionData} />}

      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl shadow-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold">🍽 {currentCafe.name || "Cafeteria"} Menu</h1>
            <p className="text-lg mt-2 opacity-90">{currentCafe.description}</p>
            <div className="flex items-center gap-4 text-sm mt-3">
              <div className="flex items-center gap-1 font-semibold">
                <FaClock className="text-yellow-300" />
                <span>Hours: {currentCafe.hours}</span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold ${currentCafe.status === "Open"
                  ? "bg-green-100 text-green-800"
                  : currentCafe.status === "Closing Soon"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                  }`}
              >
                {currentCafe.status || "N/A"}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Categories</h2>
        <div className="flex gap-3 flex-wrap p-3 bg-white rounded-xl shadow-inner">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition transform hover:scale-105 duration-200 shadow-md ${selectedCategory === category
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <MenuCard key={p.id} product={p} />
        ))}
      </div>

      {showCartModal && (
        <CartModal
          cart={cart}
          subtotal={subtotal}
          totalCount={totalOrderCount}
          onClose={handlePlaceOrder}
          setCart={setCart}
          handleDecreaseQuantity={handleDecreaseQuantity}
          cafeId={cafeId}
        />
      )}

      {successModalOrder && (
        <OrderSuccessModal
          orderSuccess={successModalOrder}
          onClose={() => setSuccessModalOrder(null)}
        />
      )}
    </div>
  );
};

export default CafeMenu;