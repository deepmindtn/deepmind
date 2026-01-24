// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

// Helper to decode JWT without extra dependencies
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null); // null = checking, true/false = result

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("access");
      if (!token) {
        setIsValid(false);
        return;
      }

      const decoded = parseJwt(token);
      const now = Date.now() / 1000;

      if (!decoded || decoded.exp < now) {
        // Token expired
        localStorage.clear();
        toast.info("Session expired. Please log in again.");
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    };

    checkToken();
  }, []);

  if (isValid === null) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
