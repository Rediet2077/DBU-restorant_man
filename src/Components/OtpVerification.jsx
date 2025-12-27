// src/Components/OtpVerification.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function OtpVerification() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {}; // Email passed from registration

  useEffect(() => {
    if (!email) {
      navigate("/register"); // redirect if email not available
    }
  }, [email, navigate]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:80/DBU-APII/dbu-api/verify_otp.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (result.success) {
        // ✅ Save user info in sessionStorage for ProtectedRoute
        sessionStorage.setItem(
          "currentUser",
          JSON.stringify({
            email: result.username || email, // email
            fullName: result.fullName,
            phone: result.phone,
            idNumber: result.idNumber,
            role: "user", // important for ProtectedRoute
          })
        );

        setMessage(result.message || "OTP verified successfully!");

        // Navigate to UserDashboard
        setTimeout(() => {
          navigate("/user-dashboard");
        }, 800);
      } else {
        setMessage(result.message || "Invalid OTP. Try again.");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch("http://localhost/DBU-APII/dbu-api/resend_otp.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      setMessage(result.message || "OTP resent successfully.");
    } catch (err) {
      console.error("Resend OTP Error:", err);
      setMessage("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="max-w-[400px] mx-auto mt-12 bg-white shadow-xl p-6 rounded-xl text-center font-[Poppins]">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Verify Your Email</h2>
      <p className="text-gray-600 mb-4">
        An OTP has been sent to your email: <strong>{email}</strong>
      </p>

      <form onSubmit={handleVerifyOtp}>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength="6"
          className="w-full p-2.5 border rounded-md mb-2 text-[15px] focus:border-amber-500 outline-none transition text-center"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-md mt-2 transition-transform hover:scale-105"
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-red-500">{message}</p>}

      <p className="mt-4 text-gray-600 text-[14px]">
        Didn't receive the code?{" "}
        <span
          onClick={handleResendOtp}
          className="text-amber-500 font-semibold cursor-pointer hover:text-amber-600"
        >
          Resend OTP
        </span>
      </p>
    </div>
  );
}

export default OtpVerification;
