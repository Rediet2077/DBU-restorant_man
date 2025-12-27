// ====================================================================
// ManagerDashboard.jsx - Reworked for URL-Based Location Control with Image Upload
// ====================================================================

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FaUtensils,
  FaUsers,
  FaDollarSign,
  FaClipboardList,
  FaSignOutAlt,
  FaUser,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaTimes,
  FaTruck,
  FaCoins,
  FaCamera,
  FaImage,
} from "react-icons/fa";

/* ----------------------------- Helpers: storage ---------------------------- */
const FOOD_KEY = "foods";
const USER_KEY = "users";
const ORDER_KEY = "orders";
const CURRENT_USER_KEY = "currentUser";

const CAFETERIA_LOCATIONS = [
  "Female Launch System (Abay)",
  "Male Launch System (Tana)",
  "Megenagna (Guna)",
  "Megezez Restaurant",
  "Marcan Cafeteria",
];

// Function to convert location name to URL-friendly format
const locationToUrl = (location) => {
  return location
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9-]/g, '');
};

// Function to convert URL back to location name
const urlToLocation = (url) => {
  for (const location of CAFETERIA_LOCATIONS) {
    if (locationToUrl(location) === url) {
      return location;
    }
  }
  return null;
};

const getFromStorage = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    return Array.isArray(fallback) && !Array.isArray(data) ? fallback : data;
  } catch (e) {
    console.error("Storage parse error:", e);
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`;

/* ---------------------------- Example seed data --------------------------- */
const seedIfEmpty = () => {
  const defaultLocation = CAFETERIA_LOCATIONS[0]; 
  if (!localStorage.getItem(FOOD_KEY)) {
    const seedFoods = [
      { id: uid(), name: "Injera + Doro Wot", price: 200, category: "Main", hidden: false, location: CAFETERIA_LOCATIONS[2], image: "https://picsum.photos/seed/doro/200/150.jpg" }, 
      { id: uid(), name: "Shiro", price: 120, category: "Main", hidden: false, location: CAFETERIA_LOCATIONS[0], image: "https://picsum.photos/seed/shiro/200/150.jpg" }, 
      { id: uid(), name: "Chechebsa", price: 80, category: "Breakfast", hidden: true, location: CAFETERIA_LOCATIONS[4], image: "https://picsum.photos/seed/chechebsa/200/150.jpg" }, 
    ];
    saveToStorage(FOOD_KEY, seedFoods);
  }
  if (!localStorage.getItem(USER_KEY)) {
    const seedUsers = [
      { id: uid(), name: "Amanuel", email: "aman@example.com", role: "user" },
      { id: uid(), name: "Sara", email: "sara@example.com", role: "worker" },
    ];
    saveToStorage(USER_KEY, seedUsers);
  }
  if (!localStorage.getItem(ORDER_KEY)) {
    const seedOrders = [
      {
        id: uid(),
        items: [{ foodId: null, name: "Injera + Doro Wot", price: 200, qty: 1 }],
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
};

/* ------------------------------- Component ------------------------------- */
export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { locationName } = useParams();
  const managerLocation = urlToLocation(locationName);
  
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [foods, setFoods] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // UI state: forms / modals
  const [foodFormOpen, setFoodFormOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState({ 
    name: "", 
    price: "", 
    category: "", 
    hidden: false, 
    location: managerLocation,
    image: null 
  });

  const fileInputRef = useRef(null);

  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "user" });

  const [orderView, setOrderView] = useState(null); 
  const [confirm, setConfirm] = useState(null); 

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPaid, setFilterPaid] = useState("all"); 
  const [filterDelivered, setFilterDelivered] = useState("all"); 

  /* --------------------------- initial load ---------------------------- */
  useEffect(() => {
    seedIfEmpty();
    const user = JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY));
    if (!user) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);

    // --- AUTHORIZATION CHECK ---
    if (user.role === "manager" && user.location) {
      if (user.location !== managerLocation) {
        const correctLocationUrl = locationToUrl(user.location);
        navigate(`/dashboard/${correctLocationUrl}`, { replace: true });
        return;
      }
    }
    // --- END AUTHORIZATION CHECK ---

    const foodsFromStorage = getFromStorage(FOOD_KEY, []).map(f => ({ 
        ...f, 
        location: f.location || CAFETERIA_LOCATIONS[0] 
    }));
    const usersFromStorage = getFromStorage(USER_KEY, []);
    const ordersFromStorage = getFromStorage(ORDER_KEY, []).map(o => ({ 
        ...o, 
        location: o.location || CAFETERIA_LOCATIONS[0] 
    }));

    setFoods(foodsFromStorage);
    setUsers(usersFromStorage);
    setOrders(ordersFromStorage);
    
    setFoodForm(prev => ({...prev, location: managerLocation}));
    setActiveTab("dashboard");
    setSearchQuery("");
  }, [navigate, managerLocation]);

  if (!managerLocation) {
      return <div className="p-10 text-red-600">Error: Invalid cafeteria location specified in URL.</div>;
  }

  /* --------------------------- derived values -------------------------- */
  const locationFilteredFoods = useMemo(() => foods.filter(f => f.location === managerLocation), [foods, managerLocation]);
  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => o.location === managerLocation);
    return result.filter((o) => {
      if (filterPaid === "paid" && !o.paid) return false;
      if (filterPaid === "pending" && o.paid) return false;
      if (filterDelivered === "delivered" && !o.delivered) return false;
      if (filterDelivered === "pending" && o.delivered) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      if ((o.userEmail || "").toLowerCase().includes(q)) return true;
      if ((o.id || "").toLowerCase().includes(q)) return true;
      if ((o.items || []).some((it) => (it.name || "").toLowerCase().includes(q))) return true;
      return false;
    });
  }, [orders, filterPaid, filterDelivered, searchQuery, managerLocation]);
  const totalEarnings = useMemo(() => filteredOrders.filter((o) => o.paid).reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0), [filteredOrders]);
  const totalVisibleFoods = locationFilteredFoods.filter((f) => !f.hidden).length;
  const totalHiddenFoods = locationFilteredFoods.filter((f) => f.hidden).length;
  const totalPaidOrdersCount = filteredOrders.filter(o => o.paid).length;

  /* ----------------------------- Image Handling ----------------------------- */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoodForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  /* ----------------------------- Food CRUD ----------------------------- */
  const openAddFood = () => {
    setEditingFood(null);
    setFoodForm({ 
      name: "", 
      price: "", 
      category: "", 
      hidden: false, 
      location: managerLocation,
      image: null
    }); 
    setFoodFormOpen(true);
  };

  const openEditFood = (food) => {
    setEditingFood(food);
    setFoodForm({ 
      name: food.name, 
      price: String(food.price), 
      category: food.category || "", 
      hidden: !!food.hidden, 
      location: food.location || managerLocation,
      image: food.image || null
    });
    setFoodFormOpen(true);
  };

  const saveFood = () => {
    const { name: formName, price: priceStr, category, hidden, location, image } = foodForm;
    const name = (formName || "").trim();
    const price = parseFloat(priceStr);
    if (!name) return alert("Food name is required.");
    if (isNaN(price) || price < 0) return alert("Enter a valid non-negative price.");
    if (location !== managerLocation) return alert("Cannot change food location on this dashboard.");
    
    const foodData = { name, price, category, hidden: !!hidden, location: managerLocation, image };
    
    if (editingFood) {
      const updated = foods.map((f) => (f.id === editingFood.id ? { ...f, ...foodData } : f));
      setFoods(updated);
      saveToStorage(FOOD_KEY, updated);
      setEditingFood(null);
      setFoodFormOpen(false);
    } else {
      const newFood = { id: uid(), ...foodData };
      const updated = [newFood, ...foods];
      setFoods(updated);
      saveToStorage(FOOD_KEY, updated);
      setFoodFormOpen(false);
    }
  };

  const toggleFoodHidden = (id) => {
    const updated = foods.map((f) => (f.id === id ? { ...f, hidden: !f.hidden } : f));
    setFoods(updated);
    saveToStorage(FOOD_KEY, updated);
  };

  const deleteFood = (id) => {
    if (!window.confirm("Delete this food item?")) return;
    const updated = foods.filter((f) => f.id !== id);
    setFoods(updated);
    saveToStorage(FOOD_KEY, updated);
  };

  const updateFoodPrice = (id, newPrice) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) return;
    const updated = foods.map((f) => (f.id === id ? { ...f, price } : f));
    setFoods(updated);
    saveToStorage(FOOD_KEY, updated);
  };

  /* ----------------------------- User CRUD ----------------------------- */
  const openAddUser = () => { 
    setEditingUser(null); 
    setUserForm({ name: "", email: "", role: "user" }); 
    setUserFormOpen(true); 
  };
  
  const openEditUser = (user) => { 
    setEditingUser(user); 
    setUserForm({ name: user.name, email: user.email, role: user.role }); 
    setUserFormOpen(true); 
  };
  
  const saveUser = () => {
    const { name, email, role } = userForm;
    if (!name || !email) return alert("Name and email are required.");
    const userData = { name, email, role };
    if (editingUser) {
      const updated = users.map((u) => (u.id === editingUser.id ? { ...u, ...userData } : u));
      setUsers(updated);
      saveToStorage(USER_KEY, updated);
      setEditingUser(null);
      setUserFormOpen(false);
    } else {
      const newUser = { id: uid(), ...userData };
      const updated = [newUser, ...users];
      setUsers(updated);
      saveToStorage(USER_KEY, updated);
      setUserFormOpen(false);
    }
  };
  
  const deleteUser = (id) => { 
    if (!window.confirm("Delete this user?")) return; 
    const updated = users.filter((u) => u.id !== id); 
    setUsers(updated); 
    saveToStorage(USER_KEY, updated); 
  };

  /* ---------------------------- Order Functions ---------------------------- */
  const markOrderAsPaid = (id) => { 
    const updated = orders.map((o) => (o.id === id ? { ...o, paid: true } : o)); 
    setOrders(updated); 
    saveToStorage(ORDER_KEY, updated); 
  };
  
  const markOrderAsDelivered = (id) => { 
    const updated = orders.map((o) => (o.id === id ? { ...o, delivered: true } : o)); 
    setOrders(updated); 
    saveToStorage(ORDER_KEY, updated); 
  };
  
  const deleteOrder = (id) => { 
    if (!window.confirm("Delete this order?")) return; 
    const updated = orders.filter((o) => o.id !== id); 
    setOrders(updated); 
    saveToStorage(ORDER_KEY, updated); 
  };

  /* ------------------------------- Render ------------------------------- */
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-indigo-600 via-pink-500 to-yellow-400 text-white p-6 flex flex-col shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl"><FaUser /></div>
          <div>
            <div className="font-bold text-lg">{currentUser?.username || "Manager"}</div>
            <div className="text-sm opacity-90">{currentUser?.email || ""}</div>
          </div>
        </div>
        <h3 className="font-bold mb-3 text-sm opacity-80">Managing:</h3>
        <div className="text-xl font-bold bg-white/20 p-2 rounded mb-6 text-center">{managerLocation}</div>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${activeTab === "dashboard" ? "bg-white text-indigo-700 font-semibold" : "hover:bg-white/20"}`}><FaClipboardList /> <span>Overview</span></li>
            <li onClick={() => setActiveTab("food")} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${activeTab === "food" ? "bg-white text-indigo-700 font-semibold" : "hover:bg-white/20"}`}><FaUtensils /><span>Food Management</span><span className="ml-auto bg-white/20 px-2 py-0.5 rounded text-xs">{locationFilteredFoods.length}</span></li>
            <li onClick={() => setActiveTab("orders")} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${activeTab === "orders" ? "bg-white text-indigo-700 font-semibold" : "hover:bg-white/20"}`}><FaTruck /> <span>Orders</span><span className="ml-auto bg-white/20 px-2 py-0.5 rounded text-xs">{filteredOrders.length}</span></li>
            <li onClick={() => setActiveTab("earnings")} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${activeTab === "earnings" ? "bg-white text-indigo-700 font-semibold" : "hover:bg-white/20"}`}><FaDollarSign /> <span>Earnings</span></li>
            <hr className="my-2 border-white/30"/>
            <li onClick={() => setActiveTab("users")} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${activeTab === "users" ? "bg-white text-indigo-700 font-semibold" : "hover:bg-white/20"}`}><FaUsers /> <span>Users / Workers</span><span className="ml-auto bg-white/20 px-2 py-0.5 rounded text-xs">{users.length}</span></li>
            <li onClick={() => setActiveTab("profile")} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${activeTab === "profile" ? "bg-white text-indigo-700 font-semibold" : "hover:bg-white/20"}`}><FaUser /> <span>Profile</span></li>
          </ul>
        </nav>
        <div className="mt-4">
          <button onClick={() => { sessionStorage.removeItem(CURRENT_USER_KEY); navigate("/login"); }} className="w-full py-2 rounded-lg flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 transition"><FaSignOutAlt /> Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {activeTab === "dashboard" && `Manager Dashboard: ${managerLocation}`}
            {activeTab === "food" && `Food Management: ${managerLocation}`}
            {activeTab === "users" && "Users & Workers"}
            {activeTab === "orders" && `Orders: ${managerLocation}`}
            {activeTab === "earnings" && `Earnings: ${managerLocation}`}
            {activeTab === "profile" && "Profile"}
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
              <FaSearch className="text-gray-400" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search orders / items / user..." className="outline-none" />
            </div>
            <div className="text-sm text-gray-600">Welcome back, <span className="font-semibold">{currentUser?.username || "Manager"}</span></div>
          </div>
        </div>

        <div className="space-y-6">
          {/* DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow"><div className="text-sm text-gray-500">Total Foods ({managerLocation})</div><div className="text-3xl font-bold">{locationFilteredFoods.length}</div><div className="mt-3 text-sm text-gray-600">Visible: {totalVisibleFoods} / Hidden: {totalHiddenFoods}</div></div>
              <div className="bg-white p-6 rounded-xl shadow"><div className="text-sm text-gray-500">Total Users (Global)</div><div className="text-3xl font-bold">{users.length}</div><div className="mt-3 text-sm text-gray-600">Workers: {users.filter(u => u.role === "worker").length}</div></div>
              <div className="bg-white p-6 rounded-xl shadow"><div className="text-sm text-gray-500">Earnings (Paid, {managerLocation})</div><div className="text-3xl font-bold">{totalEarnings.toFixed(2)} ETB</div><div className="mt-3 text-sm text-gray-600">Orders: {totalPaidOrdersCount}</div></div>
            </div>
          )}

          {/* FOOD MANAGEMENT */}
          {activeTab === "food" && (
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Foods for {managerLocation}</h2>
                <button onClick={openAddFood} className="px-4 py-2 bg-indigo-600 text-white rounded flex items-center gap-2"><FaPlus /> Add Food</button>
              </div>
              {locationFilteredFoods.length === 0 ? <div className="text-gray-500">No food items found at **{managerLocation}**.</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locationFilteredFoods.map((f) => (
                    <div key={f.id} className={`p-4 rounded-lg border ${f.hidden ? "opacity-60" : ""}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{f.name}</div>
                          <div className="text-sm text-gray-500">{f.category || "General"}</div>
                          <div className="text-xs text-indigo-500">Loc: {f.location}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{parseFloat(f.price).toFixed(2)} ETB</div>
                          <div className="text-sm">{f.hidden ? <span className="text-yellow-600">Hidden</span> : <span className="text-green-600">Visible</span>}</div>
                        </div>
                      </div>
                      
                      {/* Food Image */}
                      <div className="h-32 mb-3 rounded-lg overflow-hidden bg-gray-100">
                        {f.image ? (
                          <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaImage className="text-4xl" />
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <button onClick={() => openEditFood(f)} className="px-3 py-1 bg-indigo-500 text-white rounded flex items-center gap-2"><FaEdit /></button>
                        <button onClick={() => toggleFoodHidden(f.id)} className="px-3 py-1 bg-gray-200 rounded flex items-center gap-2">
                          {f.hidden ? <FaEye /> : <FaEyeSlash />}
                        </button>
                        <button onClick={() => deleteFood(f.id)} className="px-3 py-1 bg-red-500 text-white rounded flex items-center gap-2"><FaTrash /></button>
                        <div className="ml-auto flex items-center gap-2">
                          <input type="number" step="0.01" min="0" defaultValue={parseFloat(f.price)} onBlur={(e) => updateFoodPrice(f.id, e.target.value)} className="w-28 p-1 rounded border text-right" title="Edit price and click outside to save" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Food Form Modal with Image Upload */}
              {foodFormOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{editingFood ? "Edit Food" : "Add Food"}</h3>
                      <button onClick={() => { setFoodFormOpen(false); setEditingFood(null); }}>
                        <FaTimes />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Food Image</label>
                        <div className="flex items-center gap-3">
                          {foodForm.image && (
                            <img 
                              src={foodForm.image} 
                              alt="Food preview" 
                              className="w-20 h-20 object-cover rounded-md" 
                            />
                          )}
                          <div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current.click()}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-sm flex items-center gap-2"
                            >
                              <FaCamera />
                              {foodForm.image ? "Change" : "Upload"} Image
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <input value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} placeholder="Food name" className="w-full border p-2 rounded" />
                      <input value={foodForm.price} onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })} placeholder="Price" className="w-full border p-2 rounded" type="number" step="0.01" />
                      <select value={foodForm.category} onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })} className="w-full border p-2 rounded">
                        <option value="">Select Category</option>
                        <option value="Food">Food</option>
                        <option value="Drink">Drink</option>
                      </select>
                      <div className="p-2 border rounded bg-gray-100 text-gray-700">**Location:** {managerLocation} (Locked)</div>
                      <label className="inline-flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={!!foodForm.hidden} 
                          onChange={(e) => setFoodForm({ ...foodForm, hidden: e.target.checked })} 
                        />
                        <span>Hidden (not visible in user menu)</span>
                      </label>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => { setFoodFormOpen(false); setEditingFood(null); }} className="px-4 py-2 rounded border">Cancel</button>
                        <button onClick={saveFood} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* USERS */}
          {activeTab === "users" && (
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Users & Workers (Global)</h2>
                <button onClick={openAddUser} className="px-4 py-2 bg-indigo-600 text-white rounded flex items-center gap-2"><FaPlus /> Add</button>
              </div>
              {users.length === 0 ? <div className="text-gray-500">No users yet.</div> : (
                <div className="space-y-2">{users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between border p-3 rounded">
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-sm text-gray-500">{u.email} • <span className="capitalize">{u.role}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditUser(u)} className="px-3 py-1 bg-indigo-500 text-white rounded"><FaEdit /></button>
                      <button onClick={() => deleteUser(u.id)} className="px-3 py-1 bg-red-500 text-white rounded"><FaTrash /></button>
                    </div>
                  </div>
                ))}</div>
              )}
              
              {/* User Form Modal */}
              {userFormOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{editingUser ? "Edit User" : "Add User"}</h3>
                      <button onClick={() => { setUserFormOpen(false); setEditingUser(null); }}>
                        <FaTimes />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} placeholder="Name" className="w-full border p-2 rounded" />
                      <input value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="Email" className="w-full border p-2 rounded" />
                      <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full border p-2 rounded">
                        <option value="user">User</option>
                        <option value="worker">Worker</option>
                        <option value="manager">Manager</option>
                      </select>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => { setUserFormOpen(false); setEditingUser(null); }} className="px-4 py-2 rounded border">Cancel</button>
                        <button onClick={saveUser} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORDERS */}
          {activeTab === "orders" && (
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Orders for {managerLocation}</h2>
                <div className="flex items-center gap-2">
                  <select value={filterPaid} onChange={(e) => setFilterPaid(e.target.value)} className="border p-2 rounded">
                    <option value="all">All</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending Payment</option>
                  </select>
                  <select value={filterDelivered} onChange={(e) => setFilterDelivered(e.target.value)} className="border p-2 rounded">
                    <option value="all">All</option>
                    <option value="delivered">Delivered</option>
                    <option value="pending">Not Delivered</option>
                  </select>
                </div>
              </div>
              {filteredOrders.length === 0 ? <div className="text-gray-500">No orders match filter for **{managerLocation}**.</div> : (
                <div className="space-y-3">{filteredOrders.map((o) => (
                  <div key={o.id} className="border p-3 rounded flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold">{o.userEmail} <span className="text-xs text-gray-500 ml-2">#{o.id.slice(-6)}</span></div>
                      <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                      <div className="mt-2">{(o.items || []).map((it, i) => (<div key={i} className="text-sm text-gray-700">{it.qty} x {it.name} — {(parseFloat(it.price) || 0).toFixed(2)} ETB</div>))}</div>
                    </div>
                    <div className="mt-3 md:mt-0 flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Total</div><div className="text-lg font-bold">{parseFloat(o.total || 0).toFixed(2)} ETB</div>
                        <div className="mt-2 text-sm">{o.paid ? <span className="text-green-600 font-semibold">Paid</span> : <span className="text-red-600 font-semibold">Pending</span>}<span className="mx-2">•</span>{o.delivered ? <span className="text-green-600 font-semibold">Delivered</span> : <span className="text-yellow-600 font-semibold">Not delivered</span>}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {!o.paid && <button onClick={() => markOrderAsPaid(o.id)} className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-2"><FaCoins /> Paid</button>}
                        {!o.delivered && <button onClick={() => markOrderAsDelivered(o.id)} className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-2"><FaTruck /> Delivered</button>}
                        <button onClick={() => { setOrderView(o.id); }} className="px-3 py-1 bg-gray-200 rounded">Details</button>
                        <button onClick={() => deleteOrder(o.id)} className="px-3 py-1 bg-red-500 text-white rounded"><FaTrash /></button>
                      </div>
                    </div>
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {/* EARNINGS */}
          {activeTab === "earnings" && (
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">Earnings Report for: **{managerLocation}**</h2>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg"><div className="text-sm text-gray-600">Total Revenue (Paid Orders)</div><div className="text-3xl font-bold text-green-700">ETB {totalEarnings.toFixed(2)}</div></div>
                <div className="bg-indigo-50 p-4 rounded-lg"><div className="text-sm text-gray-600">Total Orders Processed</div><div className="text-3xl font-bold text-indigo-700">{filteredOrders.length}</div></div>
                <div className="bg-yellow-50 p-4 rounded-lg"><div className="text-sm text-gray-600">Pending Payment/Delivery Orders</div><div className="text-3xl font-bold text-yellow-700">{filteredOrders.filter(o => !o.paid || !o.delivered).length}</div></div>
              </div>
            </div>
          )}
          
          {/* PROFILE */}
          {activeTab === "profile" && (
              <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
                  <p><strong>Name:</strong> {currentUser?.username || "Manager"}</p>
                  <p><strong>Email:</strong> {currentUser?.email || "N/A"}</p>
                  <p><strong>Role:</strong> {currentUser?.role || "N/A"}</p>
                  {currentUser?.location && <p><strong>Assigned Location:</strong> {currentUser.location}</p>}
              </div>
          )}
        </div>
      </main>
    </div>
  );
}