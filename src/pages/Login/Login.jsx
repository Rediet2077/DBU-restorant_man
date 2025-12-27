import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) return setError("Please fill in all fields!");

    try {
      const response = await fetch("http://localhost:80/DBU-APII/dbu-api/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!result.success) {
        return setError(result.message || "Email or password is incorrect!");
      }

      // If user not verified, redirect to OTP page
      if (result.is_verified === 0) {
        navigate("/otp-verify", { state: { email } });
        return;
      }

      // Save user info to sessionStorage
      sessionStorage.setItem(
        "currentUser",
        JSON.stringify({
          email: result.email,
          fullName: result.fullName,
          phone: result.phone,
          idNumber: result.idNumber,
          role: result.role,
        })
      );

      // Redirect to dashboard based on role
      if (result.role === "admin") {
        navigate("/admin/dashboard");
      } else if (result.role === "manager") {
        navigate("/manager-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="w-[380px] bg-white p-10 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login</h2>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-3 border rounded-md text-gray-700 border-gray-300 focus:ring focus:ring-blue-300 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-3 border rounded-md text-gray-700 border-gray-300 focus:ring focus:ring-blue-300 outline-none"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex justify-between gap-3 mt-3">
          <button type="button" onClick={() => navigate("/forgot-password")} className="text-blue-600 font-semibold hover:underline">
            Forgot Password?
          </button>

          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Login
          </button>
        </div>

        <div className="flex justify-center items-center gap-3 mt-6">
          <h2 className="text-gray-700 text-sm">New User?</h2>
          <button type="button" onClick={() => navigate("/register")} className="px-4 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition">
            Register
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
