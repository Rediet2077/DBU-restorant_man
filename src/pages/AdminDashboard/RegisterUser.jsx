// src/pages/Register/Register.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword || !idNumber || !phone) {
      setError("Please fill all fields!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost/dbu-api/register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
          idNumber,
          phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);

        navigate("/otp-verify", {
          state: { email: email }, // ✅ passing email to OTP page
        });
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      setError("An unexpected error occurred. Is the server running?");
    }
  };

  return (
    <div className="max-w-[350px] mx-auto mt-8 bg-white shadow-lg p-5 rounded-xl text-center font-[Poppins]">
      <h2 className="text-xl font-bold text-gray-800 mb-5">Register</h2>

      <form onSubmit={handleRegister}>
        <div className="flex items-center mb-3">
          <label className="text-gray-700 text-xs font-semibold w-24 mr-3 text-right">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter Your Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:border-amber-500 outline-none transition"
          />
        </div>

        <div className="flex items-center mb-3">
          <label className="text-gray-700 text-xs font-semibold w-24 mr-3 text-right">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:border-amber-500 outline-none transition"
          />
        </div>

        <div className="flex items-center mb-3">
          <label className="text-gray-700 text-xs font-semibold w-24 mr-3 text-right">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:border-amber-500 outline-none transition"
          />
        </div>

        <div className="flex items-center mb-3">
          <label className="text-gray-700 text-xs font-semibold w-24 mr-3 text-right">
            Confirm
          </label>
          <input
            type="password"
            placeholder="Confirm Your Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:border-amber-500 outline-none transition"
          />
        </div>

        <div className="flex items-center mb-3">
          <label className="text-gray-700 text-xs font-semibold w-24 mr-3 text-right">
            ID Number
          </label>
          <input
            type="text"
            placeholder="Enter Your ID"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:border-amber-500 outline-none transition"
          />
        </div>

        <div className="flex items-center mb-5">
          <label className="text-gray-700 text-xs font-semibold w-24 mr-3 text-right">
            Phone
          </label>
          <input
            type="tel"
            placeholder="Enter Your Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            pattern="^(\+251|0)[1-9][0-9]{8}$"
            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:border-amber-500 outline-none transition"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-md transition-transform hover:scale-105"
        >
          Register
        </button>
      </form>

      <p className="mt-4 text-gray-600 text-xs">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-amber-500 font-semibold cursor-pointer hover:text-amber-600"
        >
          Login here
        </span>
      </p>
    </div>
  );
}

export default Register;
  