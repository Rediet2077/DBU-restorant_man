import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, BarChart2, Users, Lock, X, Settings } from "lucide-react";
import { getUsersFromStorage, saveUsersToStorage, USER_STORAGE_KEY } from "../../services/Service";

// StatCard component
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-6 rounded-xl shadow-lg flex items-center text-white ${color} transform transition-transform hover:scale-105`}>
    <Icon size={36} className="opacity-75 mr-4" />
    <div>
      <p className="text-sm font-light uppercase">{title}</p>
      <p className="text-4xl font-extrabold">{value}</p>
    </div>
  </div>
);

// Add/Edit User Popup
const AddUserPopup = ({ isOpen, onClose, onSaveUser, newUser, setNewUser, editUserId }) => {
  if (!isOpen) return null;

  const handleSaveAndClose = () => {
    onSaveUser();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-semibold mb-4">{editUserId ? "Edit User" : "Add New User"}</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Full Name"
            value={newUser.fullName || ""}
            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email || ""}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password || ""}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="border p-2 rounded-lg"
            required={!editUserId}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={newUser.confirmPassword || ""}
            onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
            className="border p-2 rounded-lg"
            required={!editUserId}
          />
          <input
            type="text"
            placeholder="ID Number"
            value={newUser.idNumber || ""}
            onChange={(e) => setNewUser({ ...newUser, idNumber: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={newUser.phone || ""}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            pattern="^(\+251|0)[1-9][0-9]{8}$"
            className="border p-2 rounded-lg"
            required
          />
          <select
            value={newUser.userType || ""}
            onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}
            className="border p-2 rounded-lg"
            required
          >
            <option value="" disabled>User Type</option>
            <option value="Admin">Admin</option>
            <option value="Student">Student</option>
          </select>
          <select
            value={newUser.status || "Active"}
            onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
            className="border p-2 rounded-lg"
            required
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                onClose();
                setNewUser({
                  fullName: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  idNumber: "",
                  phone: "",
                  userType: "",
                  status: "Active",
                });
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
            >
              Cancel
            </button>
            <button onClick={handleSaveAndClose} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
              {editUserId ? "Update User" : "Add User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Settings Popup
const ProfilePopup = ({ isOpen, onClose, currentUser, setCurrentUser }) => {
  const [profile, setProfile] = useState(currentUser || {});

  useEffect(() => {
    setProfile(currentUser || {});
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedProfile = { ...profile };
    delete updatedProfile.confirmPassword;

    if (!profile.password) {
      updatedProfile.password = currentUser.password;
    }

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedProfile));
    setCurrentUser(updatedProfile);
    onClose();
    alert("Profile updated successfully!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md mx-4 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-semibold mb-4">Profile Settings</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Full Name"
            value={profile.fullName || ""}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            className="border p-2 rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={profile.email || ""}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="border p-2 rounded-lg"
          />
          <input
            type="password"
            placeholder="New Password"
            value={profile.password || ""}
            onChange={(e) => setProfile({ ...profile, password: e.target.value })}
            className="border p-2 rounded-lg"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={profile.confirmPassword || ""}
            onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
            className="border p-2 rounded-lg"
          />

          <div className="flex justify-end gap-2 mt-3">
            <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition">Cancel</button>
            <button
              onClick={() => {
                if (profile.password && profile.password !== profile.confirmPassword) {
                  alert("Passwords do not match!");
                  return;
                }
                handleSave();
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// AdminDashboard Component
const AdminDashboard = ({ setCurrentRoute }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [isAddUserPopupOpen, setIsAddUserPopupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [users, setUsers] = useState(getUsersFromStorage().filter(u => u.userType !== "Manager"));
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    idNumber: "",
    phone: "",
    userType: "",
    status: "Active",
  });
  const [editUserId, setEditUserId] = useState(null);

  // Load current user
  useEffect(() => {
    const user =
      JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) ||
      JSON.parse(sessionStorage.getItem(USER_STORAGE_KEY));

    if (!user || user.role !== "admin") {
      navigate("/login");
    } else {
      setCurrentUser(user);
    }
  }, [navigate]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    navigate("/login");
  };

  const handleAddOrUpdateUser = () => {
    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (editUserId) {
      const updated = users.map(u =>
        u.id === editUserId ? { ...u, ...newUser, password: newUser.password || u.password } : u
      );
      setUsers(updated);
      saveUsersToStorage(updated);
      setEditUserId(null);
    } else {
      const updated = [...users, { id: Date.now(), ...newUser }];
      setUsers(updated);
      saveUsersToStorage(updated);
    }

    setNewUser({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      idNumber: "",
      phone: "",
      userType: "",
      status: "Active",
    });
  };

  const handleEditUser = (id) => {
    const u = users.find((u) => u.id === id);
    setNewUser({ ...u, password: "", confirmPassword: "" });
    setEditUserId(id);
    setIsAddUserPopupOpen(true);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);
      saveUsersToStorage(updated);
    }
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
              <h2 className="text-2xl font-semibold">Manage Users</h2>
              <button
                onClick={() => setIsAddUserPopupOpen(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Add User
              </button>
            </div>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-1 py-1">Full Name</th>
                  <th className="border px-1 py-1">Email</th>
                  <th className="border px-1 py-1">Password</th>
                  <th className="border px-1 py-1">ID Number</th>
                  <th className="border px-1 py-1">Phone</th>
                  <th className="border px-1 py-1">User Type</th>
                  <th className="border px-1 py-1">Status</th>
                  <th className="border px-1 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="border px-1 py-1">{u.fullName}</td>
                    <td className="border px-1 py-1">{u.email}</td>
                    <td className="border px-1 py-1">*******</td>
                    <td className="border px-1 py-1">{u.idNumber}</td>
                    <td className="border px-1 py-1">{u.phone}</td>
                    <td className="border px-1 py-1">{u.userType}</td>
                    <td className="border px-1 py-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="border px-1 py-1 flex gap-1">
                      <button onClick={() => handleEditUser(u.id)} className="bg-yellow-400 px-2 py-1 rounded text-white text-xs hover:bg-yellow-500 transition">Edit</button>
                      <button onClick={() => handleDeleteUser(u.id)} className="bg-red-500 px-2 py-1 rounded text-white text-xs hover:bg-red-600 transition">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <AddUserPopup
              isOpen={isAddUserPopupOpen}
              onClose={() => setIsAddUserPopupOpen(false)}
              onSaveUser={handleAddOrUpdateUser}
              newUser={newUser}
              setNewUser={setNewUser}
              editUserId={editUserId}
            />
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
        <div className="text-2xl font-bold mb-8 flex items-center text-indigo-400">
          <LayoutDashboard className="mr-2" /> Admin Panel
        </div>

        <nav className="flex-grow">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center p-3 rounded-lg mb-2 w-full font-medium ${activeTab === "overview" ? "bg-indigo-600" : "hover:bg-gray-700"} transition`}
          >
            <BarChart2 size={20} className="mr-3" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("manageUsers")}
            className={`flex items-center p-3 rounded-lg mb-2 w-full font-medium ${activeTab === "manageUsers" ? "bg-indigo-600" : "hover:bg-gray-700"} transition`}
          >
            <Users size={20} className="mr-3" /> Manage Users
          </button>
          <button onClick={() => setIsProfileOpen(true)} className="flex items-center p-3 rounded-lg mb-2 w-full font-medium hover:bg-gray-700 transition">
            <Settings size={20} className="mr-3" /> Profile Settings
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto p-3 bg-red-500 rounded-lg flex items-center justify-center font-medium hover:bg-red-600 transition">
          <LogOut size={20} className="mr-2" /> Logout
        </button>
      </div>

      <main className="flex-1 p-8">{renderMainContent()}</main>

      <ProfilePopup isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} currentUser={currentUser} setCurrentUser={setCurrentUser} />
    </div>
  );
};

export default AdminDashboard;
