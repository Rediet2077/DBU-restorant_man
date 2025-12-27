import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import { CartProvider } from "./context/CartContext"; 
import ProtectedRoute from "./pages/AdminDashboard/ProtectedRoute";

// Pages
import Home from "./pages/Home/Home";
import AboutUs from "./pages/AboutUs/AboutUs";
import Service from "./pages/Service/Service";
import Login from "./pages/Login/Login";
import ContactUs from "./pages/ContactUs/ContactUs";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import UserDashboard from "./pages/AdminDashboard/UserDashboard.jsx"; // Added .jsx extension
import OrderPage from "./pages/Service/OrderPage";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/Login/ForgotPassword";
import CafeMenu from "./pages/Service/CafeMenu"; 
import ManagerDashboard from "./pages/AdminDashboard/ManagerDashboard";
import OtpVerification from "./Components/OtpVerification";

// Define the base location for the redirect
const DEFAULT_MANAGER_LOCATION = "Female Launch System (Abay)";

function App() {
  return (
    <CartProvider>         
      <Router>
        <Navbar />

        <main style={{ minHeight: "85vh", padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/service" element={<Service />} />
            <Route path="/order/:cafeId" element={<OrderPage />} />
            <Route path="/login/:cafeId" element={<Login />} />
            <Route path="/login/" element={<Login />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/cafe-menu/:cafeId" element={<CafeMenu />} />
            <Route path="/otp-verify" element={<OtpVerification />} />

            {/* Admin Dashboard - Protected */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* User Dashboard - Protected */}
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute role="user">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* Manager Dashboard - Redirect to default location */}
            <Route
              path="/manager-dashboard"
              element={
                <ProtectedRoute role="manager">
                  <Navigate to={`/dashboard/${DEFAULT_MANAGER_LOCATION}`} replace />
                </ProtectedRoute>
              }
            />

            {/* Dynamic Manager Dashboard Routes for all cafeterias */}
            <Route
              path="/dashboard/:locationName"
              element={
                <ProtectedRoute role="manager">
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </Router>
    </CartProvider>
  );
}

export default App;