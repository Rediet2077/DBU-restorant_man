import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, LogOut, BarChart2, Users, Settings, X, 
  Lock, ToggleLeft, ToggleRight, ScrollText, Ban, Plus, Edit, Trash2, Menu
} from "lucide-react";

// --- Storage Keys ---
const USER_STORAGE_KEY = "admin_user_session";
const USERS_STORAGE_KEY = "users";
const CONFIG_STORAGE_KEY = "system_config";
const LOGS_STORAGE_KEY = "system_logs";

// --- API Base URL ---
// Update this to match your server configuration
const API_BASE_URL = "http://localhost/dbu-apii2/DBU-APII/dbu-api";

// --- Database API Functions ---
const api = {
  // Cafeteria API endpoints
  getCafeterias: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_cafeterias.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.cafeterias;
      } else {
        throw new Error(data.message || "Failed to fetch cafeterias");
      }
    } catch (error) {
      console.error("Failed to fetch cafeterias:", error);
      throw error;
    }
  },
  
  saveCafeteria: async (cafeteria) => {
    try {
      const url = cafeteria.id 
        ? `${API_BASE_URL}/update_cafeteria.php` 
        : `${API_BASE_URL}/add_cafeteria.php`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cafeteria)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // For new cafeterias, we need to get the ID from the server
        if (!cafeteria.id) {
          // Fetch all cafeterias to get the newly added one with its ID
          const updatedCafeterias = await api.getCafeterias();
          const newCafeteria = updatedCafeterias.find(c => 
            c.name === cafeteria.name && 
            c.description === cafeteria.description && 
            c.hours === cafeteria.hours
          );
          return newCafeteria || { ...cafeteria, id: Date.now() }; // Fallback
        }
        return cafeteria;
      } else {
        throw new Error(data.message || "Failed to save cafeteria");
      }
    } catch (error) {
      console.error("Failed to save cafeteria:", error);
      throw error;
    }
  },
  
  deleteCafeteria: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete_cafeteria.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        throw new Error(data.message || "Failed to delete cafeteria");
      }
    } catch (error) {
      console.error("Failed to delete cafeteria:", error);
      throw error;
    }
  }
};

// --- Helper Functions (with robust error handling) ---
function getUsersFromStorage() {
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error("Failed to parse users from localStorage:", error);
    return [];
  }
}

function saveUsersToStorage(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getSystemConfig() {
  try {
    const config = localStorage.getItem(CONFIG_STORAGE_KEY);
    return config ? JSON.parse(config) : {
      maintenanceMode: false,
      maxUserLimit: 1000,
      defaultUserRole: "Student"
    };
  } catch (error) {
    console.error("Failed to parse system config from localStorage:", error);
    return {
      maintenanceMode: false,
      maxUserLimit: 1000,
      defaultUserRole: "Student"
    };
  }
}

function saveSystemConfig(config) {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

function getSystemLogs() {
  try {
    const logs = localStorage.getItem(LOGS_STORAGE_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error("Failed to parse system logs from localStorage:", error);
    return [];
  }
}

function saveSystemLogs(logs) {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
}

function addLogEntry(action, user) {
  const logs = getSystemLogs();
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    user: user?.email || "SYSTEM",
    action
  };
  const newLogs = [newLog, ...logs].slice(0, 50);
  saveSystemLogs(newLogs);
}

// --- StatCard Component (using standard Tailwind classes) ---
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-4 sm:p-6 rounded-xl shadow-lg flex items-center text-white ${color} transform transition-transform hover:scale-105`}>
    <Icon size={28} className="opacity-75 mr-4 flex-shrink-0" />
    <div>
      <p className="text-xs sm:text-sm font-light uppercase">{title}</p>
      <p className="text-2xl sm:text-4xl font-extrabold">{value}</p>
    </div>
  </div>
);

// --- AddUserPopup Component (using standard Tailwind classes) ---
const AddUserPopup = ({ isOpen, onClose, onSaveUser, newUser, setNewUser, editUserId }) => {
  if (!isOpen) return null;

  const handleCloseAndReset = () => {
    onClose();
    setNewUser({
      fullName: "", email: "", password: "", confirmPassword: "", 
      idNumber: "", phone: "", userType: "", status: "Active",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={handleCloseAndReset} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">{editUserId ? "Edit User" : "Add New User"}</h2>
        <div className="flex flex-col gap-3">
          <input type="text" placeholder="Full Name" value={newUser.fullName || ""} 
            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} 
            className="border p-2 rounded-lg" required />
          <input type="email" placeholder="Email" value={newUser.email || ""} 
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} 
            className="border p-2 rounded-lg" required />
          <p className="text-xs text-gray-500 mt-1">
            {editUserId ? "Leave password fields blank to keep current password." : "Set initial password."}
          </p>
          <input type="password" placeholder="Password" value={newUser.password || ""} 
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} 
            className="border p-2 rounded-lg" required={!editUserId} />
          <input type="password" placeholder="Confirm Password" value={newUser.confirmPassword || ""} 
            onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })} 
            className="border p-2 rounded-lg" required={!editUserId} />
          <input type="text" placeholder="ID Number" value={newUser.idNumber || ""} 
            onChange={(e) => setNewUser({ ...newUser, idNumber: e.target.value })} 
            className="border p-2 rounded-lg" />
          <input type="tel" placeholder="Phone (e.g., 0912345678)" value={newUser.phone || ""} 
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} 
            className="border p-2 rounded-lg" />
          <select value={newUser.userType || ""} 
            onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })} 
            className="border p-2 rounded-lg" required>
            <option value="" disabled>User Type</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Student">Student</option>
          </select>
          <select value={newUser.status || "Active"} 
            onChange={(e) => setNewUser({ ...newUser, status: e.target.value })} 
            className="border p-2 rounded-lg" required>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Banned">Banned</option>
          </select>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={handleCloseAndReset} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition">
              Cancel
            </button>
            <button onClick={onSaveUser} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
              {editUserId ? "Update User" : "Add User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ProfilePopup Component (using standard Tailwind classes) ---
const ProfilePopup = ({ isOpen, onClose, currentUser, setCurrentUser }) => {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    if (isOpen && currentUser) {
      setProfile({ ...currentUser, password: "", confirmPassword: "" });
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (profile.password && profile.password !== profile.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const updatedProfile = { ...profile };
    if (!profile.password && currentUser) {
      updatedProfile.password = currentUser.password;
    }
    delete updatedProfile.confirmPassword;

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedProfile));
    setCurrentUser(updatedProfile);
    onClose();
    addLogEntry(`Admin profile updated by ${updatedProfile.email}`, updatedProfile);
    alert("Profile updated successfully!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Profile Settings</h2>
        <p className="text-sm text-gray-500 mb-4">Editing profile for: <strong>{currentUser?.email}</strong></p>

        <div className="flex flex-col gap-3">
          <input type="text" placeholder="Full Name" value={profile.fullName || ""} 
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} 
            className="border p-2 rounded-lg" />
          <input type="email" placeholder="Email" value={profile.email || ""} 
            onChange={(e) => setProfile({ ...profile, email: e.target.value })} 
            className="border p-2 rounded-lg" />
          <input type="password" placeholder="New Password" value={profile.password || ""} 
            onChange={(e) => setProfile({ ...profile, password: e.target.value })} 
            className="border p-2 rounded-lg" />
          <input type="password" placeholder="Confirm New Password" value={profile.confirmPassword || ""} 
            onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })} 
            className="border p-2 rounded-lg" />

          <div className="flex justify-end gap-2 mt-3">
            <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition">
              Cancel
            </button>
            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- AddCafeteriaPopup Component (using standard Tailwind classes) ---
const AddCafeteriaPopup = ({ isOpen, onClose, onSaveCafeteria, newCafeteria, setNewCafeteria, editCafeteriaId, isLoading }) => {
  if (!isOpen) return null;

  const handleCloseAndReset = () => {
    onClose();
    setNewCafeteria({ name: "", description: "", hours: "", status: "Open" });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={handleCloseAndReset} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">{editCafeteriaId ? "Edit Cafeteria" : "Add New Cafeteria"}</h2>
        <div className="flex flex-col gap-3">
          <input type="text" placeholder="Cafeteria Name" value={newCafeteria.name || ""} 
            onChange={(e) => setNewCafeteria({ ...newCafeteria, name: e.target.value })} 
            className="border p-2 rounded-lg" required />
          <textarea placeholder="Description" value={newCafeteria.description || ""} 
            onChange={(e) => setNewCafeteria({ ...newCafeteria, description: e.target.value })} 
            className="border p-2 rounded-lg" rows={3} required />
          <input type="text" placeholder="Operating Hours (e.g., 7:00 AM - 9:00 PM)" value={newCafeteria.hours || ""} 
            onChange={(e) => setNewCafeteria({ ...newCafeteria, hours: e.target.value })} 
            className="border p-2 rounded-lg" required />
          <select value={newCafeteria.status || "Open"} 
            onChange={(e) => setNewCafeteria({ ...newCafeteria, status: e.target.value })} 
            className="border p-2 rounded-lg" required>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Maintenance">Under Maintenance</option>
          </select>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={handleCloseAndReset} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition">
              Cancel
            </button>
            <button onClick={onSaveCafeteria} disabled={isLoading} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:bg-green-300">
              {isLoading ? "Saving..." : (editCafeteriaId ? "Update Cafeteria" : "Add Cafeteria")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main AdminDashboard Component (using standard Tailwind classes) ---
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isAddUserPopupOpen, setIsAddUserPopupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({});
  const [editUserId, setEditUserId] = useState(null);

  const [config, setConfig] = useState(getSystemConfig());
  const [logs, setLogs] = useState(getSystemLogs());

  const [cafeterias, setCafeterias] = useState([]);
  const [newCafeteria, setNewCafeteria] = useState({});
  const [editCafeteriaId, setEditCafeteriaId] = useState(null);
  const [isAddCafeteriaPopupOpen, setIsAddCafeteriaPopupOpen] = useState(false);
  const [cafeteriaLoading, setCafeteriaLoading] = useState(false);
  const [cafeteriaError, setCafeteriaError] = useState(null);

  useEffect(() => {
    let user;
    try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY);
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Failed to parse user session from storage:", error);
        user = null;
    }

    if (!user || user.role !== "admin") {
      navigate("/login");
    } else {
      setCurrentUser(user);
    }

    setUsers(getUsersFromStorage());
    setConfig(getSystemConfig());
    setLogs(getSystemLogs());
    
    // Load cafeterias from database
    loadCafeterias();
  }, [navigate]);

  const loadCafeterias = async () => {
    try {
      setCafeteriaLoading(true);
      setCafeteriaError(null);
      const data = await api.getCafeterias();
      setCafeterias(data);
    } catch (error) {
      console.error("Error loading cafeterias:", error);
      setCafeteriaError(error.message || "Failed to load cafeterias. Please try again.");
    } finally {
      setCafeteriaLoading(false);
    }
  };

  const handleLogout = () => {
    addLogEntry("Admin logged out", currentUser);
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    navigate("/login");
  };

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    saveSystemConfig(newConfig);
    addLogEntry(`Updated system config: ${key} set to ${value}`, currentUser);
  };

  const handleAddOrUpdateUser = () => {
    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!editUserId && users.length >= config.maxUserLimit) {
      alert(`Cannot add user. Maximum user limit of ${config.maxUserLimit} reached.`);
      return;
    }

    let updated;
    const actionType = editUserId ? "updated" : "created";

    if (editUserId) {
      updated = users.map(u =>
        u.id === editUserId ? { ...u, ...newUser, password: newUser.password || u.password } : u
      );
      setEditUserId(null);
    } else {
      const newUserWithId = { id: Date.now(), ...newUser };
      updated = [...users, newUserWithId];
    }

    setUsers(updated);
    saveUsersToStorage(updated);
    addLogEntry(`${newUser.email} user ${actionType}`, currentUser);

    setIsAddUserPopupOpen(false);
    setNewUser({ fullName: "", email: "", password: "", confirmPassword: "", idNumber: "", phone: "", userType: "", status: "Active" });
  };

  const handleToggleBanUser = (user) => {
    const newStatus = user.status === 'Banned' ? 'Active' : 'Banned';
    const updated = users.map(u =>
      u.id === user.id ? { ...u, status: newStatus } : u
    );
    setUsers(updated);
    saveUsersToStorage(updated);
    addLogEntry(`${user.email} status set to ${newStatus}`, currentUser);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      const userToDelete = users.find(u => u.id === id);
      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);
      saveUsersToStorage(updated);
      addLogEntry(`${userToDelete?.email} user deleted`, currentUser);
    }
  };

  const handleAddOrUpdateCafeteria = async () => {
    if (!newCafeteria.name || !newCafeteria.description || !newCafeteria.hours || !newCafeteria.status) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setCafeteriaLoading(true);
      setCafeteriaError(null);
      
      const cafeteriaToSave = editCafeteriaId 
        ? { ...newCafeteria, id: editCafeteriaId }
        : newCafeteria;
      
      const savedCafeteria = await api.saveCafeteria(cafeteriaToSave);
      
      // Update local state
      if (editCafeteriaId) {
        setCafeterias(cafeterias.map(c => c.id === editCafeteriaId ? savedCafeteria : c));
        addLogEntry(`Cafeteria "${savedCafeteria.name}" updated`, currentUser);
      } else {
        setCafeterias([...cafeterias, savedCafeteria]);
        addLogEntry(`Cafeteria "${savedCafeteria.name}" created`, currentUser);
      }
      
      setIsAddCafeteriaPopupOpen(false);
      setNewCafeteria({ name: "", description: "", hours: "", status: "Open" });
      setEditCafeteriaId(null);
    } catch (error) {
      console.error("Error saving cafeteria:", error);
      setCafeteriaError(error.message || "Failed to save cafeteria. Please try again.");
    } finally {
      setCafeteriaLoading(false);
    }
  };

  const handleEditCafeteria = (cafeteria) => {
    setEditCafeteriaId(cafeteria.id);
    setNewCafeteria({ ...cafeteria });
    setIsAddCafeteriaPopupOpen(true);
  };

  const handleDeleteCafeteria = async (id) => {
    if (window.confirm("Are you sure you want to delete this cafeteria? This action cannot be undone.")) {
      try {
        setCafeteriaLoading(true);
        setCafeteriaError(null);
        const cafeteriaToDelete = cafeterias.find(c => c.id === id);
        await api.deleteCafeteria(id);
        setCafeterias(cafeterias.filter((c) => c.id !== id));
        addLogEntry(`Cafeteria "${cafeteriaToDelete?.name}" deleted`, currentUser);
      } catch (error) {
        console.error("Error deleting cafeteria:", error);
        setCafeteriaError(error.message || "Failed to delete cafeteria. Please try again.");
      } finally {
        setCafeteriaLoading(false);
      }
    }
  };

  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to clear all system logs?")) {
      saveSystemLogs([]);
      setLogs([]);
      alert("System logs cleared.");
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "overview":
        const activeUsers = users.filter(u => u.status === 'Active').length;
        const bannedUsers = users.filter(u => u.status === 'Banned').length;
        const openCafeterias = cafeterias.filter(c => c.status === 'Open').length;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <StatCard title="Total Users" value={users.length} icon={Users} color="bg-blue-600" />
            <StatCard title="Active Users" value={activeUsers} icon={Lock} color="bg-green-600" />
            <StatCard title="Banned Users" value={bannedUsers} icon={Ban} color="bg-red-600" />
            <StatCard title="Total Cafeterias" value={cafeterias.length} icon={Settings} color="bg-purple-600" />
            <StatCard title="Open Cafeterias" value={openCafeterias} icon={Settings} color="bg-teal-600" />
            <StatCard title="Max User Capacity" value={`${users.length} / ${config.maxUserLimit}`} icon={BarChart2} color="bg-indigo-600" />
            <StatCard title="Maintenance Mode" value={config.maintenanceMode ? "ON" : "OFF"} icon={ToggleRight} color={config.maintenanceMode ? "bg-yellow-700" : "bg-gray-500"} />
          </div>
        );
      case "manageUsers":
        return (
          <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold">User Management ({users.length} / {config.maxUserLimit})</h2>
              <button
                onClick={() => {
                  setEditUserId(null);
                  setNewUser({ fullName: "", email: "", password: "", confirmPassword: "", idNumber: "", phone: "", userType: config.defaultUserRole, status: "Active" });
                  setIsAddUserPopupOpen(true);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center"
              >
                <Plus size={18} className="mr-2" /> Add User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Full Name</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Email</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left hidden sm:table-cell">ID Number</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">User Type</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border border-gray-300 px-2 sm:px-4 py-4 text-center text-gray-500">No users found.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 font-medium">{u.fullName}</td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 text-gray-600">{u.email}</td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 hidden sm:table-cell">{u.idNumber}</td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${u.userType === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                            {u.userType}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${u.status === 'Active' ? 'bg-green-200 text-green-800' : u.status === 'Banned' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 flex flex-wrap gap-1">
                          <button onClick={() => { setEditUserId(u.id); setNewUser(u); setIsAddUserPopupOpen(true); }} className="bg-yellow-500 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-yellow-600 transition">Edit</button>
                          <button
                            onClick={() => handleToggleBanUser(u)}
                            className={`${u.status === 'Banned' ? 'bg-green-500 hover:bg-green-600' : 'bg-indigo-500 hover:bg-indigo-600'} px-2 sm:px-3 py-1 rounded text-white text-xs transition`}
                          >
                            {u.status === 'Banned' ? 'Unban' : 'Ban'}
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)} className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-red-600 transition">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "systemConfig":
        const ToggleIcon = config.maintenanceMode ? ToggleRight : ToggleLeft;
        return (
          <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">System Configuration</h2>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-300 rounded-lg gap-3">
                <div>
                  <h3 className="font-semibold">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500">Take the entire application offline for updates.</p>
                </div>
                <button
                  onClick={() => handleConfigChange('maintenanceMode', !config.maintenanceMode)}
                  className={`flex items-center px-4 py-2 rounded-full font-bold transition ${config.maintenanceMode ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                >
                  <ToggleIcon className="mr-2" size={20} />
                  {config.maintenanceMode ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              <div className="p-4 border border-gray-300 rounded-lg">
                <h3 className="font-semibold mb-2">Max User Limit</h3>
                <p className="text-sm text-gray-500 mb-2">Set the maximum number of users allowed in the system.</p>
                <input
                  type="number"
                  value={config.maxUserLimit}
                  onChange={(e) => handleConfigChange('maxUserLimit', Math.max(0, parseInt(e.target.value) || 0))}
                  className="border p-2 rounded-lg w-full sm:w-32"
                  min="0"
                />
              </div>

              <div className="p-4 border border-gray-300 rounded-lg">
                <h3 className="font-semibold mb-2">Default New User Role</h3>
                <p className="text-sm text-gray-500 mb-2">The default role assigned to users who sign up.</p>
                <select
                  value={config.defaultUserRole}
                  onChange={(e) => handleConfigChange('defaultUserRole', e.target.value)}
                  className="border p-2 rounded-lg w-full sm:w-auto"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Student">Student</option>
                </select>
              </div>
            </div>
          </div>
        );
      case "activityLogs":
        return (
          <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold">System Activity Logs</h2>
              <button
                onClick={handleClearLogs}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center"
              >
                <ScrollText size={18} className="mr-2" /> Clear Logs
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] border border-gray-300 rounded-lg">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200 sticky top-0">
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left w-1/4">Timestamp</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left w-1/4">User/System</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left w-2/4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="border border-gray-300 px-2 sm:px-4 py-4 text-center text-gray-500">No recent activity logs.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs text-gray-500">{log.timestamp}</td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 font-medium">{log.user}</td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">{log.action}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "manageCafeterias":
        return (
          <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold">Manage Cafeterias ({cafeterias.length})</h2>
              <button
                onClick={() => {
                  setEditCafeteriaId(null);
                  setNewCafeteria({ name: "", description: "", hours: "", status: "Open" });
                  setIsAddCafeteriaPopupOpen(true);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center"
              >
                <Plus size={18} className="mr-2" /> Add New Cafeteria
              </button>
            </div>
            
            {cafeteriaError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {cafeteriaError}
              </div>
            )}
            
            {cafeteriaLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Name</th>
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Description</th>
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Hours</th>
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cafeterias.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="border border-gray-300 px-2 sm:px-4 py-4 text-center text-gray-500">No cafeterias found.</td>
                      </tr>
                    ) : (
                      cafeterias.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 font-medium">{c.name}</td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 text-gray-600">{c.description}</td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2">{c.hours}</td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                              c.status === 'Open' ? 'bg-green-200 text-green-800' : 
                              c.status === 'Closed' ? 'bg-red-200 text-red-800' : 
                              'bg-yellow-200 text-yellow-800'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 flex flex-wrap gap-1">
                            <button 
                              onClick={() => handleEditCafeteria(c)} 
                              className="bg-yellow-500 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-yellow-600 transition flex items-center"
                              disabled={cafeteriaLoading}
                            >
                              <Edit size={14} className="mr-1" /> Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCafeteria(c.id)} 
                              className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-red-600 transition flex items-center"
                              disabled={cafeteriaLoading}
                            >
                              <Trash2 size={14} className="mr-1" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      default:
        return <div className="p-4 sm:p-6 text-gray-500">Select a navigation tab.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white flex flex-col p-4 shadow-2xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 h-screen`}>
        <div className="flex justify-between items-center mb-8">
          <div className="text-xl sm:text-2xl font-bold flex items-center text-indigo-400 border-b border-gray-700 pb-4">
            <LayoutDashboard className="mr-2" /> Admin Panel
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-grow">
          <button onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }} className={`flex items-center p-3 rounded-lg mb-2 w-full text-left font-medium ${activeTab === "overview" ? "bg-indigo-600" : "hover:bg-gray-700"} transition`}>
            <BarChart2 size={20} className="mr-3" /> Overview
          </button>
          <button onClick={() => { setActiveTab("manageUsers"); setSidebarOpen(false); }} className={`flex items-center p-3 rounded-lg mb-2 w-full text-left font-medium ${activeTab === "manageUsers" ? "bg-indigo-600" : "hover:bg-gray-700"} transition`}>
            <Users size={20} className="mr-3" /> Manage Users
          </button>
          <button onClick={() => { setActiveTab("manageCafeterias"); setSidebarOpen(false); }} className={`flex items-center p-3 rounded-lg mb-2 w-full text-left font-medium ${activeTab === "manageCafeterias" ? "bg-indigo-600" : "hover:bg-gray-700"} transition`}>
            <Settings size={20} className="mr-3" /> Manage Cafeterias
          </button>
          <button onClick={() => { setActiveTab("systemConfig"); setSidebarOpen(false); }} className={`flex items-center p-3 rounded-lg mb-2 w-full text-left font-medium ${activeTab === "systemConfig" ? "bg-indigo-600" : "hover:bg-gray-700"} transition`}>
            <Settings size={20} className="mr-3" /> System Config
          </button>
          <button onClick={() => { setActiveTab("activityLogs"); setSidebarOpen(false); }} className={`flex items-center p-3 rounded-lg mb-2 w-full text-left font-medium ${activeTab === "activityLogs" ? "bg-indigo-600" : "hover:bg-gray-700"} transition`}>
            <ScrollText size={20} className="mr-3" /> Activity Logs
          </button>

          <div className="pt-4 mt-4 border-t border-gray-700">
            <button onClick={() => { setIsProfileOpen(true); setSidebarOpen(false); }} className="flex items-center p-3 rounded-lg mb-2 w-full text-left font-medium hover:bg-gray-700 transition">
              <Lock size={20} className="mr-3" /> Profile Settings
            </button>
          </div>
        </nav>

        <button onClick={handleLogout} className="mt-4 p-3 bg-red-500 text-white rounded-lg flex items-center justify-center font-medium hover:bg-red-600 transition">
          <LogOut size={20} className="mr-2" /> Logout
        </button>

        {currentUser && (
          <div className="text-center text-xs text-gray-400 mt-2">
            Logged in as: {currentUser.fullName || currentUser.email}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-800 text-white"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {activeTab === 'systemConfig' ? 'System Configuration' : 
             activeTab === 'activityLogs' ? 'Activity Logs' : 
             activeTab === 'manageCafeterias' ? 'Manage Cafeterias' : 
             activeTab === 'manageUsers' ? 'Manage Users' : 
             'Overview Dashboard'}
          </h1>
        </div>

        {/* Desktop Header */}
        <header className="hidden lg:block mb-8">
          <h1 className="text-3xl font-bold text-gray-800 capitalize">
            {activeTab === 'systemConfig' ? 'System Configuration' : 
             activeTab === 'activityLogs' ? 'Activity Logs' : 
             activeTab === 'manageCafeterias' ? 'Manage Cafeterias' : 
             activeTab === 'manageUsers' ? 'Manage Users' : 
             'Overview Dashboard'}
          </h1>
          <p className="text-gray-500">Welcome back, {currentUser?.fullName || 'Admin'}! You are the system controller.</p>
        </header>
        
        {renderMainContent()}
      </main>

      {/* Modals */}
      <ProfilePopup
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      <AddUserPopup
        isOpen={isAddUserPopupOpen}
        onClose={() => setIsAddUserPopupOpen(false)}
        onSaveUser={handleAddOrUpdateUser}
        newUser={newUser}
        setNewUser={setNewUser}
        editUserId={editUserId}
      />

      <AddCafeteriaPopup
        isOpen={isAddCafeteriaPopupOpen}
        onClose={() => setIsAddCafeteriaPopupOpen(false)}
        onSaveCafeteria={handleAddOrUpdateCafeteria}
        newCafeteria={newCafeteria}
        setNewCafeteria={setNewCafeteria}
        editCafeteriaId={editCafeteriaId}
        isLoading={cafeteriaLoading}
      />
    </div>
  );
};

export default AdminDashboard;