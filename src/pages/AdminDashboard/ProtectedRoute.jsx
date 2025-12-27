import React from "react";
import { Navigate } from "react-router-dom";
import { USER_STORAGE_KEY } from "../../services/Service";

function ProtectedRoute({ children, role }) {
  // Check for admin in localStorage
  const adminUser = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  
  // Check for regular users/managers in sessionStorage
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  // Determine which user is logged in
  const loggedInUser = adminUser || currentUser;

  if (!loggedInUser) {
    return <Navigate to="/login" replace />;
  }

  if (role && loggedInUser.role !== role) {
    // If specific role is required and doesn't match, redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;