import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, User, BarChart2, Users, Lock, X } from "lucide-react";
import {
  CAFETERIA_LOCATIONS,
  USER_STORAGE_KEY,
  getUsersFromStorage,
  saveUsersToStorage,
  getManagersFromStorage,
  saveManagersToStorage,
} from "../../services/Service";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-6 rounded-xl shadow-xl flex items-center text-white ${color}`}>
    <Icon size={36} className="opacity-75 mr-4" />
    <div>
      <p className="text-sm font-light uppercase">{title}</p>
      <p className="text-4xl font-extrabold">{value}</p>
    </div>
  </div>
);

// Add User Popup Component (with Admin option)
const AddUserPopup = ({ isOpen, onClose, onAddUser, newUser, setNewUser }) => {
  if (!isOpen) return null;

  const handleAddAndClose = () => {
    onAddUser();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-xl shadow-2xl w-full max-w-lg mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-semibold mb-3">Add New User</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="ID Number"
            value={newUser.Id}
            onChange={(e) => setNewUser({ ...newUser, Id: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            value={newUser.fullName}
            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <select
            value={newUser.userType}
            onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}
            className="border p-2 rounded-lg"
            required
          >
            <option value="" disabled>User Type</option>
            <option value="Student">Student</option>
            <option value="Admin">Admin</option>
            {CAFETERIA_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <input
            type="tel"
            placeholder="Phone Number"
            value={newUser.Phone}
            onChange={(e) => setNewUser({ ...newUser, Phone: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <select
            value={newUser.status}
            onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
            className="border p-2 rounded-lg"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded-lg">
              Cancel
            </button>
            <button onClick={handleAddAndClose} className="bg-green-500 text-white px-4 py-2 rounded-lg">
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddUserPopupOpen, setIsAddUserPopupOpen] = useState(false);
  const [users, setUsers] = useState(getUsersFromStorage());
  const [newUser, setNewUser] = useState({ 
    Id: "",
    fullName: "", 
    username: "", 
    password: "", 
    userType: "",
    Phone: "",
    status: "Active",
  });
  const [editUserId, setEditUserId] = useState(null);
  const [managers, setManagers] = useState(getManagersFromStorage());
  const [newManager, setNewManager] = useState({ username: "", email: "", password: "", location: "" });
  const [editManagerId, setEditManagerId] = useState(null);
  const [profile, setProfile] = useState({
    username: "",
    password: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    const currentUsers = getUsersFromStorage();
    const needsMigration = currentUsers.some(user => !user.hasOwnProperty('status'));
    if (needsMigration) {
        const migratedUsers = currentUsers.map(user => ({ ...user, status: user.status || 'Active' }));
        setUsers(migratedUsers);
        saveUsersToStorage(migratedUsers);
    }
  }, []);

  useEffect(() => {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    if (user) {
      const parsed = JSON.parse(user);
      setCurrentUser(parsed);
      setProfile({
        username: parsed.username || "",
        password: "",
        newPassword: "",
        confirmPassword: ""
      });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    navigate("/login");
  };

  if (!currentUser) return null;

  const handleAddUser = () => {
    if (!newUser.Id || !newUser.fullName || !newUser.username || !newUser.password || !newUser.userType  || !newUser.Phone) {
        alert("Please fill in all fields.");
        return;
    }
    if (users.some(u => u.username === newUser.username)) {
        alert(`User with username '${newUser.username}' already exists.`);
        return;
    }
    const updated = [...users, { id: Date.now(), ...newUser, role: "user" }];
    setUsers(updated);
    saveUsersToStorage(updated);
    setNewUser({ Id: "" ,fullName: "", username: "", password: "", userType: "" ,Phone: "", status: "Active" });
  };

  const handleEditUser = (id) => {
    const u = users.find((u) => u.id === id);
    setNewUser({ Id:u.Id, fullName: u.fullName, username: u.username, password: "", userType: u.userType, Phone:u.Phone, status: u.status });
    setEditUserId(id);
  };

  const handleUpdateUser = () => {
    if (!newUser.Id || !newUser.fullName || !newUser.username || !newUser.userType || !newUser.Phone) {
        alert("ID, Full Name, Username, and User Type are required for update.");
        return;
    }
    const updated = users.map((u) => {
      if (u.id === editUserId) {
        const updatedUser = { ...u, Id:newUser.Id, fullName: newUser.fullName, username: newUser.username, userType: newUser.userType, Phone: newUser.Phone, status: newUser.status };
        if (newUser.password) updatedUser.password = newUser.password;
        return updatedUser;
      }
      return u;
    });
    setUsers(updated);
    saveUsersToStorage(updated);
    setNewUser({Id: "", fullName: "", username: "", password: "", userType: "" ,Phone: "", status: "Active"});
    setEditUserId(null);
  };

  const handleDeleteUser = (id) => {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    saveUsersToStorage(updated);
  };
  
  const handleAddManager = () => { /* ... */ };
  const handleEditManager = (id) => { /* ... */ };
  const handleUpdateManager = () => { /* ... */ };
  const handleDeleteManager = (id) => { /* ... */ };

  const handleSaveProfile = () => {
    // Validate inputs
    if (!profile.username) {
      alert("Username is required!");
      return;
    }
    
    if (showPasswordFields) {
      if (!profile.password) {
        alert("Current password is required to change password!");
        return;
      }
      
      if (profile.newPassword !== profile.confirmPassword) {
        alert("New passwords do not match!");
        return;
      }
      
      // In a real app, you would verify the current password with the backend
      // For this demo, we'll just update the profile
    }
    
    // Update the profile
    const updatedProfile = {
      ...currentUser,
      username: profile.username
    };
    
    // If password change is requested, add it to the profile
    if (showPasswordFields && profile.newPassword) {
      updatedProfile.password = profile.newPassword;
    }
    
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedProfile));
    setCurrentUser(updatedProfile);
    setProfile({
      ...profile,
      password: "",
      newPassword: "",
      confirmPassword: ""
    });
    setShowPasswordFields(false);
    alert("Profile updated successfully!");
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Users" value={users.length} icon={Users} color="bg-blue-600" />
            <StatCard title="Total Orders" value="32" icon={BarChart2} color="bg-green-600" />
            <StatCard title="Active Tickets" value="5" icon={Lock} color="bg-yellow-600" />
          </div>
        );

      case "manageUsers":
        return (
          <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Manage Users (Students)</h2>
              <button onClick={() => setIsAddUserPopupOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg">
                Add User
              </button>
            </div>
            
            {editUserId && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                    <h3 className="font-semibold mb-2">Editing User: {newUser.fullName}</h3>
                    <div className="flex gap-2 flex-wrap">
                        <input type="text" placeholder="ID" value={newUser.Id} onChange={(e) => setNewUser({ ...newUser, Id: e.target.value })} className="border p-2 rounded-lg" required />
                        <input type="text" placeholder="Full Name" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} className="border p-2 rounded-lg" required />
                        <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="border p-2 rounded-lg" required />
                        <input type="password" placeholder="New Password (optional)" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="border p-2 rounded-lg" />
                        <select value={newUser.userType} onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })} className="border p-2 rounded-lg" required>
                          <option value="" disabled>User Type</option>
                          <option value="Student">Student</option>
                          <option value="Admin">Admin</option>
                          {CAFETERIA_LOCATIONS.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
                        </select>
                        <input type="tel" placeholder="Phone" value={newUser.Phone} onChange={(e) => setNewUser({ ...newUser, Phone: e.target.value })} className="border p-2 rounded-lg" required />
                        <select value={newUser.status} onChange={(e) => setNewUser({ ...newUser, status: e.target.value })} className="border p-2 rounded-lg"><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
                        <button onClick={handleUpdateUser} className="bg-yellow-500 text-white px-4 rounded-lg">Update</button>
                        <button onClick={() => { setEditUserId(null); setNewUser({Id: "", fullName: "", username: "", password: "", userType: "" ,Phone: "", status: "Active"}); }} className="bg-gray-400 text-white px-4 rounded-lg">Cancel</button>
                    </div>
                </div>
            )}

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-1 py-1 text-left">ID</th>
                  <th className="border px-1 py-1 text-left">Full Name</th>
                  <th className="border px-1 py-1 text-left">Username</th>
                  <th className="border px-1 py-1 text-left">User Type</th>
                  <th className="border px-1 py-1 text-left">Password</th>
                  <th className="border px-1 py-1 text-left">Phone</th>
                  <th className="border px-1 py-1 text-left">Status</th>
                  <th className="border px-1 py-1 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="border px-1 py-1">{u.Id}</td>
                    <td className="border px-1 py-1">{u.fullName}</td>
                    <td className="border px-1 py-1">{u.username}</td>
                    <td className="border px-1 py-1">{u.userType}</td>
                    <td className="border px-1 py-1">*******</td>
                    <td className="border px-1 py-1">{u.Phone}</td>
                    <td className="border px-1 py-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="border px-1 py-1 flex gap-1">
                      <button onClick={() => handleEditUser(u.id)} className="bg-yellow-400 px-2 py-1 rounded text-white text-xs">Edit</button>
                      <button onClick={() => handleDeleteUser(u.id)} className="bg-red-500 px-2 py-1 rounded text-white text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "profileSettings":
        return (
          <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Profile Settings</h2>
            <div className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Username" 
                value={profile.username} 
                onChange={(e) => setProfile({ ...profile, username: e.target.value })} 
                className="border p-2 rounded-lg" 
              />
              
              <button 
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="text-blue-600 text-left hover:underline"
              >
                {showPasswordFields ? "Cancel Password Change" : "Change Password"}
              </button>
              
              {showPasswordFields && (
                <>
                  <input 
                    type="password" 
                    placeholder="Current Password" 
                    value={profile.password} 
                    onChange={(e) => setProfile({ ...profile, password: e.target.value })} 
                    className="border p-2 rounded-lg" 
                  />
                  <input 
                    type="password" 
                    placeholder="New Password" 
                    value={profile.newPassword} 
                    onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })} 
                    className="border p-2 rounded-lg" 
                  />
                  <input 
                    type="password" 
                    placeholder="Confirm New Password" 
                    value={profile.confirmPassword} 
                    onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })} 
                    className="border p-2 rounded-lg" 
                  />
                </>
              )}
              
              <button onClick={handleSaveProfile} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Save Changes</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-2xl">
        {/* Logo and Title */}
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-grow">
          <button onClick={() => setActiveTab("overview")} className={`flex items-center p-3 rounded-lg mb-2 w-full font-medium ${activeTab === "overview" ? "bg-indigo-600" : "hover:bg-gray-700"}`}><BarChart2 size={20} className="mr-3" /> Overview</button>
          <button onClick={() => setActiveTab("manageUsers")} className={`flex items-center p-3 rounded-lg mb-2 w-full font-medium ${activeTab === "manageUsers" ? "bg-indigo-600" : "hover:bg-gray-700"}`}><Users size={20} className="mr-3" /> Manage Users</button>
          <button onClick={() => setActiveTab("profileSettings")} className={`flex items-center p-3 rounded-lg mb-2 w-full font-medium ${activeTab === "profileSettings" ? "bg-indigo-600" : "hover:bg-gray-700"}`}><User size={20} className="mr-3" /> Profile Settings</button>
        </nav>

        {/* Logout Button in Sidebar - Enhanced Style */}
        <button 
          onClick={handleLogout} 
          className="mt-auto p-3 bg-red-600 rounded-lg flex items-center justify-center font-medium hover:bg-red-700 transition-all duration-300 border-2 border-red-700"
        >
          <LogOut size={20} className="mr-2" />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header with Welcome Message and Logout Button */}
        <div className="bg-white shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <LayoutDashboard size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {currentUser.username}</p>
            </div>
          </div>
          
          {/* Logout Button in Top Header */}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderMainContent()}
          
          <AddUserPopup
            isOpen={isAddUserPopupOpen}
            onClose={() => setIsAddUserPopupOpen(false)}
            onAddUser={handleAddUser}
            newUser={newUser}
            setNewUser={setNewUser}
          />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;