import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Wallet,
  LogOut,
  DollarSign,
  Search,
  List,
  Utensils,
  MessageSquare,
  X,
  CreditCard,
  Star,
  ShoppingCart,
  Plus
} from "lucide-react";
import { jsPDF } from "jspdf";

// --- API CONFIG ---
const API_BASE = "http://localhost/DBU-APII/dbu-api";

// --- CHAPA CONFIGURATION ---
const CHAPA_PUBLIC_KEY = "CHAPUBK_TEST-LdtvG5g3cwTcrH1dljE9LImH9Cg0mE1R";
// Secret key removed from frontend for security

// ---------------- Sidebar Component ----------------
function Sidebar({ activeTab, setActiveTab, handleLogout }) {
  return (
    <div className="fixed top-20 left-0 h-full w-64 bg-gradient-to-b from-amber-900 to-amber-700 text-white p-6 flex flex-col shadow-2xl">
      <h1 className="text-2xl font-bold mb-8 text-amber-100" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
        DBU Lunch Dashboard
      </h1>
      <nav className="flex flex-col gap-2 flex-grow">
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${activeTab === "menu"
            ? "bg-amber-600 border-l-4 border-white shadow-md pl-8"
            : "hover:bg-amber-600 hover:translate-x-2 hover:shadow-md"
            }`}
        >
          <Utensils className="h-5 w-5" /> Order Lunch
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${activeTab === "orders"
            ? "bg-amber-600 border-l-4 border-white shadow-md pl-8"
            : "hover:bg-amber-600 hover:translate-x-2 hover:shadow-md"
            }`}
        >
          <List className="h-5 w-5" /> My Lunch Orders
        </button>
        <button
          onClick={() => setActiveTab("feedback")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${activeTab === "feedback"
            ? "bg-amber-600 border-l-4 border-white shadow-md pl-8"
            : "hover:bg-amber-600 hover:translate-x-2 hover:shadow-md"
            }`}
        >
          <MessageSquare className="h-5 w-5" /> Feedback
        </button>
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 hover:shadow-lg transition-all duration-200 ease-in-out mt-auto"
      >
        <LogOut className="h-5 w-5" /> Logout
      </button>
    </div>
  );
}

// ---------------- Header Component ----------------
function Header({ currentUser, userBalance, setShowAddBalanceModal, selectedCafeteria, setSelectedCafeteria }) {
  // Map of Cafeteria IDs to Names
  const cafeteriaOptions = [
    { id: "abay", name: "Female Launch (Abay)" },
    { id: "tana", name: "Male Launch (Tana)" },
    { id: "guna", name: "Megenagna" },
    { id: "megezez", name: "Megezez (Academic)" },
    { id: "marcan", name: "Marcan" }
  ];

  const handleCafeteriaChange = (e) => {
    const newCafeId = e.target.value;
    setSelectedCafeteria(newCafeId);
    sessionStorage.setItem("selectedCafeteria", newCafeId);
  };

  return (
    <header className="fixed left-64 right-0 top-20 bg-white shadow-md p-6 z-10 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-semibold text-amber-800">
          Welcome, {currentUser?.fullName || 'User'}
        </h2>

        {/* Cafeteria Selector */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-500">Current Location:</span>
          <select
            value={selectedCafeteria}
            onChange={handleCafeteriaChange}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-1 bg-amber-50 text-amber-900 font-medium cursor-pointer"
          >
            {cafeteriaOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Balance Display */}
        <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full">
          <Wallet className="h-5 w-5 text-amber-700" />
          <span className="font-bold">ETB {userBalance.toFixed(2)}</span>
        </div>

        {/* Add Balance Button */}
        <button
          onClick={() => setShowAddBalanceModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <DollarSign className="h-5 w-5" /> Add Balance
        </button>

        <span className="text-gray-600">Role: {currentUser?.role || 'User'}</span>
      </div>
    </header>
  );
}

// ---------------- Add Balance Modal ----------------
function AddBalanceModal({
  showAddBalanceModal,
  setShowAddBalanceModal,
  balanceAmount,
  setBalanceAmount,
  paymentMethod,
  setPaymentMethod,
  handleAddBalance,
  currentUser,
  agreeToTerms,
  setAgreeToTerms
}) {
  if (!showAddBalanceModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[70vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Add Balance</h3>
          <button
            onClick={() => setShowAddBalanceModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          {/* Current user info display */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Adding balance to:</p>
            <p className="font-medium">{currentUser?.fullName || 'User'}</p>
            <p className="text-sm text-gray-500">{currentUser?.email || 'user@example.com'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETB)</label>
            <input
              type="number"
              placeholder="Enter amount (minimum 300 ETB)"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              className="w-full p-2 border rounded-lg"
              min="300"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum contract amount is 300 ETB</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Payment Method</option>
              <option value="Telebirr">Telebirr</option>
              {/* Added Chapa option */}
              <option value="Chapa">Chapa</option>
              <option value="Mobile Banking">Mobile Banking</option>
              <option value="Other Banks">Other Banks</option>
            </select>
          </div>

          {/* Contract Terms Section */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Contract Terms</h4>
            <div className="bg-gray-50 p-3 rounded-lg mb-3 text-sm text-gray-600">
              <p className="mb-2">By adding balance to your account, you agree to the following terms:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Minimum contract amount is 300 ETB</li>
                <li>Balances are non-refundable</li>
                <li>Balances can only be used for purchasing food items</li>
                <li>Account balances do not expire</li>
                <li>DBU reserves the right to modify terms with prior notice</li>
              </ul>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 mr-2"
              />
              <label htmlFor="agreeToTerms" className="text-sm">
                I agree to the contract terms and conditions
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowAddBalanceModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddBalance}
              disabled={!agreeToTerms}
              className={`flex-1 py-2 rounded-lg transition ${!agreeToTerms
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
            >
              Add Balance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Menu Section ----------------
function MenuSection({ navigateToCafeMenu, getCafeteriaName }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center py-12">
        <Utensils className="h-24 w-24 text-amber-500 mx-auto mb-6" />
        <h3 className="text-2xl font-bold mb-4">Ready to Order?</h3>
        <p className="text-gray-600 mb-6">
          Browse our full menu and place your order from your selected cafeteria.
        </p>
        <button
          onClick={navigateToCafeMenu}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition flex items-center gap-2 mx-auto text-lg font-semibold shadow-lg"
        >
          <Plus className="h-6 w-6" /> View Menu & Place Order at {getCafeteriaName()}
        </button>
      </div>
    </div>
  );
}

// ---------------- Orders Section ----------------
function OrdersSection({ lunchOrders, searchTerm, setSearchTerm, orderFilter, setOrderFilter, currentUser }) {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-blue-100 text-blue-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      case "Delivered": return "bg-green-100 text-green-800";
      case "Paid": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "Pending": return "Order received, waiting for preparation";
      case "Completed": return "Order prepared and ready";
      case "Delivered": return "Order delivered to you";
      case "Paid": return "Payment confirmed, order processing";
      case "Cancelled": return "Order was cancelled";
      default: return status;
    }
  };

  const filteredOrders = lunchOrders.filter(order => {
    const term = searchTerm.toLowerCase();
    const dateMatch = (order.date || "").toLowerCase().includes(term);
    const itemMatch = (order.item || "").toLowerCase().includes(term);
    const locationMatch = (order.location || "").toLowerCase().includes(term);
    const totalMatch = order.price.toString().includes(term);

    return (searchTerm === "" || dateMatch || itemMatch || locationMatch || totalMatch) &&
      (orderFilter === "all" || order.status === orderFilter);
  });

  const todayString = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentYear = new Date().toISOString().slice(0, 4);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-xl font-bold mb-6">My Lunch Orders</h3>

      {/* Status Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2 text-sm">Order Status Guide:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">Pending</span>
            <span className="text-gray-600">Being prepared</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">Completed</span>
            <span className="text-gray-600">Ready for pickup</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">Delivered</span>
            <span className="text-gray-600">Received</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">Paid</span>
            <span className="text-gray-600">Payment confirmed</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search by date/item/cafeteria/amount..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 p-3 border rounded-lg" />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>}
          </div>
          <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="p-3 border rounded-lg min-w-[150px]">
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Delivered">Delivered</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSearchTerm(todayString)} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200">📅 Today</button>
          <button onClick={() => setSearchTerm(currentMonth)} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200">📊 This Month</button>
          <button onClick={() => setSearchTerm(currentYear)} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200">📈 This Year</button>
          <button onClick={() => setSearchTerm('')} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200">🔄 All Orders</button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-amber-50">
            <tr>
              <th className="p-4 text-left font-semibold">Date</th>
              <th className="p-4 text-left font-semibold">Cafeteria</th>
              <th className="p-4 text-left font-semibold">Items</th>
              <th className="p-4 text-left font-semibold">Total</th>
              <th className="p-4 text-left font-semibold">Payment</th>
              <th className="p-4 text-left font-semibold">Status</th>
              <th className="p-4 text-left font-semibold">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, i) => {
              const isExpanded = expandedOrder === order.id;
              const hasMultipleItems = order.full_items && order.full_items.length > 1;

              return (
                <React.Fragment key={i}>
                  <tr className="border-b hover:bg-amber-50 transition">
                    <td className="p-4">{order.date}</td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-gray-700">{order.location || "N/A"}</span>
                    </td>
                    <td className="p-4">
                      {hasMultipleItems ? (
                        <div>
                          <span className="font-medium">{order.full_items[0].name}</span>
                          <span className="text-gray-500 text-sm"> +{order.full_items.length - 1} more</span>
                        </div>
                      ) : (
                        <span className="font-medium">{order.item}</span>
                      )}
                    </td>
                    <td className="p-4 font-medium">{order.price.toFixed(2)} ETB</td>
                    <td className="p-4">{order.paymentMethod}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`} title={getStatusDescription(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {hasMultipleItems && (
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {isExpanded ? "Hide" : "Show"} Items
                        </button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && hasMultipleItems && (
                    <tr className="bg-gray-50">
                      <td colSpan="7" className="p-4">
                        <div className="ml-8">
                          <h5 className="font-semibold mb-2">Order Items:</h5>
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="p-2 text-left">Item</th>
                                <th className="p-2 text-left">Quantity</th>
                                <th className="p-2 text-left">Price</th>
                                <th className="p-2 text-left">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.full_items.map((item, idx) => (
                                <tr key={idx} className="border-b">
                                  <td className="p-2">{item.name}</td>
                                  <td className="p-2">{item.quantity}</td>
                                  <td className="p-2">{item.price.toFixed(2)} ETB</td>
                                  <td className="p-2 font-medium">{(item.price * item.quantity).toFixed(2)} ETB</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {filteredOrders.length === 0 && <div className="text-center py-8 text-gray-500">{searchTerm ? `No orders found matching "${searchTerm}"` : "No orders found"}</div>}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
        <span className="font-semibold text-lg">Overall Total:</span>
        <span className="font-bold text-xl text-amber-700">
          ETB {lunchOrders.reduce((total, order) => total + (order.price), 0).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ---------------- Feedback Section ----------------
function FeedbackSection({ feedbacks, newFeedback, setNewFeedback, handleSubmitFeedback, currentUser }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-xl font-bold mb-6">Feedback</h3>
      <div className="mb-8 p-6 bg-amber-50 rounded-lg">
        <h4 className="font-semibold mb-4">Submit Your Feedback</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setNewFeedback({ ...newFeedback, rating: star })} className={`text-2xl ${star <= newFeedback.rating ? 'text-amber-500' : 'text-gray-300'}`}>★</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback</label>
            <textarea value={newFeedback.comment} onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })} className="w-full p-3 border rounded-lg" rows="3" placeholder="Share your experience" />
          </div>
          <button onClick={handleSubmitFeedback} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition">Submit Feedback</button>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-4">Recent Feedback</h4>
        <div className="space-y-4">
          {feedbacks.map((feedback, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{feedback.userName}</p>
                  <p className="text-sm text-gray-500">{feedback.date}</p>
                </div>
                <div className="flex">{[1, 2, 3, 4, 5].map(star => <span key={star} className={`text-lg ${star <= feedback.rating ? 'text-amber-500' : 'text-gray-300'}`}>★</span>)}</div>
              </div>
              <p className="text-gray-700">{feedback.comment}</p>
            </div>
          ))}
          {feedbacks.length === 0 && <p className="text-center py-6 text-gray-500">No feedback found</p>}
        </div>
      </div>
    </div>
  );
}

// ---------------- Main Dashboard Component ----------------
function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [lunchOrders, setLunchOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("orders");
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ rating: 0, comment: "" });

  const [selectedCafeteria, setSelectedCafeteria] = useState("abay");

  // Load user
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!user) navigate("/login");
    else {
      setCurrentUser(user);
      const storedCafe = sessionStorage.getItem("selectedCafeteria");
      if (storedCafe) setSelectedCafeteria(storedCafe);
    }
  }, [navigate]);

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    try {
      console.log("Fetching orders for user email:", currentUser.email); // DEBUG
      // FIX: Use UPPERCASE DBU-API to match backend folder name
      const res = await axios.get(`${API_BASE}/get_dashboard_data.php?email=${currentUser.email}`);
      console.log("Dashboard API response:", res.data); // DEBUG
      if (res.data.success) {
        setLunchOrders(res.data.orders || []);
        setUserBalance(parseFloat(res.data.balance) || 0);
      }

      const menuRes = await axios.get(`${API_BASE}/get_menu_items.php`);
      if (menuRes.data.success) setMenuItems(menuRes.data.items || []);

      const feedbackRes = await axios.get(`${API_BASE}/get_feedbacks.php?email=${currentUser.email}`);
      if (feedbackRes.data.success) setFeedbacks(feedbackRes.data.feedbacks || []);
    } catch (err) { console.error("Fetch Data Error:", err); }
  }, [currentUser]);

  useEffect(() => { if (currentUser) fetchData(); }, [currentUser, fetchData]);

  // Verify Chapa Transaction on Return
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const txRef = query.get("tx_ref");

    if (txRef && currentUser) {
      // Clean URL immediately to prevent multiple verifications
      window.history.replaceState(null, "", location.pathname);
      verifyChapaTransaction(txRef);
    }
  }, [location, currentUser]);

  const verifyChapaTransaction = async (txRef) => {
    try {
      // Use new backend verification endpoint!
      const verifyRes = await fetch(`${API_BASE}/verify_chapa.php?tx_ref=${txRef}`, {
        method: "GET",
      });
      const verifyData = await verifyRes.json();

      if (verifyData.status === "success") {
        const amount = verifyData.data.amount;

        await axios.post(`${API_BASE}/add_balance.php`, {
          email: currentUser.email,
          amount: amount,
          paymentMethod: "Chapa",
          agreedToTerms: true,
        });

        alert(`Payment Successful! Added ${amount} ETB to your balance.`);
        fetchData();
      } else {
        alert("Payment verification failed.");
      }
    } catch (err) {
      console.error("Verification Error:", err);
      alert("Error verifying payment.");
    }
  };

  const handleLogout = () => { sessionStorage.removeItem("currentUser"); navigate("/login"); };

  const navigateToCafeMenu = () => {
    navigate(`/cafe-menu/${selectedCafeteria}`);
  };

  const getCafeteriaName = () => {
    const cafeteriaNames = {
      "abay": "Female Launch",
      "tana": "Male Launch",
      "guna": "Megenagna",
      "megezez": "Megezez Restaurant",
      "marcan": "Marcan Cafeteria"
    };
    return cafeteriaNames[selectedCafeteria] || "Cafeteria";
  };

  const handleAddBalance = async () => {
    const amount = parseInt(balanceAmount, 10);
    if (isNaN(amount) || amount < 300 || !paymentMethod || !agreeToTerms) { alert("Please fill all fields with a valid amount (minimum 300 ETB) and agree to contract terms."); return; }

    if (paymentMethod === "Chapa") {
      try {
        const tx_ref = `tx-dbu-${Date.now()}`;
        const return_url = `${window.location.origin}/user-dashboard?status=success&tx_ref=${tx_ref}`;

        const chapaPayload = {
          amount: amount,
          currency: "ETB",
          email: currentUser.email,
          first_name: currentUser.fullName.split(" ")[0] || "User",
          last_name: currentUser.fullName.split(" ")[1] || "DBU",
          tx_ref: tx_ref,
          callback_url: "https://api.chapa.co/v1/transaction/verify/" + tx_ref,
          return_url: return_url,
          customization: {
            title: "DBU Lunch",
            description: "Add balance to your lunch wallet",
          },
        };

        // Use new backend initialization endpoint
        const response = await axios.post(`${API_BASE}/initialize_chapa.php`, chapaPayload, {
          headers: { "Content-Type": "application/json" },
        });

        const data = response.data;

        if (data.status === "success" && data.data && data.data.checkout_url) {
          window.location.href = data.data.checkout_url;
        } else {
          alert("Failed to initialize Chapa payment: " + (data.message || "Unknown error"));
        }
      } catch (err) {
        console.error("Chapa Error:", err);
        alert("Error connecting to Chapa.");
      }
      return;
    }

    try {
      await axios.post(`${API_BASE}/add_balance.php`, { email: currentUser.email, amount, paymentMethod, agreedToTerms: agreeToTerms });
      alert("Balance added successfully!"); setBalanceAmount(""); setPaymentMethod(""); setAgreeToTerms(false); setShowAddBalanceModal(false); fetchData();
    } catch (err) { alert("Error adding balance"); }
  };

  const handleAddToCart = (item) => {
    const existing = cartItems.find(ci => ci.id === item.id);
    if (existing) setCartItems(cartItems.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci));
    else setCartItems([...cartItems, { ...item, quantity: 1 }]);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) { alert("Your cart is empty"); return; }

    // Map selectedCafeteria ID to full Location Name required by backend
    const cafeteriaLocationMap = {
      "abay": "Female Launch System (Abay)",
      "tana": "Male Launch System (Tana)",
      "guna": "Megenagna (Guna)",
      "megezez": "Megezez Restaurant",
      "marcan": "Marcan Cafeteria"
    };

    const locationName = cafeteriaLocationMap[selectedCafeteria] || "Female Launch System (Abay)";
    const subtotal = cartItems.reduce((t, i) => t + (i.price * i.quantity), 0);
    const deliveryFee = 0; // Dashboard orders assumed pickup/no extra fee for now
    const total = subtotal + deliveryFee;

    try {
      const orderData = {
        userEmail: currentUser.email,
        items: cartItems.map(item => ({
          id: item.id,
          title: item.name, // backend expects item.title for name insert
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        location: locationName,
        paymentMethod: "Account Balance",
        contractType: "Monthly Contract (Prepaid)", // Defaulting for dashboard internal orders
        needsDelivery: false,
        status: "Pending"
      };

      await axios.post(`${API_BASE}/place_order.php`, orderData);
      alert("Order placed successfully!");
      setCartItems([]);
      fetchData();
    } catch (err) {
      console.error("Order Error:", err);
      alert("Error placing order: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmitFeedback = async () => {
    if (newFeedback.rating === 0 || !newFeedback.comment.trim()) { alert("Please provide a rating and comment"); return; }
    try {
      const feedbackData = { userEmail: currentUser.email, userName: currentUser.fullName, rating: newFeedback.rating, comment: newFeedback.comment };
      await axios.post(`${API_BASE}/submit_feedback.php`, feedbackData);
      alert("Feedback submitted successfully!"); setNewFeedback({ rating: 0, comment: "" }); fetchData();
    } catch (err) { alert("Error submitting feedback"); }
  };

  if (!currentUser) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
      <div className="flex-1 ml-64">
        <Header
          currentUser={currentUser}
          userBalance={userBalance}
          setShowAddBalanceModal={setShowAddBalanceModal}
          selectedCafeteria={selectedCafeteria}
          setSelectedCafeteria={setSelectedCafeteria}
        />
        <main className="p-8 mt-32 space-y-6">
          {activeTab === "menu" && <MenuSection navigateToCafeMenu={navigateToCafeMenu} getCafeteriaName={getCafeteriaName} />}
          {activeTab === "orders" && <OrdersSection lunchOrders={lunchOrders} searchTerm={searchTerm} setSearchTerm={setSearchTerm} orderFilter={orderFilter} setOrderFilter={setOrderFilter} currentUser={currentUser} />}
          {activeTab === "feedback" && <FeedbackSection feedbacks={feedbacks} newFeedback={newFeedback} setNewFeedback={setNewFeedback} handleSubmitFeedback={handleSubmitFeedback} currentUser={currentUser} />}
        </main>
      </div>

      <AddBalanceModal showAddBalanceModal={showAddBalanceModal} setShowAddBalanceModal={setShowAddBalanceModal} balanceAmount={balanceAmount} setBalanceAmount={setBalanceAmount} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} handleAddBalance={handleAddBalance} currentUser={currentUser} agreeToTerms={agreeToTerms} setAgreeToTerms={setAgreeToTerms} />
    </div>
  );
}

export default UserDashboard;