import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaUtensils,
  FaUsers,
  FaDollarSign,
  FaClipboardList,
  FaSignOutAlt,
  FaUser,
  FaTruck,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaImage,
} from "react-icons/fa";

// Storage keys - matching with LoginPage
const FOOD_KEY = "foods";
const USER_KEY = "users";
const ORDER_KEY = "orders";
const USER_STORAGE_KEY = "admin_user_session"; // Changed to match LoginPage

// Cafeteria locations
const CAFETERIA_LOCATIONS = [
  "Female Launch System (Abay)",
  "Male Launch System (Tana)",
  "Megenagna (Guna)",
  "Megezez Restaurant",
  "Marcan Cafeteria",
];

// Food categories
const FOOD_CATEGORIES = [
  "Breakfast",
  "Main",
  "Snack",
  "Beverage",
  "Dessert",
];

// Helpers to convert between location and URL
const locationToUrl = (location) =>
  location
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9-]/g, "");

const urlToLocation = (url) => CAFETERIA_LOCATIONS.find((loc) => locationToUrl(loc) === url) || null;

// LocalStorage helpers
const getFromStorage = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    return Array.isArray(fallback) && !Array.isArray(data) ? fallback : data;
  } catch (error) {
    console.error("Error getting from storage:", error);
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to storage:", error);
  }
};

// Unique ID generator
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`;

// Seed some default data if empty
const seedIfEmpty = () => {
  try {
    if (!localStorage.getItem(FOOD_KEY)) {
      const seedFoods = [
        { id: uid(), name: "Injera + Doro Wot", price: 200, category: "Main", hidden: false, location: CAFETERIA_LOCATIONS[2], image: null },
        { id: uid(), name: "Shiro", price: 120, category: "Main", hidden: false, location: CAFETERIA_LOCATIONS[0], image: null },
        { id: uid(), name: "Chechebsa", price: 80, category: "Breakfast", hidden: true, location: CAFETERIA_LOCATIONS[4], image: null },
      ];
      saveToStorage(FOOD_KEY, seedFoods);
    }

    if (!localStorage.getItem(USER_KEY)) {
      const seedUsers = [
        { id: uid(), name: "Amanuel", email: "aman@example.com", role: "user" },
        { id: uid(), name: "Manager1", email: "manager1@example.com", role: "manager", location: CAFETERIA_LOCATIONS[2] },
      ];
      saveToStorage(USER_KEY, seedUsers);
    }

    if (!localStorage.getItem(ORDER_KEY)) {
      const seedOrders = [
        {
          id: uid(),
          items: [{ name: "Injera + Doro Wot", price: 200, qty: 1 }],
          userEmail: "aman@example.com",
          subtotal: 200,
          deliveryFee: 0,
          total: 200,
          paid: false,
          delivered: false,
          createdAt: Date.now() - 1000 * 60 * 60,
          location: CAFETERIA_LOCATIONS[2],
        },
      ];
      saveToStorage(ORDER_KEY, seedOrders);
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

// Food Form Modal Component
const FoodFormModal = ({ isOpen, onClose, onSave, food, location }) => {
  const [formData, setFormData] = useState({
    name: food?.name || "",
    price: food?.price || "",
    category: food?.category || "Main",
    hidden: food?.hidden || false,
    image: food?.image || null,
  });
  const [imagePreview, setImagePreview] = useState(food?.image || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (food) {
      setFormData({
        name: food.name,
        price: food.price,
        category: food.category,
        hidden: food.hidden,
        image: food.image,
      });
      setImagePreview(food.image);
    } else {
      setFormData({
        name: "",
        price: "",
        category: "Main",
        hidden: false,
        image: null,
      });
      setImagePreview(null);
    }
  }, [food, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    const foodData = {
      ...formData,
      id: food?.id || uid(),
      location: location,
    };

    onSave(foodData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{food ? "Edit Food Item" : "Add New Food Item"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Food Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETB)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {FOOD_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div className="flex items-center space-x-4">
              {imagePreview ? (
                <img src={imagePreview} alt="Food preview" className="h-20 w-20 object-cover rounded" />
              ) : (
                <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center">
                  <FaImage className="text-gray-400" size={24} />
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                >
                  {imagePreview ? "Change" : "Upload"} Image
                </button>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="hidden"
                checked={formData.hidden}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Hide from menu</span>
            </label>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {food ? "Update" : "Add"} Food
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { locationName } = useParams();
  const managerLocation = urlToLocation(locationName);

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Food management state
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  // Load user and data
  useEffect(() => {
    console.log("ManagerDashboard useEffect triggered");
    
    try {
      seedIfEmpty();

      // Try sessionStorage first, then localStorage
      const sessionUser = JSON.parse(sessionStorage.getItem(USER_STORAGE_KEY));
      const localUser = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
      const user = sessionUser || localUser;

      console.log("ManagerDashboard - User from storage:", user);
      console.log("ManagerDashboard - Location from URL:", locationName);
      console.log("ManagerDashboard - Parsed location:", managerLocation);

      if (!user) {
        console.log("No user found, redirecting to login");
        navigate("/login");
        return;
      }

      // Check if user is admin or manager
      if (user.role !== "manager" && user.role !== "admin") {
        console.log("Invalid user role, redirecting to login");
        navigate("/login");
        return;
      }

      setCurrentUser(user);

      // For admin users, we need to handle differently
      if (user.role === "admin") {
        console.log("Admin user detected, redirecting to admin dashboard");
        navigate("/admin-dashboard");
        return;
      }

      // Handle manager users
      if (!managerLocation) {
        const correctLocation = locationToUrl(user.location);
        console.log("No location in URL, redirecting to:", `/dashboard/${correctLocation}`);
        navigate(`/dashboard/${correctLocation}`, { replace: true });
        return;
      }

      // Check if the user's location matches the URL location
      if (user.location !== managerLocation) {
        const correctLocation = locationToUrl(user.location);
        console.log("Location mismatch, redirecting to:", `/dashboard/${correctLocation}`);
        navigate(`/dashboard/${correctLocation}`, { replace: true });
        return;
      }

      // Load data for the specific location
      console.log("Loading data for location:", managerLocation);
      const loadedFoods = getFromStorage(FOOD_KEY, []);
      const loadedOrders = getFromStorage(ORDER_KEY, []);
      const loadedUsers = getFromStorage(USER_KEY, []);
      
      console.log("Loaded foods:", loadedFoods);
      console.log("Loaded orders:", loadedOrders);
      console.log("Loaded users:", loadedUsers);
      
      setFoods(loadedFoods);
      setOrders(loadedOrders);
      setUsers(loadedUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error in ManagerDashboard useEffect:", error);
      setError(error.message);
      setLoading(false);
    }
  }, [navigate, managerLocation, locationName]);

  // Food management functions
  const handleAddFood = () => {
    setEditingFood(null);
    setIsFoodModalOpen(true);
  };

  const handleEditFood = (food) => {
    setEditingFood(food);
    setIsFoodModalOpen(true);
  };

  const handleSaveFood = (foodData) => {
    const updatedFoods = editingFood
      ? foods.map(f => f.id === foodData.id ? foodData : f)
      : [...foods, foodData];
    
    setFoods(updatedFoods);
    saveToStorage(FOOD_KEY, updatedFoods);
  };

  const handleDeleteFood = (foodId) => {
    if (window.confirm("Are you sure you want to delete this food item?")) {
      const updatedFoods = foods.filter(f => f.id !== foodId);
      setFoods(updatedFoods);
      saveToStorage(FOOD_KEY, updatedFoods);
    }
  };

  const handleToggleFoodVisibility = (foodId) => {
    const updatedFoods = foods.map(f => 
      f.id === foodId ? { ...f, hidden: !f.hidden } : f
    );
    setFoods(updatedFoods);
    saveToStorage(FOOD_KEY, updatedFoods);
  };

  if (loading) {
    console.log("ManagerDashboard is still loading");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log("ManagerDashboard has an error:", error);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    console.log("ManagerDashboard - No current user");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access this page.</p>
          <button 
            onClick={() => navigate("/login")} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!managerLocation) {
    console.log("ManagerDashboard - Invalid location");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 text-6xl mb-4">📍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Location</h2>
          <p className="text-gray-600 mb-4">The location specified in the URL is not valid.</p>
          <button 
            onClick={() => navigate("/dashboard/female-launch-system-abay")} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Default Location
          </button>
        </div>
      </div>
    );
  }

  const locationFoods = foods.filter((f) => f.location === managerLocation);
  const locationOrders = orders.filter((o) => o.location === managerLocation);
  const totalEarnings = locationOrders.filter((o) => o.paid).reduce((sum, o) => sum + o.total, 0);

  console.log("ManagerDashboard - Rendering with data:", {
    currentUser,
    managerLocation,
    locationFoodsCount: locationFoods.length,
    locationOrdersCount: locationOrders.length,
    totalEarnings
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-indigo-600 text-white p-6 flex flex-col shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            <FaUser />
          </div>
          <div>
            <div className="font-bold">{currentUser.fullName || currentUser.name || currentUser.email}</div>
            <div className="text-sm opacity-70">{currentUser.role}</div>
          </div>
        </div>
        <h3 className="font-bold mb-3 text-sm opacity-80">Managing:</h3>
        <div className="text-xl font-bold bg-white/20 p-2 rounded mb-6 text-center">{managerLocation}</div>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${activeTab === "dashboard" ? "bg-white text-indigo-700 font-semibold" : "hover:bg-white/20"}`} onClick={() => setActiveTab("dashboard")}>
              <FaClipboardList /> Overview
            </li>
            <li className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${activeTab === "food" ? "bg-white text-indigo-700 font-semibold" : "hover:bg-white/20"}`} onClick={() => setActiveTab("food")}>
              <FaUtensils /> Food ({locationFoods.length})
            </li>
            <li className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${activeTab === "orders" ? "bg-white text-indigo-700 font-semibold" : "hover:bg-white/20"}`} onClick={() => setActiveTab("orders")}>
              <FaTruck /> Orders ({locationOrders.length})
            </li>
            <li className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${activeTab === "earnings" ? "bg-white text-indigo-700 font-semibold" : "hover:bg-white/20"}`} onClick={() => setActiveTab("earnings")}>
              <FaDollarSign /> Earnings
            </li>
            <li className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${activeTab === "users" ? "bg-white text-indigo-700 font-semibold" : "hover:bg-white/20"}`} onClick={() => setActiveTab("users")}>
              <FaUsers /> Users ({users.length})
            </li>
            <li className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${activeTab === "profile" ? "bg-white text-indigo-700 font-semibold" : "hover:bg-white/20"}`} onClick={() => setActiveTab("profile")}>
              <FaUser /> Profile
            </li>
          </ul>
        </nav>
        <button
          className="mt-4 py-2 rounded-lg flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30"
          onClick={() => {
            sessionStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            navigate("/login");
          }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {activeTab === "dashboard" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Foods</h3>
                <p className="text-3xl font-bold text-indigo-600">{locationFoods.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Orders</h3>
                <p className="text-3xl font-bold text-green-600">{locationOrders.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Earnings</h3>
                <p className="text-3xl font-bold text-yellow-600">{totalEarnings} ETB</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {locationOrders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id.substring(0, 8)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.userEmail}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total} ETB</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {order.paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === "food" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Food Management</h1>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700">Food Items</h2>
                <button 
                  onClick={handleAddFood}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
                >
                  <FaPlus /> Add New Food
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {locationFoods.map((food) => (
                      <tr key={food.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {food.image ? (
                            <img src={food.image} alt={food.name} className="h-12 w-12 object-cover rounded" />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                              <FaImage className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{food.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{food.price} ETB</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{food.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${food.hidden ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {food.hidden ? 'Hidden' : 'Visible'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleEditFood(food)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3" 
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleToggleFoodVisibility(food.id)}
                            className="text-yellow-600 hover:text-yellow-900 mr-3" 
                            title={food.hidden ? "Show" : "Hide"}
                          >
                            {food.hidden ? "Show" : "Hide"}
                          </button>
                          <button 
                            onClick={() => handleDeleteFood(food.id)}
                            className="text-red-600 hover:text-red-900" 
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Food Form Modal */}
            <FoodFormModal
              isOpen={isFoodModalOpen}
              onClose={() => setIsFoodModalOpen(false)}
              onSave={handleSaveFood}
              food={editingFood}
              location={managerLocation}
            />
          </div>
        )}
        {activeTab === "orders" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Orders Management</h1>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700">All Orders</h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Export Orders
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {locationOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id.substring(0, 8)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.userEmail}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items.map((item, idx) => (
                            <div key={idx}>{item.name} x {item.qty}</div>
                          ))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total} ETB</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {order.paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.delivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.delivered ? 'Delivered' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                          {!order.paid && <button className="text-green-600 hover:text-green-900 mr-3">Mark Paid</button>}
                          {!order.delivered && <button className="text-blue-600 hover:text-blue-900">Mark Delivered</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === "earnings" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Earnings Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-600">{totalEarnings} ETB</p>
                <p className="text-sm text-gray-500 mt-2">From {locationOrders.filter(o => o.paid).length} paid orders</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Revenue</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {locationOrders.filter(o => !o.paid).reduce((sum, o) => sum + o.total, 0)} ETB
                </p>
                <p className="text-sm text-gray-500 mt-2">From {locationOrders.filter(o => !o.paid).length} unpaid orders</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue by Month</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chart placeholder - Revenue by month would be displayed here
              </div>
            </div>
          </div>
        )}
        {activeTab === "users" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Users Management</h1>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700">All Users</h2>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Add New User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                            user.role === 'manager' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {locationOrders.filter(o => o.userEmail === user.email).length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === "profile" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={currentUser.fullName || currentUser.name || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={currentUser.email || ''}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={currentUser.role || ''}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={currentUser.location || ''}
                      disabled
                    />
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Change Password</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}