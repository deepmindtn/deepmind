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

const readStoredRole = () => {
  try {
    const me = JSON.parse(localStorage.getItem("me") || "{}");
    return me?.role || null;
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isValid, setIsValid] = useState(null); // null = checking, true/false = result
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [resolvedRole, setResolvedRole] = useState(null);

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
        const role = readStoredRole() || decoded.role || decoded.user_role || null;
        setResolvedRole(role);

        if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
          const authorized = allowedRoles.includes(role);
          setIsAuthorized(authorized);
          if (!authorized) {
            toast.error("You do not have permission to access this page.");
          }
        } else {
          setIsAuthorized(true);
        }

        setIsValid(true);
      }
    };

    checkToken();
  }, [allowedRoles]);

  if (isValid === null) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorized) {
    const fallbackPath = resolvedRole === "HR" ? "/dashboard" : "/surveys";
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
