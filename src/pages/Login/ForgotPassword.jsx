import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = () => {
    // Reset any previous errors
    setError("");
    
    // Validate inputs
    if (!username || !newPassword || !confirmPassword) {
      setError("Please fill in all fields!");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password do not match!");
      return;
    }

    // Find user by username in localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((u) => u.username === username);

    if (userIndex === -1) {
      setError("Username not found! Please check again.");
      return;
    }

    // Update the user's password
    users[userIndex].password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));

    // Show success message and redirect
    alert("Password reset successful! Please login with your new password.");
    navigate("/login");
  };

  return (
    <div className="w-[380px] mx-auto mt-[100px] p-6 bg-white rounded-xl shadow-lg text-center font-sans">
      <h2 className="mb-5 text-2xl font-semibold text-gray-800">
        Reset Password
      </h2>

      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-[92%] p-3 mt-3 border border-gray-400 rounded-lg text-base focus:border-blue-500 focus:shadow-md outline-none transition-all duration-300"
      />

      <input
        type="password"
        placeholder="New Password (min 6 chars)"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-[92%] p-3 mt-3 border border-gray-400 rounded-lg text-base focus:border-blue-500 focus:shadow-md outline-none transition-all duration-300"
      />

      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-[92%] p-3 mt-3 border border-gray-400 rounded-lg text-base focus:border-blue-500 focus:shadow-md outline-none transition-all duration-300"
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        onClick={handleResetPassword}
        className="w-full p-3 mt-5 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-lg cursor-pointer transition-all duration-300 font-medium"
      >
        Reset Password
      </button>

      <p className="mt-4 text-gray-700">
        Back to{" "}
        <span
          className="font-semibold text-blue-600 cursor-pointer no-underline hover:no-underline"
          onClick={() => navigate("/login")}
        >
          Login
        </span>
      </p>
    </div>
  );
}

export default ForgotPassword;